import Hello from '../components/Hello';
import * as actions from '../actions/';
import { StoreState, SessionData } from '../types/index';
import { connect, Dispatch } from 'react-redux';

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
  return res;
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AuthActions>) {
  return {
    logout: () => {
      dispatch(actions.logoutRequested());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Hello);
