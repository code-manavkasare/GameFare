import {createSelector} from 'reselect';

const userClubsSubSelector = (state) => state.userClubs;
const clubSubSelector = (state, props) => state.clubs[props.id];

const userClubsSelector = createSelector(
  userClubsSubSelector,
  (clubs) => {
    return Object.values(clubs).sort((a, b) => b.timestamp - a.timestamp);
  },
);

const clubSelector = createSelector(
  clubSubSelector,
  (item) => item,
);

export {userClubsSelector, clubSelector};
