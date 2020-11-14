import {store} from '../../store/reduxStore';
import equal from 'fast-deep-equal';

const boolShouldComponentUpdate = ({
  props,
  nextProps,
  state,
  nextState,
  component,
}) => {
  return true
  if (__DEV__) console.log('boolShouldComponentUpdate', component);
  console.log('nextProps', nextProps);
  console.log('props', props);
  if (!equal(props, nextProps) || !equal(state, nextState)) return true;
  return false;
};

export {boolShouldComponentUpdate};
