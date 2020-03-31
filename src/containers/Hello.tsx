import Hello from '../components/Hello';
import * as actions from '../actions/';
import { StoreState } from '../types/index';
import { connect, Dispatch } from 'react-redux';
import { Props } from '../components/Props';

export function mapStateToProps(props: StoreState): Props {
  return {
    activeAccount: props.activeAccount,
    userId: props.activeUser,
  };
}

export function mapDispatchToProps(dispatch: Dispatch<actions.EnthusiasmAction>) {
  return {
    onIncrement: () => dispatch(actions.incrementEnthusiasm()),
    onDecrement: () => dispatch(actions.decrementEnthusiasm()),
  };
}

export default connect(mapStateToProps /*mapDispatchToProps*/)(Hello);
