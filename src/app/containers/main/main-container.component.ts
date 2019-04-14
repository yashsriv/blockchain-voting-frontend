import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface pongResponse {
  pong: string;
}

@Component({
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss'],
})
export class MainContainerComponent {
  public username$: Observable<string>;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.username$ = this.http
      .get<pongResponse>('/api/ping')
      .pipe(map(res => res.pong));
  }
}
