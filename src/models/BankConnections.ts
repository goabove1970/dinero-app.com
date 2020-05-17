export interface BankSyncRequest {
  action?: string;
  args?: BankSyncArgs;
}

export interface BankConnectionData {
  connectionId?: string;
  userId?: string;
  connections?: BankConnection[];
  bankSeverity?: string;
  bankMessage?: string;
  bankCode?: number;
  linkedAccounts?: any;
  syncData?: any;
}

export interface BankResponseBase {
  error?: string;
  errorCode?: number;
  payload?: BankConnectionData;
}

export enum BankConnectionStatus {
  Active = 1,
  BankActivationRequired = 2,
  CouldNotConnect = 4,
  Suspended = 8,
  Validated = 16,
}

export interface BankConnection {
  connectionId?: string;
  userId?: string;
  bankName?: string;
  bankCategory?: string;
  bankFullName?: string;
  login?: string;
  password?: string;
  dateAdded?: Date;
  status?: BankConnectionStatus;
  lastPollDate?: Date;
  lastPollStats?: BankConnectionStats;
  isConnectionActive?: boolean;
  isBankActivationRequired?: boolean;
  isCouldNotConnect?: boolean;
  isSuspended?: boolean;
  isValidated?: boolean;
}

export interface BankConnectionResponse extends BankResponseBase {
  action?: string;
}

export interface BankConnectionStats {
  syncSessionId?: string;
  bankConnectionId?: string;
  userId?: string;
  accounts?: BankAccountPollStatus[];
  bankConnectionError?: string;
  bankConnectionErrorCode?: number;
}

export interface BankAccountPollStatus {
  accountNumber?: string;
  syncStarted?: Date;
  syncCompleted?: Date;
  recordsPolled?: number;
  bankConnectionError?: string;
  bankConnectionErrorCode?: number;
  accountData?: AccountData;
  syncData?: TransactionImprtResult;
}

export interface TransactionImprtResult {
  parsed: number;
  duplicates: number;
  newTransactions: number;
  businessRecognized: number;
  multipleBusinessesMatched: number;
  unrecognized: number;
  unposted: number;
}

export interface AccountData {
  transactions: ofxTransaction[];
  transactionsCount: number;
}

export type ofxTransaction = ofxCreditTransaction & ofxDebitTransaction;

export interface ofxDebitTransaction {
  memo?: string;
}

export interface ofxCreditTransaction {
  transactionType?: string;
  datePosted?: Date;
  amount?: number;
  fitid?: string;
  name?: string;
}

export interface BankSyncArgs {
  connectionId?: string;
  userId?: string;
  bankName?: string;
  login?: string;
  password?: string;
  status?: number;
  lastPollDate?: Date;
  lastPollStats?: BankConnectionStats;
  suspend?: boolean;
}
