import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as http from 'http';

import Hello from './containers/Hello';
import { Provider } from 'react-redux';
import { createStore, Store } from 'redux';
import { storeReducer } from './reducers/index';
import { StoreState, SessionData } from './types/index';
import CONFIG from './config';

import './index.css';
import { sessionDataLoaded } from './actions';
import { inspect } from 'util';

const extractSessionData = (data?: string): SessionData => {
  let session: SessionData = {};
  if (data) {
    try {
      session = JSON.parse(data);
    } catch (e) {
      console.error(`Could not extract session data, ${e.message || e}`);
    }
  }
  return session;
};

const extendSession = (sessionId: string): Promise<SessionData> => {
  const reqBody = {
    action: 'extend-session',
    args: {
      sessionId,
    },
  };
  const bodyString = JSON.stringify(reqBody);

  const options = {
    method: 'POST',
    hostname: CONFIG.serviceUrl,
    port: CONFIG.port,
    path: '/users',
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(bodyString),
    },
  };

  console.log(`Session request: ${inspect(options)}`);
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let buffer: Buffer;
      res.on('data', (chunk: Buffer) => {
        if (!buffer) {
          buffer = chunk;
        } else {
          buffer = Buffer.concat([buffer, chunk]);
        }
      });

      res.on('end', () => {
        const data = JSON.parse(buffer.toString());
        console.info(`Categories response: ${inspect(data)}`);
        if (data.error) {
          resolve({});
        } else {
          const sessionData = data.payload.session as SessionData;
          resolve(sessionData);
        }
      });
    });

    req.on('error', (err) => {
      console.error(`Error: ${err.message || err}`);
      reject(err);
    });

    // console.log(`Posting account request: ${bodyString}`);
    req.write(bodyString);
    req.end();
  });
};

const getCookie = () => {
  return document.cookie;
};

const sessionLoadPromise = new Promise<SessionData>((resolve, reject) => {
  try {
    let sessionData = extractSessionData(getCookie());
    if (sessionData && sessionData.sessionId) {
      console.log(`Extracted session ${sessionData.sessionId} from a coockie.`);
      console.log(`Will try to extend session ${sessionData.sessionId}.`);
      resolve(
        extendSession(sessionData.sessionId).then((s) => {
          try {
            if (s.sessionId) {
              console.log(`Session ${sessionData.sessionId} has been extended.`);
            } else {
              console.log(`Session ${sessionData.sessionId} has expired.`);
            }
            sessionData = s;
            return sessionData;
          } catch (e) {
            console.error(e.message || e);
            throw e;
          }
        })
      );
    } else {
      console.log(`Could not extend session ${sessionData.sessionId}.`);
      resolve({});
    }
  } catch (e) {
    console.log(`Error loading session data.`);
    reject(e);
  }
});

export const store = createStore<StoreState>(storeReducer, {
  session: {},
  loginInProgress: true,
});

sessionLoadPromise
  .then((sessionData) => {
    store.dispatch(sessionDataLoaded(sessionData));
  })
  .catch((e) => {
    console.log(`Error getting session data: ${e.message || e}`);
  });

export const getState = (): StoreState => {
  return store.getState();
};

export const getStore = (): Store<StoreState> => {
  return store;
};

ReactDOM.render(<Provider store={store}>{<Hello />}</Provider>, document.getElementById('root') as HTMLElement);
