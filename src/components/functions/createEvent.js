import {uploadPictureFirebase} from '../functions/pictures';
import {subscribeToTopics} from '../functions/notifications';
import {indexEvents} from '../database/algolia';
import firebase from 'react-native-firebase';
import axios from 'axios';
import stripe from 'tipsi-stripe';
import Date from '../app/elementsEventCreate/DateSelector';
import moment from 'moment';

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
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
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
  var event = {
    ...data,
    info: {
      ...data.info,
      organizer: userID,
    },
    /// date_timestamp: Number(new Date(data.date.start)),
  };
  var attendees = {};
  var coaches = {};
  var user = {
    info: infoUser,
    id: userID,
    status: 'confirmed',
    userID: userID,
  };
  if (!event.info.coach) {
    user.coach = false;
    attendees = {
      [userID]: user,
    };
  } else {
    user.coach = true;
    coaches = {
      [userID]: user,
    };
  }
  var allAttendees = Object.values(attendees).map((user) => {
    return user.userID;
  });
  var allCoaches = Object.values(coaches).map((user) => {
    return user.userID;
  });
  return {
    ...event,
    date_timestamp: moment(event.date.start).valueOf(),
    end_timestamp: moment(event.date.end).valueOf(),
    coaches: coaches,
    allCoaches: allCoaches,
    attendees: attendees,
    allAttendees: allAttendees,
  };
}

async function pushEventToGroups(groups, eventID) {
  for (var i in groups) {
    await firebase
      .database()
      .ref('groups/' + groups[i] + '/events')
      .update({
        [eventID]: {
          eventID: eventID,
        },
      });
  }
}

async function createEvent(data, userID, infoUser, level) {
  var pictureUri = await uploadPictureFirebase(
    data.images[0],
    'events/' + generateID(),
  );
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
  if (hits.length != 0 && userID == data.info.organizer)
    return {
      response: false,
      message:
        'You are the organizer of this event. You cannot attend your own event.',
    };
  else if (hits.length != 0)
    return {
      response: false,
      message:
        'You are already attending this event. You cannot join it again.',
    };
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

      var url =
        'https://us-central1-getplayd.cloudfunctions.net/addUserCreditCard';
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
      var url = 'https://us-central1-getplayd.cloudfunctions.net/payEntryFee';
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
) {
  if (data.date_timestamp < Number(new Date()))
    return {
      response: false,
      message: 'This event is now past. You cannot join it anymore.',
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

  // if (!data.info.public && coach) {
  //   var newLevel = data.info.levelFilter
  //   if (data.info.levelOption == 'max' || newLevel == 0) {
  //     newLevel = 1
  //   }
  //   await firebase.database().ref('users/' + userID + '/level/').update({
  //     [data.info.sport]:newLevel
  //   })
  // }

  var pushSection = 'attendees';
  if (coach) pushSection = 'coaches';

  var usersToPush = {};

  for (var i in users) {
    var user = {
      ...users[i],
      coach: coach,
      status: 'confirmed',
      amountPaid: data.price.joiningFee,
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

  await subscribeToTopics([userID, 'all', data.objectID]);
  return {
    response: true,
    message: {usersToPush: usersToPush, pushSection: pushSection},
  };
}

module.exports = {createEvent, joinEvent};
