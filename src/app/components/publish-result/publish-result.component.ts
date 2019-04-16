import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-publish-result',
  templateUrl: './publish-result.component.html',
  styleUrls: ['./publish-result.component.scss'],
})
export class PublishResultComponent {
  @Input() candidates: string[];

  public step = 'get-votes';
  public votes: string[] = [];
  public voteMap: { [key: string]: string[] } = {};

  get voteMapEmpty(): boolean {
    return Object.entries(this.voteMap).length === 0;
  }
}
