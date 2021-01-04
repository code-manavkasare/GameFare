import {createSelector} from 'reselect';

const connectionTypeSubSelector = (state) => state.connectionType.type;

const connectionTypeSelector = createSelector(
  connectionTypeSubSelector,
  (connectionType) => {
    if (connectionType === 'none' || connectionType === 'unknown') return false;
    return connectionType;
  },
);

export {connectionTypeSelector};
