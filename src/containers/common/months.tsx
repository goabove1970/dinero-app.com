import * as React from 'react';
import * as moment from 'moment';

import { Button } from 'react-bootstrap';

export interface TransactionIntervalSelectionOption {
  caption: string;
  startDate?: Date;
  endDate?: Date;
}

export const buildMonthIntervalOptions = (monthsDepth?: number): TransactionIntervalSelectionOption[] => {
  monthsDepth = (monthsDepth && monthsDepth > 0 ? monthsDepth : undefined) || 6;
  const options: TransactionIntervalSelectionOption[] = [];
  for (let i = 0; i < monthsDepth; i++) {
    const monthBeginning = moment().startOf('month').subtract(i, 'month').toDate();
    const monthEnd = moment(monthBeginning).add(1, 'month').toDate();
    options.push({
      caption: moment(monthBeginning).format('MMMM'),
      startDate: monthBeginning,
      endDate: monthEnd,
    });
  }
  return options;
};

export const renderMonthsIntervalButtonsRow = (selectedMonth: Date | undefined, onClick: any, depth?: number) => {
  return (
    <div className="interval-buttons-row">
      <div className="buttons">
        {buildMonthIntervalOptions(depth).map((button) => {

          const isSelected = selectedMonth && moment(selectedMonth!).isSame(button!.startDate);
          return (
            <div key={button!.startDate!.toDateString()}>
              <div className="buttons-column">
                <div>
                  <Button
                    variant={isSelected ? 'primary' : 'outline-primary'}
                    onClick={onClick}
                    size="sm"
                    data-elementattr={JSON.stringify(button)}
                    key={button!.startDate!.toDateString()}
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
