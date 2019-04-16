import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlatformService } from 'src/app/services/platform.service';

@Component({
  selector: 'app-admin-pre-voting',
  templateUrl: './admin-pre-voting.component.html',
  styleUrls: ['./admin-pre-voting.component.scss'],
})
export class AdminPreVotingComponent {
  @Input() candidates: string[];
  @Input() candidateKeys: { [key: string]: CryptoKey };
  @Output() votingStarted = new EventEmitter();

  loading = false;

  constructor(private platform: PlatformService) {}

  startVoting() {
    this.loading = true;
    this.platform.startVoting().subscribe(_ => {
      this.loading = false;
      this.votingStarted.emit();
    });
  }
}
