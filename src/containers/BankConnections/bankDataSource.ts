import CONFIG from '../../config';
import * as http from 'http';
// import moment = require('moment');
import { BankConnectionResponse } from '../../models/BankConnections';

const getBankCategory = (bank?: string): string | undefined => {
  switch (bank) {
    case 'chase':
      return 'US Banks';
    default:
      return 'Banks';
  }
};

const getBankFullName = (bank?: string): string | undefined => {
  switch (bank) {
    case 'chase':
      return 'JP Morgan Chase';
    default:
      return bank;
  }
};

export class BankController {
  readBankConnections(userId?: string): Promise<BankConnectionResponse> {
    const reqBody = {
      action: 'get-bank-connections',
      args: {
        userId: userId,
      },
    };
    const bodyString = JSON.stringify(reqBody);

    const options = {
      method: 'POST',
      hostname: CONFIG.serviceUrl,
      port: CONFIG.port,
      path: '/bank-connections',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(bodyString),
      },
    };

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
          const data = JSON.parse(buffer.toString()) as BankConnectionResponse;
          data.payload &&
            data.payload.connections &&
            data.payload.connections.forEach((c) => {
              c.bankCategory = getBankCategory(c.bankName);
              c.bankFullName = getBankFullName(c.bankName);
              c.lastPollStats &&
                c.lastPollStats.accounts &&
                c.lastPollStats.accounts.forEach((acc) => {
                  acc.accountData && delete acc.accountData.transactions;
                });
            });
          resolve(data);
        });
      });

      req.on('error', (err) => {
        console.error(`Error: ${err.message || err}`);
        reject(err);
      });

      // console.log(`Posting spendings request: ${bodyString}`);
      req.write(bodyString);
      req.end();
    });
  }

  addBankConnection(
    userId: string,
    login: string,
    password: string,
    bankName: string
  ): Promise<BankConnectionResponse> {
    const reqBody = {
      action: 'add-bank-connection',
      args: {
        userId,
        bankName,
        login,
        password,
      },
    };
    const bodyString = JSON.stringify(reqBody);

    const options = {
      method: 'POST',
      hostname: CONFIG.serviceUrl,
      port: CONFIG.port,
      path: '/bank-connections',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(bodyString),
      },
    };

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
          const data = JSON.parse(buffer.toString()) as BankConnectionResponse;
          resolve(data);
        });
      });

      req.on('error', (err) => {
        console.error(`Error: ${err.message || err}`);
        reject(err);
      });

      // console.log(`Posting spendings request: ${bodyString}`);
      req.write(bodyString);
      req.end();
    });
  }

  deleteBankConnection(connectionId: string): Promise<BankConnectionResponse> {
    const reqBody = {
      action: 'remove-bank-connection',
      args: {
        connectionId,
      },
    };
    const bodyString = JSON.stringify(reqBody);

    const options = {
      method: 'POST',
      hostname: CONFIG.serviceUrl,
      port: CONFIG.port,
      path: '/bank-connections',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(bodyString),
      },
    };

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
          const data = JSON.parse(buffer.toString()) as BankConnectionResponse;
          resolve(data);
        });
      });

      req.on('error', (err) => {
        console.error(`Error: ${err.message || err}`);
        reject(err);
      });

      // console.log(`Posting spendings request: ${bodyString}`);
      req.write(bodyString);
      req.end();
    });
  }

  syncBankConnection(connectionId: string): Promise<BankConnectionResponse> {
    const reqBody = {
      action: 'sync',
      args: {
        connectionId,
      },
    };
    const bodyString = JSON.stringify(reqBody);

    const options = {
      method: 'POST',
      hostname: CONFIG.serviceUrl,
      port: CONFIG.port,
      path: '/bank-connections',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(bodyString),
      },
    };

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
          const data = JSON.parse(buffer.toString()) as BankConnectionResponse;
          resolve(data);
        });
      });

      req.on('error', (err) => {
        console.error(`Error: ${err.message || err}`);
        reject(err);
      });

      // console.log(`Posting spendings request: ${bodyString}`);
      req.write(bodyString);
      req.end();
    });
  }
}

const bankConrtoller = new BankController();

export default bankConrtoller;
