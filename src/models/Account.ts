export interface Account {
  accountId?: string;
  userId?: string;
  bankRoutingNumber?: number;
  bankAccountNumber?: number;
  bankName?: string;
  createDate?: Date;
  status?: AccountStatus;
  serviceComment?: string;
  accountType?: AccountType;
  cardNumber?: string;
  cardExpiration?: Date;
  alias?: string;
}

export interface AccountResponseModel extends Account {
  isAccountActive?: boolean;
  isAccountDeactiveted?: boolean;
  isAccountLocked?: boolean;
  isAccountActivationPending?: boolean;
  isSavings?: boolean;
  isDebit?: boolean;
  isCredit?: boolean;
  isCheching?: boolean;
}

export interface UserAccountLink {
  accountId?: string;
  userId?: string;
}

export enum AccountStatus {
  Active = 1,
  Deactivated = 2,
  Locked = 4,
  ActivationPending = 8,
}

export enum AccountType {
  Credit = 1,
  Debit = 2,
  Checking = 4,
  Savings = 8,
}
