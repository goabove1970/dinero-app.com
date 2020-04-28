import * as constants from '../constants';
import { SessionData } from '../types';

export interface SessionLoaded {
  type: constants.SESSION_LOADED;
  payload: SessionData;
}

export interface LoginRequested {
  type: constants.LOGIN_REQUESTED;
  payload: {
    login: string;
    password: string;
  };
}

export interface LoginDataLoaded {
  type: constants.LOGIN_DATA_RECEIVED;
  payload: SessionData;
}

export type AuthActions = SessionLoaded | LoginRequested | LoginDataLoaded;

export function sessionDataLoaded(sessionData: SessionData): AuthActions {
  return {
    type: constants.SESSION_LOADED,
    payload: sessionData,
  };
}

export function loginDataReceived(sessionData: SessionData): AuthActions {
  return {
    type: constants.LOGIN_DATA_RECEIVED,
    payload: sessionData,
  };
}

export function loginRequested(login: string, password: string): AuthActions {
  return {
    type: constants.LOGIN_REQUESTED,
    payload: {
      login,
      password,
    },
  };
}
