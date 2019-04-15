import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { getPublicKey, getPrivateKey } from 'src/app/crypto';
import { PlatformInfo, PlatformInfoResponse } from 'src/app/models/platform';

@Injectable()
export class PlatformService {
  constructor(private http: HttpClient) {}

  fetchPlatformInfo(): Observable<PlatformInfo> {
    return this.http
      .get<PlatformInfoResponse>('/api/platform-info')
      .pipe(switchMap(res => this.mapResponseToInfo(res)));
  }

  startVoting() {
    return this.http.post('/api/start-voting', null);
  }

  endVoting() {
    return this.http.post('/api/end-voting', null);
  }

  fetchAllVotes() {
    return this.http.get<string[]>('/api/all-votes');
  }

  fetchAdminPrivKey(password: string): Observable<CryptoKey> {
    return this.http
      .get<string>('/api/admin-privkey')
      .pipe(switchMap(encKey => getPrivateKey(encKey, password)));
  }

  fetchCandidatePrivKey(
    username: string,
    password: string
  ): Observable<CryptoKey> {
    return this.http
      .get<string>('/api/candidate-privkey', {
        params: {
          username,
        },
      })
      .pipe(switchMap(encKey => getPrivateKey(encKey, password)));
  }

  publishResults(results: { [key: string]: string[] }) {
    return this.http.post('/api/publish-results', results);
  }

  vote(encryptedVote: string) {
    return this.http.post('/api/vote', { vote: encryptedVote });
  }

  private async mapResponseToInfo(
    res: PlatformInfoResponse
  ): Promise<PlatformInfo> {
    const adminKey =
      res.adminKey === '' ? null : await getPublicKey(res.adminKey);
    const candidatePublicKeys = await Promise.all(
      Object.keys(res.candidateKeys)
        .filter(k => res.candidateKeys[k] !== '')
        .map(k => getPublicKey(res.candidateKeys[k]))
    );
    const candidateKeys = Object.keys(res.candidateKeys)
      .filter(k => res.candidateKeys[k] !== '')
      .reduce(
        (acc, cur, idx) => ({ ...acc, [cur]: candidatePublicKeys[idx] }),
        {}
      );
    const { candidates, votingStarted, votingEnded, resultsPublished } = res;
    return {
      adminKey,
      candidateKeys,
      candidates,
      votingEnded,
      votingStarted,
      resultsPublished,
    };
  }
}
