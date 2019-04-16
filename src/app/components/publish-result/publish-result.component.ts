import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs/operators';

import { PlatformService } from 'src/app/services/platform.service';

@Component({
  template: `
    <h1 mat-dialog-title>Votes</h1>
    <div mat-dialog-content>
      <mat-list>
        <mat-list-item *ngFor="let vote of data">
          <pre>{{ vote }}</pre>
        </mat-list-item>
      </mat-list>
    </div>
  `,
})
export class ListVotesDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: string[]) {}
}

@Component({
  template: `
    <h1 mat-dialog-title>Enter Password</h1>
    <div mat-dialog-content>
      <mat-form-field>
        <input matInput type="password" [formControl]="password" />
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="password.value" cdkFocusInitial>
        Ok
      </button>
    </div>
  `,
})
export class PasswordDialogComponent {
  password = new FormControl('', Validators.required);
}

@Component({
  selector: 'app-publish-result',
  templateUrl: './publish-result.component.html',
  styleUrls: ['./publish-result.component.scss'],
})
export class PublishResultComponent {
  @Input() candidates: string[];
  @Output() published = new EventEmitter<string>();

  public step = 'get-votes';
  public votes: { [key: string]: string } = {};
  private adminPrivKey: CryptoKey;
  private adminDecryptedVotes: ArrayBuffer[] = [];
  public voteMap: { [key: string]: string[] } = {};

  get voteMapEmpty(): boolean {
    return Object.entries(this.voteMap).length === 0;
  }

  constructor(private dialog: MatDialog, private platform: PlatformService) {}

  listVotes(data: string[]) {
    this.dialog.open(ListVotesDialogComponent, {
      data,
    });
  }

  getVotes() {
    this.step = 'loading';
    const dialogRef = this.dialog.open(PasswordDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(
        switchMap(password => this.platform.fetchAdminPrivKey(password)),
        tap(adminPrivKey => (this.adminPrivKey = adminPrivKey)),
        switchMap(_ => this.platform.fetchAllVotes()),
        tap(votes => {
          votes.votes.forEach((vote, idx) => {
            this.votes[vote] = votes.hashes[idx];
          });
        }),
        switchMap(_ => this.decryptVotesAdmin())
      )
      .subscribe(votes => {
        this.adminDecryptedVotes = votes;
        this.step = 'get-vote-count';
      });
  }

  checkVotes(candidate: string) {
    this.step = 'loading';
    const dialogRef = this.dialog.open(PasswordDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(
        switchMap(password =>
          this.platform.fetchCandidatePrivKey(candidate, password)
        ),
        switchMap(key => this.decryptVotesCandidate(key))
      )
      .subscribe(votes => {
        this.voteMap[candidate] = votes;
        this.candidates = this.candidates.filter(c => c !== candidate);
        this.step = 'get-vote-count';
        if (this.candidates.length === 0) {
          this.step = 'publish-results';
        }
      });
  }

  publish() {
    this.platform
      .publishResults(this.voteMap)
      .subscribe(res => this.published.emit(res.link));
  }

  private decryptVotesAdmin(): Promise<ArrayBuffer[]> {
    const decrypted = Object.keys(this.votes).map(async vote => {
      const ctStr = atob(vote);
      const ctArray = [];
      for (let i = 0, length = ctStr.length; i < length; i++) {
        const code = ctStr.charCodeAt(i);
        ctArray.push(code);
      }
      const ctBuffer = new Uint8Array(ctArray).buffer;
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        this.adminPrivKey,
        ctBuffer
      );
      return decrypted.slice(12);
    });
    return Promise.all(decrypted);
  }

  private async decryptVotesCandidate(key: CryptoKey): Promise<string[]> {
    const arr = await Promise.all(
      this.adminDecryptedVotes.map(ctBuffer => {
        const decrypted = crypto.subtle
          .decrypt(
            {
              name: 'RSA-OAEP',
            },
            key,
            ctBuffer
          )
          .then(val => {
            const ctArray = Array.from(new Uint8Array(val.slice(24)));
            const ctStr = ctArray
              .map(byte => String.fromCharCode(byte))
              .join('');
            return ctStr;
          }) as Promise<string>;
        return decrypted.catch(_ => '');
      })
    );
    return arr.filter(x => x !== '');
  }
}
