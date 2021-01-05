import {createSelector} from 'reselect';

const networkConnectedSubSelector = (state) => state.network.isConnected;

const networkConnectedSelector = createSelector(
  networkConnectedSubSelector,
  (item) => item,
);

export {networkConnectedSelector};
