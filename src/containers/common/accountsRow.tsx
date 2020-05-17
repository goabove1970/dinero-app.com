import * as React from 'react';
import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import { Button, LoadIndicator } from 'devextreme-react';
import { Account } from '../../models/Account';

export type TransactionCategorizationType = 'uncategorized' | 'categorized' | 'all';

export interface AccountSelectionOption {
  accountId: string;
  caption: string;
}

export const renderAccountsButtonsRow = (
  accounts: Account[] | undefined,
  selectedAccountId?: string,
  onClick?: any
) => {
  return accounts === undefined ? (
    <LoadIndicator id="large-indicator" height={60} width={60} />
  ) : (
    <div className="interval-buttons-row">
      <div className="buttons">
        {accounts.map((acct) => {
          return (
            <div>
              <div className="buttons-column">
                <div>
                  <Button
                    text={acct!.alias}
                    type={selectedAccountId === acct!.accountId ? 'success' : 'normal'}
                    stylingMode="contained"
                    onClick={onClick}
                    elementAttr={acct}
                    key={acct!.accountId}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
