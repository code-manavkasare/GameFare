import {store} from '../../store/reduxStore';
import equal from 'fast-deep-equal';
import isEqual from 'lodash.isequal';

const boolShouldComponentUpdate = ({
  props,
  nextProps,
  state,
  nextState,
  component,
}) => {
  // if (__DEV__) console.log('boolShouldComponentUpdate', component);

  // console.log('props', isEqual(nextProps, props), nextProps, props);

  // console.log('state', isEqual(nextState, state), nextState, state);
  // return true;
  if (!isEqual(props, nextProps) || !isEqual(state, nextState)) return true;
  return false;
};

export {boolShouldComponentUpdate};
