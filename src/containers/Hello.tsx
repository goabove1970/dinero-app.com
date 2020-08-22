import Hello from '../components/Hello';
import { StoreState, SessionData } from '../types/index';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Actions } from 'src/actions';
import { logoutRequested } from '../actions/loginActions';
import { transactionSearchRequested, clearTransactionSearch } from 'src/actions/transactionSearchActions';

export interface Props {
  userId?: string;
  sessionData?: SessionData;
  loginInProgress?: boolean;
  transactionSearchPattern?: string;
  logout: () => void;
  searchTransactions?: (pattern: string) => void;
  clearTransactionSearch?: () => void;
}

export function mapStateToProps(state: StoreState): Props {
  const res: Props = {
    userId: state.session && state.session && state.session.userId,
    sessionData: state.session,
    loginInProgress: state.loginInProgress,
    transactionSearchPattern: state.transactionSearchPattern,
    logout: () => { },
  };
  return res;
}

export function mapDispatchToProps(dispatch: Dispatch<Actions>) {
  return {
    logout: () => {
      dispatch(logoutRequested());
    },
    searchTransactions: (pattern: string) => {
      console.log(`Received transaction search request: ${pattern}`);
      dispatch(transactionSearchRequested(pattern));
    },
    clearTransactionSearch: () => {
      console.log('Dispatched clearTransactionSearch');
      dispatch(clearTransactionSearch());
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Hello);
