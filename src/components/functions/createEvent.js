import {uploadPictureFirebase} from '../functions/pictures';
import {
  subscribeToTopics,
  refreshTokenOnDatabase,
} from '../functions/notifications';
import {indexEvents} from '../database/algolia';
import firebase from 'react-native-firebase';
import axios from 'axios';
import stripe from 'tipsi-stripe';
import {keys} from 'ramda';
// import Date from '../app/elementsEventCreate/DateSelector';
import moment from 'moment';
import Config from 'react-native-config';

stripe.setOptions({
  publishableKey: 'pk_live_wO7jPfXmsYwXwe6BQ2q5rm6B00wx0PM4ki',
  merchantId: 'merchant.gamefare',
  androidPayMode: 'test',
  requiredBillingAddressFields: ['all'],
});
var options = {
  requiredBillingAddressFields: ['postal_address'],
};

function generateID() {
  return (
    Math.random()
      .toString(36)
      .substring(2) + Date.now().toString(36)
  );
}

function newDiscussion(discussionID, groupID, image, nameGroup) {
  return {
    id: discussionID,
    title: nameGroup,
    members: {},
    messages: {},
    type: 'group',
    groupID: groupID,
    image: image,
  };
}

async function createEventObj(data, userID, infoUser, level, groups) {
  let event = {
    ...data,
    info: {
      ...data.info,
      organizer: userID,
    },
  };
  let attendees = {};
  let user = {
    info: infoUser,
    id: userID,
    status: 'confirmed',
    userID: userID,
  };
  user.coach = false;
  attendees = {
    [userID]: user,
  };
  var allAttendees = Object.values(attendees).map((user) => {
    return user.userID;
  });
  return {
    ...event,
    date_timestamp: moment(event.date.start).valueOf(),
    end_timestamp: moment(event.date.end).valueOf(),
    attendees: attendees,
    allAttendees: allAttendees,
  };
}

async function pushEventToGroups(groups, eventID) {
  for (var i in keys(groups)) {
    await firebase
      .database()
      .ref('groups/' + keys(groups)[i] + '/events')
      .update({
        [eventID]: true,
      });
  }
}

async function createEvent(data, userID, infoUser, level) {
  console.log('data.images[0]', data);
  var pictureUri = await uploadPictureFirebase(
    data.images[0],
    'events/' + generateID(),
  );
  console.log('pictureUri', pictureUri);
  if (!pictureUri) return false;

  var event = await createEventObj(data, userID, infoUser, level);

  event.images = [pictureUri];
  const discussionID = generateID();
  event.discussions = [discussionID];
  const {key} = await firebase
    .database()
    .ref('events')
    .push(event);
  event.eventID = key;
  event.objectID = key;

  await firebase
    .database()
    .ref('events/' + key)
    .update({eventID: key});

  await firebase
    .database()
    .ref('discussions/' + discussionID)
    .update(newDiscussion(discussionID, key, pictureUri, event.info.name));

  await pushEventToGroups(data.groups, key);
  await subscribeToTopics([userID, 'all', key]);
  refreshTokenOnDatabase(userID);

  return event;
}

async function checkUserAttendingEvent(userID, data) {
  var filterAttendees =
    'allAttendees:' +
    userID +
    ' OR allCoaches:' +
    userID +
    ' OR info.organizer:' +
    userID;
  indexEvents.clearCache();
  var {hits} = await indexEvents.search({
    query: data.objectID,
    filters: filterAttendees,
  });
  if (hits.length !== 0 && userID === data.info.organizer) {
    return {
      response: false,
      message:
        'You are the organizer of this event. You cannot attend your own event.',
    };
  } else if (hits.length !== 0) {
    return {
      response: false,
      message:
        'You are already attending this event. You cannot join it again.',
    };
  }
  return {response: true};
}

async function payEntryFee(now, data, userID, cardInfo, coach, infoUser) {
  var cardID = '';
  if (coach) return {response: true};

  var amountToPay = Math.max(
    0,
    Number(data.price.joiningFee) - Number(cardInfo.totalWallet),
  );
  if (amountToPay !== 0) {
    cardID = cardInfo.defaultCard.id;
  }
  if (amountToPay !== 0 && cardID === 'applePay') {
    try {
      const items = [
        {
          label: 'GameFare',
          amount: amountToPay.toFixed(2),
        },
      ];
      const token = await stripe.paymentRequestWithApplePay(items, options);
      var tokenCard = token.tokenId;

      var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}addUserCreditCard`;
      const promiseAxios = await axios.get(url, {
        params: {
          tokenCard: tokenCard,
          userID: userID,
          tokenStripeCus: cardInfo.tokenCusStripe,
          name: infoUser.firstname + ' ' + infoUser.lastname,
          email: !infoUser.email ? '' : infoUser.email,
          brand: cardInfo.defaultCard.brand,
        },
      });
      if (!promiseAxios.data.response) {
        stripe.cancelApplePayRequest();
      } else {
        cardID = promiseAxios.data.cardID;
        await stripe.completeApplePayRequest();
      }
    } catch (err) {
      stripe.cancelApplePayRequest();
      return {response: 'cancel', message: 'cancel'};
    }
  }
  if (Number(data.price.joiningFee) !== 0) {
    try {
      var url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}payEntryFee`;
      const promiseAxios = await axios.get(url, {
        params: {
          cardID: cardID,
          now: now,
          userID: userID,
          tokenCusStripe: cardInfo.tokenCusStripe,
          currentUserWallet: Number(cardInfo.totalWallet),
          amount: data.price.joiningFee,
          eventID: data.objectID,
        },
      });

      if (!promiseAxios.data.response)
        return {response: false, message: promiseAxios.data.message};
      return {response: true};
    } catch (err) {
      return {response: false, message: err.toString()};
    }
  }
  return {response: true};
}

async function joinEvent(
  data,
  userID,
  infoUser,
  level,
  cardInfo,
  coach,
  users,
  waitlist,
) {
  if (data.end_timestamp < Number(new Date()))
    return {
      response: false,
      message: 'The event has finished. You can no longer sign up.',
    };
  var {response, message} = await checkUserAttendingEvent(userID, data);
  if (!response) return {response, message};

  var now = new Date();
  var {message, response} = await payEntryFee(
    now,
    data,
    userID,
    cardInfo,
    coach,
    infoUser,
  );
  if (response === 'cancel') return {message, response};

  let pushSection = 'attendees';
  let usersToPush = {};

  for (var i in users) {
    var user = {
      ...users[i],
      coach: coach,
      status: waitlist ? 'pending' : 'confirmed',
      amountPaid: coach ? 0 : data.price.joiningFee,
      date: now,
    };
    usersToPush = {
      ...usersToPush,
      [user.id]: user,
    };
    await firebase
      .database()
      .ref('events/' + data.objectID + '/' + pushSection + '/' + users[i].id)
      .update(user);
  }
  if (user.status === 'confirmed')
    await subscribeToTopics([userID, 'all', data.objectID]);
  refreshTokenOnDatabase(userID);

  return {
    response: true,
    message: {usersToPush: usersToPush, pushSection: pushSection},
  };
}

function arrayAttendees(members, userID, organizer) {
  if (!members) return [];
  if (organizer === userID) return Object.values(members);
  return Object.values(members).filter(
    (attendee) => attendee.status === 'confirmed' || attendee.id === userID,
  );
}

module.exports = {createEvent, joinEvent, arrayAttendees};
