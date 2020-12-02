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

const servicesSelector = createSelector(
  clubSelector,
  (clubs) => {
    if (!clubs) return [];
    if (!clubs.services) return [];
    return Object.values(clubs.services).sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  },
);

export {userClubsSelector, clubSelector, servicesSelector};
