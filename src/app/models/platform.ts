export interface PlatformInfoResponse {
  adminKey: string;
  candidateKeys: { [key: string]: string };
  candidates: string[];
  votingStarted: boolean;
  votingEnded: boolean;
  resultsPublished: boolean;
}

export interface PlatformInfo {
  adminKey: CryptoKey;
  candidateKeys: { [key: string]: CryptoKey };
  candidates: string[];
  votingStarted: boolean;
  votingEnded: boolean;
  resultsPublished: boolean;
}
