import {createSelector} from 'reselect';
import {userIDSelector} from './user';

const userClubsSubSelector = (state) => state.userClubs;
const clubSubSelector = (state, props) => state.clubs[props.id];

const userClubsSelector = createSelector(
  userClubsSubSelector,
  (clubs) => {
    return Object.values(clubs)
      .filter((club) => !club?.pending)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
);

const userClubInvitesSelector = createSelector(
  userClubsSubSelector,
  (clubs) => {
    return Object.values(clubs)
      .filter((club) => club?.pending)
      .sort((a, b) => b.timestamp - a.timestamp);
  },
);

const clubSelector = createSelector(
  clubSubSelector,
  (item) => item,
);

const postListSelector = createSelector(
  clubSubSelector,
  (item) =>
    item?.posts
      ? Object.values(item.posts).sort((a, b) => b.timestamp - a.timestamp)
      : [],
);

const isClubOwnerSelector = createSelector(
  clubSubSelector,
  userIDSelector,
  (club, userID) => club?.owner === userID,
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

export {
  userClubsSelector,
  userClubInvitesSelector,
  clubSelector,
  servicesSelector,
  postListSelector,
  isClubOwnerSelector,
};
