import {createSelector} from 'reselect';

const blockedUsersSubSelector = (state) => state.userBlockedUsers;
const blockedByUsersSubSelector = (state) => state.userBlockedByUsers;
const isUserBlockedSubSelector = (state, props) =>
  state.userBlockedUsers[props.id];

const blockedUsersSelector = createSelector(
  blockedUsersSubSelector,
  (users) => users,
);

const blockedByUsersSelector = createSelector(
  blockedByUsersSubSelector,
  (users) => users,
);

const isUserBlockedSelector = createSelector(
  isUserBlockedSubSelector,
  (user) => user,
);

export {blockedUsersSelector, blockedByUsersSelector, isUserBlockedSelector};
