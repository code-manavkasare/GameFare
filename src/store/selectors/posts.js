import {createSelector} from 'reselect';

const postSubSelector = (state, props) => state.posts[props.id];

const postSelector = createSelector(
  postSubSelector,
  (item) => item,
);

export {postSelector};
