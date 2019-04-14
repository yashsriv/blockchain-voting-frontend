import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, from } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { TransactionProof } from 'src/app/models/proof';
import { User } from 'src/app/models/user';
import { generateKeyPair } from 'src/app/crypto';
import { UserService } from './user.service';

interface LoginCred {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  username: string;
  isAdmin: boolean;
  isCandidate: boolean;
  isRegistered: boolean;
}

interface SearchResponse {
  n: string;
  i: string;
}

@Injectable()
export class AuthService {
  public token = null;

  constructor(private http: HttpClient, private user: UserService) {}

  get loggedIn(): boolean {
    return this.token != null;
  }

  login(loginCred: LoginCred): Observable<User> {
    return this.http.post<LoginResponse>('/api/login', loginCred).pipe(
      tap(res => {
        this.token = res.token;
        this.user.setPassword(loginCred.password);
      }),
      switchMap(res =>
        res.isRegistered
          ? of(res)
          : from(generateKeyPair(loginCred.password)).pipe(
              switchMap(data =>
                this.http
                  .post<TransactionProof>('/api/register', data)
                  .pipe(tap(proof => console.log(proof)))
              ),
              map(_ => res)
            )
      ),
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
                isAdmin: res.isAdmin,
                isCandidate: res.isCandidate,
              };
            })
          )
      ),
      tap(user => {
        this.user.userInfo = user;
      })
    );
  }

  logout() {
    this.user.userInfo = null;
    this.token = null;
    this.user.setPassword(null);
  }
}
