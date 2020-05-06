import { SessionData } from '../types';
import CONFIG from '../config';
import * as http from 'http';

export const doLogin = (user: string, password: string): Promise<SessionData> => {
  const reqBody = {
    action: 'login',
    args: {
      login: user,
      password,
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

  // console.log(`request transactions options: ${JSON.stringify(options, null, 4)}`);

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
        // console.info(`Response: ${buffer}`);
        const data = JSON.parse(buffer.toString());
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.payload.session);
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

export const doLogout = (sessionId?: string): Promise<boolean> => {
  const reqBody = {
    action: 'logout',
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

  // console.log(`request transactions options: ${JSON.stringify(options, null, 4)}`);

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
        // console.info(`Response: ${buffer}`);
        const data = JSON.parse(buffer.toString());
        if (data.error) {
          reject(data.error);
        } else {
          resolve(true);
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
