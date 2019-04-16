export interface PlatformInfoResponse {
  adminKey: string;
  address: string;
  candidateKeys: { [key: string]: string };
  candidates: string[];
  votingStarted: boolean;
  votingEnded: boolean;
  resultsPublished: string;
}

export interface PlatformInfo {
  adminKey: CryptoKey;
  address: string;
  candidateKeys: { [key: string]: CryptoKey };
  candidates: string[];
  votingStarted: boolean;
  votingEnded: boolean;
  resultsPublished: string;
}
