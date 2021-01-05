import database from '@react-native-firebase/database';

import {store} from '../../store/reduxStore';

import {navigate} from '../../../NavigationService';
import {sendNewMessage} from './message.js';
import colors from '../style/colors';
import {completePayment} from './stripe.js';
import {payUser} from './wallet';

const addContentToBooking = async ({bookingID, text, video}) => {
  const {userID, infoUser} = store.getState().user;
  const {userInfo} = infoUser;
  await sendNewMessage({
    objectID: bookingID,
    user: {
      id: userID,
      info: userInfo,
    },
    text: text,
    type: 'video',
    content: video,
  });
  if (video)
    await database()
      .ref(`coachSessions/${bookingID}/contents/${video}`)
      .update({id: video, timeStamp: Date.now()});
};

const completeBooking = async ({bookingID}) => {
  try {
    await updateBookingStatusAlert({bookingID, status: 'completed'});
  } catch (err) {
    return {response: false, error: false};
  }

  const booking = await store.getState().bookings[bookingID];
  const {stripePaymentIntentID, requestorID, service} = booking;
  const {owner, price, title} = service;
  const {value} = price;

  // Finalize requestor user payment
  try {
    await completePayment({
      requestorID,
      paymentIntentID: stripePaymentIntentID,
      amount: value,
    });
  } catch (err) {
    return {
      response: false,
      error: 'There was an issue processing the payment.',
    };
  }

  // Make payment to service provider
  try {
    await payUser({userID: owner, amount: value, description: title});
    return {
      response: true,
      error: false,
    };
  } catch (err) {
    return {
      response: false,
      error: 'There was an issue transferring funds to your account.',
    };
  }
};

const updateBookingStatusAlert = async ({bookingID, status}) => {
  const title =
    status === 'confirmed'
      ? 'Are you sure you want to accept this booking?'
      : status === 'declined'
      ? 'Are you sure you want to decline this booking?'
      : status === 'completed'
      ? 'Are you sure you want to mark this as complete?'
      : status === 'cancelled'
      ? 'Are you sure you want to cancel this booking?'
      : null;
  const textButton =
    status === 'confirmed'
      ? 'Accept'
      : status === 'declined'
      ? 'Decline'
      : status === 'completed'
      ? 'Mark as complete'
      : status === 'cancelled'
      ? 'Cancel service'
      : null;
  const color =
    status === 'confirmed'
      ? ['green', 'greenLight']
      : status === 'declined'
      ? ['red', 'red']
      : status === 'completed'
      ? ['green', 'greenLight']
      : status === 'cancelled'
      ? ['red', 'red']
      : ['green', 'greenLight'];
  return new Promise((resolve, reject) => {
    navigate('Alert', {
      title,
      subtitle: 'This action cannot be undone.',
      textButton,
      colorButton: color[0],
      onPressColor: colors[color[1]],
      onClose: () => {
        reject();
      },
      onGoBack: async () => {
        await updateBookingStatus({bookingID, status}).catch(reject);
        resolve();
      },
    });
  });
};

const updateBookingStatus = async ({bookingID, status}) => {
  await database()
    .ref(`bookings/${bookingID}/status`)
    .update({
      status,
      timestamp: Date.now(),
    });
  const {userID, infoUser} = store.getState().user;
  const {userInfo} = infoUser;

  const text =
    `${userInfo.firstname} has ` +
    (status === 'confirmed'
      ? 'accepted a booking.'
      : status === 'declined'
      ? 'declined a booking.'
      : status === 'completed'
      ? 'completed a booking.'
      : status === 'cancelled'
      ? 'cancelled a booking.'
      : null);
  await sendNewMessage({
    objectID: bookingID,
    user: {
      id: userID,
      info: userInfo,
    },
    text,
    type: 'bookingStatus',
  });
};

export {
  addContentToBooking,
  updateBookingStatus,
  updateBookingStatusAlert,
  completeBooking,
};
