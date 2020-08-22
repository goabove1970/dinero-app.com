import * as React from 'react';
import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import { LoadIndicator } from 'devextreme-react';
import { Button } from 'react-bootstrap';

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
            const isSelected = selectedAccountId === acct!.accountId;
            return (
              <div>
                <div className="buttons-column">
                  <div>
                    <Button
                      variant={isSelected ? 'info' : 'outline-info'}
                      size="sm"
                      onClick={onClick}
                      data-elementattr={JSON.stringify(acct)}
                      key={acct!.accountId}
                    >{acct!.alias}</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
};
