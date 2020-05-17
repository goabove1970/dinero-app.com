import { StoreState, SessionData } from '../types/index';
import { SESSION_LOADED, LOGIN_REQUESTED, LOGIN_DATA_RECEIVED, LOGOUT_REQUESTED } from '../constants/index';
import { AuthActions, loginDataReceived } from '../actions';
import { doLogin, doLogout } from './login';
import { getStore } from '..';
// import { inspect } from 'util';

export function storeReducer(state: StoreState, action: AuthActions): StoreState {
  switch (action.type) {
    case SESSION_LOADED:
      const sessionData = action.payload as SessionData;
      return { ...state, session: sessionData, loginInProgress: false };
    case LOGIN_DATA_RECEIVED:
      const loginData = action.payload as SessionData;
      // console.log(`Login data received, ${inspect(loginData)}`);
      if (loginData && loginData.sessionId) {
        document.cookie = JSON.stringify(loginData);
        return { ...state, session: loginData, loginInProgress: false };
      } else {
        return { ...state, lastLoginData: loginData };
      }
    case LOGIN_REQUESTED:
      const { login, password } = action.payload;
      // console.log(`Login requested, login: ${login}, password: ${password}`);
      doLogin(login, password)
        .then((data) => {
          getStore().dispatch(loginDataReceived(data));
        })
        .catch((e) => {
          console.error(e.message || e);
        });
      return { ...state, loginInProgress: true };

    case LOGOUT_REQUESTED:
      console.log(`Logout requested`);
      const session = state.session && state.session.sessionId;
      doLogout(session).then((data) => {
        console.log(`Logged out`);
        getStore().dispatch(loginDataReceived({}));
      });
      return { ...state, loginInProgress: false, session: {} };
    default:
      return state;
  }
}
