import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { User } from 'src/app/models/user';

interface LoginCred {
  username: string;
  password: string;
}

interface LoginResponse {
  username: string;
}

interface SearchResponse {
  n: string;
  i: string;
}

@Injectable()
export class AuthService {
  private userInfo = null;

  constructor(private http: HttpClient) {}

  get loggedIn(): boolean {
    return this.userInfo != null;
  }

  login(loginCred: LoginCred): Observable<User> {
    return this.http.post<LoginResponse>('/api/login', loginCred).pipe(
      switchMap(res =>
        this.http
          .get<SearchResponse>('https://search.pclub.in/api/student', {
            params: {
              username: res.username,
            },
          })
          .pipe(
            map(v => {
              return {
                username: res.username,
                name: v.n,
                roll: v.i,
              };
            })
          )
      ),
      tap(user => {
        this.userInfo = user;
      })
    );
  }

  logout() {
    this.userInfo = null;
    return of();
  }
}
