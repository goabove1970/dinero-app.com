import * as React from 'react';

import 'devextreme/data/odata/store';
import 'whatwg-fetch';
import './login-container.css';
import { TextBox, Button, ValidationSummary, Validator } from 'devextreme-react';
import { RequiredRule } from 'devextreme-react/data-grid';

interface LoginFormProps {
  login?: string;
  onLogin(login: string, password: string): void;
}

interface LoginFormState {
  login?: string;
  password?: string;
}

export class LoginElement extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props);

    this.state = {
      login: props.login,
      password: undefined,
    };
  }

  componentDidMount() {}

  render(): JSX.Element {
    return (
      <div className="flex-container">
        <div className="login-content">
          <div className="dx-field">
            <div className="inputField">
              <TextBox
                mode="text"
                placeholder="Enter login"
                value={this.state.login}
                onValueChanged={(args) => {
                  this.setState({ ...this.state, login: args.value });
                }}
              >
                <Validator>
                  <RequiredRule message="Login is required" />
                </Validator>
              </TextBox>
            </div>
          </div>

          <div className="dx-field">
            <div className="inputField">
              <TextBox
                mode="password"
                placeholder="Enter password"
                showClearButton={true}
                value={this.state.password}
                onValueChanged={(args) => {
                  this.setState({ ...this.state, password: args.value });
                }}
              >
                <Validator>
                  <RequiredRule message="Password is required" />
                </Validator>
              </TextBox>
            </div>
          </div>

          <div className="dx-fieldset">
            <ValidationSummary id="summary"></ValidationSummary>
            <Button
              id="button"
              text={'Login'}
              type="success"
              stylingMode="contained"
              useSubmitBehavior={true}
              onClick={() => {
                if (this.state.login && this.state.password) {
                  this.props.onLogin(this.state.login!, this.state.password!);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default LoginElement;
