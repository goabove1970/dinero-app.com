import * as React from 'react';
import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import { Button } from 'devextreme-react';

export type TransactionCategorizationType = 'uncategorized' | 'categorized' | 'all';

export interface TransactionCategorizationSelectionOption {
  categorizationType: TransactionCategorizationType;
  caption: string;
}

export const buildTransactionCategorizationOption = (
  categorizationType: TransactionCategorizationType
): TransactionCategorizationSelectionOption => {
  switch (categorizationType) {
    case 'categorized': {
      return {
        categorizationType,
        caption: 'Categorized',
      };
    }
    case 'uncategorized': {
      return {
        categorizationType,
        caption: 'Uncategorized',
      };
    }

    default:
      return {
        categorizationType,
        caption: 'All',
      };
  }
};

export const categoryButtons = ['all', 'categorized', 'uncategorized'].map((m: TransactionCategorizationType) =>
  buildTransactionCategorizationOption(m)
);

export const renderCategorizationButtonsRow = (selectedCategory: TransactionCategorizationType, onClick: any) => {
  return (
    <div className="interval-buttons-row">
      <div className="buttons">
        {categoryButtons.map((button) => {
          return (
            <div>
              <div className="buttons-column">
                <div>
                  <Button
                    text={button!.caption}
                    type={selectedCategory === button!.categorizationType ? 'success' : 'normal'}
                    stylingMode="contained"
                    onClick={onClick}
                    elementAttr={button}
                    key={button!.categorizationType}
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
