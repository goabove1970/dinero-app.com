import Hello from '../components/Hello';
import * as actions from '../actions/';
import { StoreState, SessionData } from '../types/index';
import { connect, Dispatch } from 'react-redux';
import { Props } from '../components/Props';
// import { inspect } from 'util';

export function mapStateToProps(props: StoreState): Props {
  const res: Props = {
    userId: props.session && props.session && props.session.userId,
    sessionData: props.session,
  };
  // console.log(`Calling main view mapStateToProps: ${inspect(props)}\nNew props: ${inspect(res)}`);
  return res;
}

export function mapDispatchToProps(dispatch: Dispatch<actions.AuthActions>) {
  return {
    sessionDataLoaded: (sessionData: SessionData) => dispatch(actions.sessionDataLoaded(sessionData)),
  };
}

export default connect(mapStateToProps /*mapDispatchToProps*/)(Hello);
