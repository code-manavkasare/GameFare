import {createSelector} from 'reselect';

const currentSessionIDSubSelector = (state) => state.coach.currentSessionID;
const reconnectingSubSelector = (state) => state.coach.reconnecting;
const sessionsSubSelector = (state) => state.userSessions;
const sessionSubSelector = (state, props) => state.coachSessions[props.id];
const recordingSessionSubSelector = (state) => state.coach.recording;
const endCurrentSessionSubSelector = (state) => state.coach.endCurrentSession;

const sessionsRequestsSubSelector = (state) => state.userSessionsRequests;
const sessionRequestsSubSelector = (state, props) =>
  state.coachSessionsRequests[props.id];
const isSessionRequestSubSelector = (state, props) =>
  state.userSessionsRequests[props.id];

const hideCurrentSessionSubSelector = (state, props) =>
  props.hideCurrentSession;

const archiveIDSubSelector = (state, props) => props.archiveID;

const drawingsSelector = createSelector(
  sessionSubSelector,
  archiveIDSubSelector,
  (session, archiveID) => {
    if (!session) return {};
    if (!session.sharedVideos) return {};
    if (!session.sharedVideos[archiveID]) return {};
    return session.sharedVideos[archiveID];
  },
);

const currentSessionIDSelector = createSelector(
  currentSessionIDSubSelector,
  (id) => id,
);

const playbackLinkedSelector = createSelector(
  sessionSubSelector,
  (session) => session.sharedVideos?.isPlaybackLinked,
);

const sessionsSelector = createSelector(
  sessionsSubSelector,
  currentSessionIDSubSelector,
  hideCurrentSessionSubSelector,
  (coachSessions, currentSessionID, hideCurrentSession) => {
    const exclude = hideCurrentSession ? currentSessionID : '';
    if (!coachSessions) {
      return [];
    }
    return Object.values(coachSessions)
      .filter((s) => {
        return s?.id !== undefined;
      })
      .sort(function(a, b) {
        const getTimestamp = ({id, timestamp}) => {
          timestamp;
        };
        const timestampA = getTimestamp(a) ?? a.timestamp;
        const timestampB = getTimestamp(b) ?? b.timestamp;
        return timestampB - timestampA;
      })
      .filter((s) => {
        return exclude ? exclude.indexOf(s?.id) === -1 : true;
      });
  },
);

const isSessionRequestSelector = createSelector(
  isSessionRequestSubSelector,
  (item) => (item ? true : false),
);

const sessionsRequestsSelector = createSelector(
  sessionsRequestsSubSelector,
  (coachSessions) => {
    if (!coachSessions) {
      return [];
    }
    return Object.values(coachSessions)
      .filter((s) => {
        return s?.id !== undefined;
      })
      .sort(function(a, b) {
        const getTimestamp = ({id, timestamp}) => {
          timestamp;
        };
        const timestampA = getTimestamp(a) ?? a.timestamp;
        const timestampB = getTimestamp(b) ?? b.timestamp;
        return timestampB - timestampA;
      });
  },
);

const numberSessionsRequestsSelector = createSelector(
  sessionsRequestsSelector,
  (sessions) => {
    if (!sessions) return 0;
    return Object.values(sessions).length;
  },
);

const sessionSelector = createSelector(
  sessionSubSelector,
  (item) => {
    if (!item) return item;
    return item;
  },
);

const sessionRequestsSelector = createSelector(
  sessionRequestsSubSelector,
  (item) => {
    if (!item) return item;
    return item;
  },
);

const reconnectingSelector = createSelector(
  reconnectingSubSelector,
  (item) => item,
);

const recordingSessionSelector = createSelector(
  recordingSessionSubSelector,
  (item) => item,
);

const endCurrentSessionSelector = createSelector(
  endCurrentSessionSubSelector,
  (item) => item,
);

export {
  currentSessionIDSelector,
  sessionSelector,
  sessionRequestsSelector,
  sessionsSelector,
  sessionsRequestsSelector,
  numberSessionsRequestsSelector,
  reconnectingSelector,
  isSessionRequestSelector,
  drawingsSelector,
  playbackLinkedSelector,
  recordingSessionSelector,
  endCurrentSessionSelector,
};
