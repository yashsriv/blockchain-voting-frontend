import { Component, EventEmitter, Input, Output } from '@angular/core';
import { from, throwError, of } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';

import { phrase } from 'friendly-phrase';

import { PlatformService } from 'src/app/services/platform.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss'],
})
export class VotingComponent {
  @Input() adminKey: CryptoKey;
  @Input() isAdmin: boolean;
  @Input() candidates: string[];
  @Input() candidateKeys: { [key: string]: CryptoKey };
  @Output() votingEnded = new EventEmitter();

  loading = false;
  voted = false;
  votePassphrase: string;
  votedFor: string;
  voteStr: string;
  alreadyVoted: boolean;

  constructor(private platform: PlatformService) {}

  endVoting() {
    this.loading = true;
    this.platform.endVoting().subscribe(_ => {
      this.loading = false;
      this.votingEnded.emit();
    });
  }

  vote(candidate: string) {
    this.loading = true;
    from(this.generateVote(candidate))
      .pipe(
        tap(([passphrase, _]) => (this.votePassphrase = passphrase)),
        switchMap(([_, vote]) =>
          this.platform.vote(vote).pipe(
            map(_ => vote),
            catchError((err: HttpErrorResponse) => {
              if (err.status === 409) {
                this.alreadyVoted = true;
                return of('');
              } else {
                return throwError(err);
              }
            })
          )
        ),
        tap(vote => {
          this.voted = true;
          this.voteStr = vote;
        })
      )
      .subscribe(() => (this.loading = false));
  }

  private async generateVote(candidate: string): Promise<[string, string]> {
    const cKey = this.candidateKeys[candidate];
    const aKey = this.adminKey;

    const passphrase = phrase('-').toLowerCase();

    const cEncrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      cKey,
      new TextEncoder().encode(passphrase)
    );

    const aEncrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      aKey,
      cEncrypted
    );

    console.log(passphrase);
    const ctArray = Array.from(new Uint8Array(aEncrypted)); // ciphertext as byte array
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join(''); // ciphertext as string
    const ctBase64 = btoa(ctStr); // encode ciphertext as base64

    return [passphrase, ctBase64];
  }
}
