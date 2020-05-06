import Hello from '../components/Hello';
import * as actions from '../actions/';
import { StoreState, SessionData } from '../types/index';
import { connect, Dispatch } from 'react-redux';
// import { inspect } from 'util';

export interface Props {
  userId?: string;
  sessionData?: SessionData;
  loginInProgress?: boolean;
  logout: () => void;
}

export function mapStateToProps(props: StoreState): Props {
  const res: Props = {
    userId: props.session && props.session && props.session.userId,
    sessionData: props.session,
    loginInProgress: props.loginInProgress,
    logout: () => {},
  };
  // console.log(`Calling main view mapStateToProps: ${inspect(props)}\nNew props: ${inspect(res)}`);
  return res;
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AuthActions>) {
  return {
    logout: () => {
      console.log(`Dispatching: dispatch(actions.logoutRequested())`);
      dispatch(actions.logoutRequested());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Hello);
