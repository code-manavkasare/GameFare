import {createSelector} from 'reselect';

const interactionSelector = createSelector(
  (state, props) => state.initialInteractions[props.id],
  (item) => item,
);

const requiredInteractionsSelector = createSelector(
  (state) => state.initialInteractions.requiredInteractions,
  (item) => item,
);

export {interactionSelector, requiredInteractionsSelector};
