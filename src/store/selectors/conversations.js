import {createSelector} from 'reselect';
import {isSessionRequestSelector, sessionSelector} from './sessions';
import {userIDSelector} from './user';

const conversationSubSelector = (state, props) => state.conversations[props.id];

const conversationSelector = createSelector(
  conversationSubSelector,
  (item) => {
    if (!item) return item;
    return item;
  },
);

const messagesSelector = createSelector(
  conversationSelector,
  isSessionRequestSelector,
  sessionSelector,
  userIDSelector,
  (conversation, isSessionRequest, session, userID) => {
    if (!conversation?.messages) return [];
    const messages = Object.values(conversation.messages);
    if (isSessionRequest) {
      const {organizer} = session.info;
      messages.unshift({
        id: 'request',
        text:
          organizer !== userID
            ? 'Unlock the conversation by sending the first message.'
            : 'The conversation is currently locked.',
        type: 'request',
        timeStamp: Date.now(),
        user: {},
      });
    }
    return messages;
  },
);

const lastMessageSelector = createSelector(
  messagesSelector,
  (messages) => {
    if (!messages) return false;
    if (Object.keys(messages).length === 0) return false;
    if (Object.keys(messages)[0] === 'noMessage') return false;
    if (Object.values(messages)[0].type === 'request')
      return Object.values(messages)[1];
    return Object.values(messages)[0];
  },
);

export {conversationSelector, messagesSelector, lastMessageSelector};
