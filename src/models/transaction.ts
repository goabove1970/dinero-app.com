export interface Transaction {
  accountId?: string;
  transactionId?: string;
  importedDate?: Date;
  categoryId?: string;
  userComment?: string;
  overridePostingDate?: Date;
  overrideDescription?: string;
  serviceType?: TransactionServiceType;
  overrideCategory?: string;
  transactionStatus?: TransactionStatus;
  processingStatus?: ProcessingStatus;
  businessId?: string;
  chaseTransaction?: ChaseTransaction;
}

export type ChaseTransactionOriginType = 'DEBIT' | 'CREDIT' | 'CHECK' | 'DSLIP' | 'UNKNOWN';

export interface ChaseTransaction {
  Details: ChaseTransactionOriginType;
  PostingDate: Date;
  Description: string;
  Amount?: number;
  Type?: ChaseTransactionType;
  Balance?: number;
  CheckOrSlip?: string;
  CreditCardTransactionType?: CreditCardTransactionType;
  BankDefinedCategory?: string;
}

export type CreditCardTransactionType = 'Adjustment' | 'Fee' | 'Payment' | 'Return' | 'Sale' | 'Undefined';

export type ChaseTransactionType =
  | 'ACCT_XFER'
  | 'ACH_CREDIT'
  | 'ACH_DEBIT'
  | 'ATM'
  | 'ATM_DEPOSIT'
  | 'CHASE_TO_PARTNERFI'
  | 'CHECK_DEPOSIT'
  | 'CHECK_PAID'
  | 'DEBIT_CARD'
  | 'DEPOSIT'
  | 'FEE_TRANSACTION'
  | 'MISC_CREDIT'
  | 'MISC_DEBIT'
  | 'PARTNERFI_TO_CHASE'
  | 'QUICKPAY_CREDIT'
  | 'QUICKPAY_DEBIT'
  | 'WIRE_OUTGOING'
  | 'WIRE_INGOING'
  | 'undefined';

export enum TransactionServiceType {
  paidCreditCard = 1,
}

export enum TransactionStatus {
  excludeFromBalance = 1,
  recurring = 2,
  hidden = 4,
}

export enum ProcessingStatus {
  unprocessed = 1,
  merchantRecognized = 2,
  merchantUnrecognized = 4,
  merchantOverridenByUser = 8,
  multipleBusinessesMatched = 16,
}
