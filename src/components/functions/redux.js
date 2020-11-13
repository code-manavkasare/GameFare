import {store} from '../../store/reduxStore';
import equal from 'fast-deep-equal';

const boolShouldComponentUpdate = ({
  props,
  nextProps,
  state,
  nextState,
  component,
}) => {
  // if (__DEV__) console.log('boolShouldComponentUpdate', component);
  if (!equal(props, nextProps) || !equal(state, nextState)) return true;
  return false;
};

export {boolShouldComponentUpdate};
