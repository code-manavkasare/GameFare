import {createSelector} from 'reselect';

const blockedUsersSubSelector = (state) => state.userBlockedUsers;
const blockedByUsersSubSelector = (state) => state.userBlockedByUsers;

const blockedUsersSelector = createSelector(
  blockedUsersSubSelector,
  (users) => users,
);

const blockedByUsersSelector = createSelector(
  blockedByUsersSubSelector,
  (users) => users,
);

export {blockedUsersSelector, blockedByUsersSelector};
