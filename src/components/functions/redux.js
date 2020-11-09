import {store} from '../../store/reduxStore';
import equal from 'fast-deep-equal';


const boolShouldComponentUpdate = ({props,nextProps,state,nextState}) => {
  if (
    !equal(props, nextProps) ||
    !equal(state, nextState)
  )
    return true;
  return false;
};

 

export {
  boolShouldComponentUpdate
};
