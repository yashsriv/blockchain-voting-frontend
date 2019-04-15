import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { map, tap } from 'rxjs/operators';

interface SearchResponse {
  n: string;
  i: string;
}

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
})
export class UserViewComponent implements OnInit {
  @Input() username: string;
  @Input() showRegistered: boolean;
  @Input() registered: boolean;

  loading = true;
  user: any;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.http
      .get<SearchResponse>('https://search.pclub.in/api/student', {
        params: {
          username: this.username,
        },
      })
      .pipe(
        map(v => {
          return {
            username: this.username,
            name: v.n,
            roll: v.i,
          };
        }),
        tap(v => {
          this.user = v;
          this.loading = false;
        })
      )
      .subscribe();
  }

  get iitkhome(): string {
    return `http://home.iitk.ac.in/~${this.user.username}/dp`;
  }

  get oaimage() {
    return this.sanitizer.bypassSecurityTrustUrl(
      `https://oa.cc.iitk.ac.in/Oa/Jsp/Photo/${this.user.roll}_0.jpg`
    );
  }
}
