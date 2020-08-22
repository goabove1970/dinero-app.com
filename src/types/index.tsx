export interface SessionData {
  sessionId?: string;
  token?: string;
  sessionStarted?: Date;
  userId?: string;
}

export interface UserData {
  userId?: string;
  userName?: string;
  userLastName?: string;
}

export interface StoreState {
  session?: SessionData;
  lastLoginData?: SessionData;
  loginInProgress?: boolean;
  transactionSearchPattern?: string;
}
