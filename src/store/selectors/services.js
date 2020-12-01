import {createSelector} from 'reselect';

const serviceSubSelector = (state, props) => state.services[props.id];

const serviceSelector = createSelector(
  serviceSubSelector,
  (item) => item,
);

export {serviceSelector};
