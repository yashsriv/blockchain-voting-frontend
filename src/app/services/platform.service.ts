import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { getPublicKey, getPrivateKey } from 'src/app/crypto';
import { TransactionProof } from 'src/app/models/proof';
import { PlatformInfo, PlatformInfoResponse } from 'src/app/models/platform';

@Injectable()
export class PlatformService {
  constructor(private http: HttpClient, private snackbar: MatSnackBar) {}

  reportTransactionHash(hash: string) {
    const snackBarRef = this.snackbar.open('Transaction Submitted', 'View');
    snackBarRef.onAction().subscribe(() => {
      window.open(`https://ropsten.etherscan.io/tx/${hash}`, '_blank');
    });
  }

  fetchPlatformInfo(): Observable<PlatformInfo> {
    return this.http
      .get<PlatformInfoResponse>('/api/platform-info')
      .pipe(switchMap(res => this.mapResponseToInfo(res)));
  }

  startVoting() {
    return this.http
      .post<TransactionProof>('/api/start-voting', null)
      .pipe(tap(x => this.reportTransactionHash(x.link)));
  }

  endVoting() {
    return this.http
      .post<TransactionProof>('/api/end-voting', null)
      .pipe(tap(x => this.reportTransactionHash(x.link)));
  }

  fetchAllVotes() {
    return this.http.get<{ votes: string[]; hashes: string[] }>(
      '/api/all-votes'
    );
  }

  fetchAdminPrivKey(password: string): Observable<CryptoKey> {
    return this.http
      .get<string>('/api/admin-privKey')
      .pipe(switchMap(encKey => getPrivateKey(encKey, password)));
  }

  fetchCandidatePrivKey(
    username: string,
    password: string
  ): Observable<CryptoKey> {
    return this.http
      .get<string>('/api/candidate-privKey', {
        params: {
          username,
        },
      })
      .pipe(switchMap(encKey => getPrivateKey(encKey, password)));
  }

  publishResults(results: { [key: string]: string[] }) {
    return this.http
      .post<TransactionProof>('/api/publish-results', results)
      .pipe(tap(x => this.reportTransactionHash(x.link)));
  }

  vote(encryptedVote: string) {
    return this.http
      .post<TransactionProof>('/api/vote', {
        vote: encryptedVote,
      })
      .pipe(tap(x => this.reportTransactionHash(x.link)));
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
    const {
      address,
      candidates,
      votingStarted,
      votingEnded,
      resultsPublished,
    } = res;
    return {
      adminKey,
      address,
      candidateKeys,
      candidates,
      votingEnded,
      votingStarted,
      resultsPublished,
    };
  }
}
