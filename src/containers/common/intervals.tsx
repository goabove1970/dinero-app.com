import * as React from 'react';
import * as moment from 'moment';
import { Button } from 'react-bootstrap';

export enum TransactionIntervalType {
  thisMonth,
  lastMonth,
  threeMonths,
  sixMonths,
  twelveMonths,
  all,
}

export interface TransactionIntervalSelectionOption {
  intervalType: TransactionIntervalType;
  caption: string;
  startDate?: Date;
  endDate?: Date;
}

export const buildTransactionIntervalOption = (
  intervalType?: TransactionIntervalType
): TransactionIntervalSelectionOption | undefined => {
  if (intervalType === undefined) {
    return undefined;
  }

  switch (intervalType) {
    case TransactionIntervalType.thisMonth: {
      return {
        intervalType,
        caption: 'This Month',
        startDate: moment().startOf('month').toDate(),
        endDate: moment().toDate(),
      };
    }
    case TransactionIntervalType.lastMonth: {
      return {
        intervalType,
        caption: 'Last Month',
        startDate: moment().startOf('month').subtract(1, 'month').toDate(),
        endDate: moment().startOf('month').subtract(1, 'day').toDate(),
      };
    }
    case TransactionIntervalType.threeMonths: {
      return {
        intervalType,
        caption: '3 Months',
        startDate: moment().subtract(3, 'month').toDate(),
        endDate: moment().toDate(),
      };
    }
    case TransactionIntervalType.sixMonths: {
      return {
        intervalType,
        caption: '6 Months',
        startDate: moment().subtract(6, 'month').toDate(),
        endDate: moment().toDate(),
      };
    }
    case TransactionIntervalType.twelveMonths: {
      return {
        intervalType,
        caption: '1 Year',
        startDate: moment().subtract(1, 'year').toDate(),
        endDate: moment().subtract(1, 'day').toDate(),
      };
    }

    default:
      return {
        intervalType,
        caption: 'All',
      };
  }
};

export const intervalButtons = [
  TransactionIntervalType.all,
  TransactionIntervalType.thisMonth,
  TransactionIntervalType.lastMonth,
  TransactionIntervalType.threeMonths,
  TransactionIntervalType.sixMonths,
  TransactionIntervalType.twelveMonths,
].map((m) => buildTransactionIntervalOption(m));

export const renderIntervalButtonsRow = (selectedInterval: TransactionIntervalType | undefined, _onClick: any) => {
  return (
    <div className="interval-buttons-row">
      <div className="buttons">
        {intervalButtons.map((button) => {
          const isSelected = selectedInterval === button!.intervalType;
          return (
            <div key={button!.intervalType}>
              <div className="buttons-column">
                <div>
                  <Button
                    variant={isSelected ? 'primary' : 'outline-primary'}
                    onClick={_onClick}
                    size="sm"
                    data-elementattr={JSON.stringify(button)}
                    key={button!.intervalType}
                  >
                    {button!.caption}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
