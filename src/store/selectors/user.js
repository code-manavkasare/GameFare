import {createSelector} from 'reselect';

const userConnectedSubSelector = (state) => state.user.userConnected;
export const userIDSubSelector = (state) => state.user.userID;
export const infoUserSubSelector = (state) => state.user.infoUser;
const infoUserByIdSubSelector = (state, props) => state.users[props.id];

const notificationsSelector = (state) => state.userNotifications;
const silentFriendsSubSelector = (state) => state.userSilentFriends;
const userBookingsSubSelector = (state) => state.userBookings;

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

const notificationsByConversationSelector = createSelector(
  (_, props) => props.coachSessionID,
  notificationsSelector,
  (coachSessionID, notifications) =>
    Object.values(notifications).filter(
      (n) =>
        n?.data?.coachSessionID === coachSessionID &&
        n?.data?.action === 'Conversation',
    ),
);

const silentFriendsSelector = createSelector(
  silentFriendsSubSelector,
  (item) => item,
);

const numNotificationsSelector = createSelector(
  notificationsSelector,
  (notifications) => (!notifications ? 0 : Object.values(notifications).length),
);

const numConversationNotificationsSelector = createSelector(
  (state) => state.conversations,
  notificationsSelector,
  (conversations, notifications) => {
    if (!conversations || !notifications) return 0;

    const conversationIDs = Object.values(conversations)
      .map((conversation) => conversation?.objectID)
      .filter((conversation) => conversation);

    const numNotifications = Object.values(notifications)
      .map((n) => n?.data?.coachSessionID)
      .filter((sessionID) => conversationIDs.includes(sessionID)).length;

    return numNotifications;
  },
);

const numBookingNotificationsSelector = createSelector(
  (state) => state.bookings,
  notificationsSelector,
  (bookings, notifications) => {
    if (!bookings || !notifications) return 0;

    const bookingIDs = Object.values(bookings)
      .map((booking) => booking?.id)
      .filter((booking) => booking);

    const numNotifications = Object.values(notifications)
      .map((n) => n?.data?.coachSessionID)
      .filter((sessionID) => bookingIDs.includes(sessionID)).length;

    return numNotifications;
  },
);

const infoUserByIdSelector = createSelector(
  infoUserByIdSubSelector,
  (item) => item,
);

const totalWalletSelector = createSelector(
  infoUserSubSelector,
  (item) => item.wallet.totalWallet,
);

const defaultCardSelector = createSelector(
  infoUserSubSelector,
  (item) => item.wallet.defaultCard,
);

const userBookingsSelector = createSelector(
  userBookingsSubSelector,
  (bookings) => {
    return Object.values(bookings).sort((a, b) => b.timestamp - a.timestamp);
  },
);

export {
  userConnectedSelector,
  userIDSelector,
  infoUserSelector,
  userNotificationsSelector,
  notificationsByConversationSelector,
  numNotificationsSelector,
  numConversationNotificationsSelector,
  numBookingNotificationsSelector,
  userInfoSelector,
  walletSelector,
  silentFriendsSelector,
  userSettingsSelector,
  permissionOtherUserToRecordSelector,
  isPrivateSelector,
  infoUserByIdSelector,
  totalWalletSelector,
  userBookingsSelector,
  defaultCardSelector,
};
