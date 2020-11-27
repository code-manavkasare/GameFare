import {createSelector} from 'reselect';

const userConnectedSubSelector = (state) => state.user.userConnected;
const userIDSubSelector = (state) => state.user.userID;
const infoUserSubSelector = (state) => state.user.infoUser;

const notificationsSelector = (state) => state.notifications;
const silentFriendsSubSelector = (state) => state.userSilentFriends;

const userConnectedSelector = createSelector(
  userConnectedSubSelector,
  (value) => value,
);

const userIDSelector = createSelector(
  userIDSubSelector,
  (id) => id,
);

const infoUserSelector = createSelector(
  infoUserSubSelector,
  (id) => id,
);

const userInfoSelector = createSelector(
  infoUserSubSelector,
  (info) => {
    if (info.userInfo) return info.userInfo;
    return {};
  },
);

const userSettingsSelector = createSelector(
  infoUserSubSelector,
  (info) => {
    if (info.settings) return info.settings;
    return {};
  },
);

const permissionOtherUserToRecordSelector = createSelector(
  infoUserSubSelector,
  (info) => {
    return info.permissionOtherUserToRecord;
  },
);

const isPrivateSelector = createSelector(
  infoUserSubSelector,
  (info) => {
    if (!info.userInfo) return false;
    return info.userInfo.isPrivate;
  },
);

const walletSelector = createSelector(
  infoUserSubSelector,
  (info) => {
    if (info.wallet) return info.wallet;
    return {};
  },
);

const userNotificationsSelector = createSelector(
  notificationsSelector,
  (item) => item,
);

const silentFriendsSelector = createSelector(
  silentFriendsSubSelector,
  (item) => item,
);

const numNotificationsSelector = createSelector(
  notificationsSelector,
  (notifications) => (!notifications ? 0 : Object.values(notifications).length),
);

export {
  userConnectedSelector,
  userIDSelector,
  infoUserSelector,
  userNotificationsSelector,
  numNotificationsSelector,
  userInfoSelector,
  walletSelector,
  silentFriendsSelector,
  userSettingsSelector,
  permissionOtherUserToRecordSelector,
  isPrivateSelector,
};
