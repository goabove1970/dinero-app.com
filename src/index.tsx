import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Hello from './containers/Hello';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { enthusiasm } from './reducers/index';
import { StoreState } from './types/index';

import './index.css';

const store = createStore<StoreState>(enthusiasm, {
  // enthusiasmLevel: 1,
  activeAccount: 'dadcefdd-b198-08cf-b396-7cf044631d32',
  activeUser: '098be70d-f5c1-0799-e0b2-9226eb0c4f1d',
  // languageName: 'TypeScript',
});

console.log('rendering...');
ReactDOM.render(
  <Provider store={store}>
    <Hello />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
