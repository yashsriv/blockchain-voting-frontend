import { Component, Input } from '@angular/core';
import { PlatformService } from 'src/app/services/platform.service';

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

  constructor(private platform: PlatformService) {}
}
