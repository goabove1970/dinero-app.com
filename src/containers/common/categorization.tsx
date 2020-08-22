import * as React from 'react';
import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import { Button } from 'react-bootstrap';

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
          const isSelected = selectedCategory === button!.categorizationType;
          return (
            <div>
              <div className="buttons-column">
                <div>
                  <Button
                    variant={isSelected ? 'success' : 'outline-success'}
                    onClick={onClick}
                    size="sm"
                    data-elementattr={JSON.stringify(button)}
                    key={button!.categorizationType}
                  >{button!.caption}</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
