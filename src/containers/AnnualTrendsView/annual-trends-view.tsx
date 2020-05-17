import * as React from 'react';

import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import './annual-trends-view.css';
import { buildSpendingsDataSource } from '../../dataSources/spendingsDataSource';

import { Label } from 'devextreme-react/pie-chart';
import { Format } from 'devextreme-react/data-grid';
import { Chart, Series, CommonSeriesSettings, Legend, Tooltip } from 'devextreme-react/chart';

import { inspect } from 'util';
import { SpendingServiceResponse } from '../../models/Spendings';

interface AnnualTrendsViewProps {
  userId?: string;
}

interface AnnualTrendsViewState {
  spendingsLoaded?: boolean;
  spendings: SpendingServiceResponse;
}

export class AnnualTrendsViewElement extends React.Component<AnnualTrendsViewProps, AnnualTrendsViewState> {
  constructor(props: AnnualTrendsViewProps) {
    super(props);

    this.state = {
      spendings: {},
    };

    this.refreshSpendings = this.refreshSpendings.bind(this);
  }

  refreshSpendings(startDate?: Date, endDate?: Date) {
    this.setState({
      ...this.state,
      spendingsLoaded: false,
    });

    const source = buildSpendingsDataSource({
      startDate: startDate,
      endDate: endDate,
      userId: this.props.userId,
    });

    source.store.load().then((res: SpendingServiceResponse) => {
      console.log(`SpendingServiceResponse: ${inspect(res)}`);
      this.setState({
        ...this.state,
        spendings: res,
        spendingsLoaded: true,
      });
    });
  }

  componentDidMount() {
    //////        LOADING SPENDINGS        //////
    this.refreshSpendings();
  }

  render(): JSX.Element {
    console.log(`this.state.spendings: ${inspect(this.state.spendings && this.state.spendings.annualBalances)}`);

    return (
      <div className="spendings-content">
        {/* Annual spendings by month, as a LINE (SALDO)*/}
        {this.state.spendings && this.state.spendings.annualBalances && (
          <div className="annual-balances">
            <div className="caption">Monthly Balances</div>
            <Chart
              id="chart"
              dataSource={this.state.spendings.annualBalances}
              onPointClick={(e: any) => {
                e.target.select();
              }}
            >
              <CommonSeriesSettings
                argumentField="month"
                hoverMode="allArgumentPoints"
                selectionMode="allArgumentPoints"
                type={'spline'}
              >
                <Label visible={true}>
                  <Format type="fixedPoint" precision={0} />
                </Label>
              </CommonSeriesSettings>
              <Series valueField="saldo" name="Blance" />
              <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
              <Tooltip enabled={true} />
            </Chart>
          </div>
        )}

        {/* Annual spendings by month, as a BAR (DEBIT, CREDIT)*/}
        {this.state.spendings && this.state.spendings.annualBalances && (
          <div className="annual-balances">
            <div className="caption">Monthly Income vs Spendings</div>
            <Chart
              id="chart"
              dataSource={this.state.spendings.annualBalances}
              onPointClick={(e: any) => {
                e.target.select();
              }}
            >
              <CommonSeriesSettings
                argumentField="month"
                type="bar"
                hoverMode="allArgumentPoints"
                selectionMode="allArgumentPoints"
                barPadding={2.9}
              ></CommonSeriesSettings>
              <Series valueField="credit" name="Credit" />
              <Series valueField="debit" name="Debit" />
              <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
              <Tooltip enabled={true} />
            </Chart>
          </div>
        )}

        {/* Cumulative debit vs credit LINE (DEBIT, CREDIT)*/}
        {this.state.spendings && this.state.spendings.annualBalances && (
          <div className="annual-balances">
            <div className="caption">Cumulative Income vs Spendings</div>
            <Chart
              id="chart"
              dataSource={this.state.spendings.annualBalances}
              onPointClick={(e: any) => {
                e.target.select();
              }}
            >
              <CommonSeriesSettings
                argumentField="month"
                hoverMode="allArgumentPoints"
                selectionMode="allArgumentPoints"
                type={'spline'}
              >
                <Label visible={true}>
                  <Format type="fixedPoint" precision={0} />
                </Label>
              </CommonSeriesSettings>
              <Series valueField="cumCredit" name="Credit" />
              <Series valueField="cumDebit" name="Debit" />
              <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
              <Tooltip enabled={true} />
            </Chart>
          </div>
        )}

        {/* Cumulative debit vs credit LINE (DEBIT, CREDIT)*/}
        {this.state.spendings && this.state.spendings.annualBalances && (
          <div className="annual-balances">
            <div className="caption">Cumulative Balance</div>
            <Chart
              id="chart"
              dataSource={this.state.spendings.annualBalances}
              onPointClick={(e: any) => {
                e.target.select();
              }}
            >
              <CommonSeriesSettings
                argumentField="month"
                // type="bar"
                hoverMode="allArgumentPoints"
                selectionMode="allArgumentPoints"
                type={'spline'}
              >
                <Label visible={true}>
                  <Format type="fixedPoint" precision={0} />
                </Label>
              </CommonSeriesSettings>
              <Series valueField="cumSaldo" name="Blance" />
              <Legend verticalAlignment="bottom" horizontalAlignment="center"></Legend>
              <Tooltip enabled={true} />
            </Chart>
          </div>
        )}
      </div>
    );
  }
}

export default AnnualTrendsViewElement;
