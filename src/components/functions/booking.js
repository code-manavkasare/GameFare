import database from '@react-native-firebase/database';

import {generateID} from './utility.js';
import {store} from '../../store/reduxStore';

import {goBack, navigate} from '../../../NavigationService';
import {sendNewMessage} from './message.js';
import colors from '../style/colors';

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

const updateBookingStatusAlert = ({bookingID, status}) => {
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
  navigate('Alert', {
    title,
    subtitle: 'This action cannot be undone.',
    textButton,
    colorButton: color[0],
    onPressColor: colors[color[1]],
    onGoBack: async () => updateBookingStatus({bookingID, status}),
  });
};

const updateBookingStatus = async ({bookingID, status}) => {
  await database()
    .ref(`bookings/${bookingID}/`)
    .update({
      status: status,
    });
  const {userID, infoUser} = store.getState().user;
  const {userInfo} = infoUser;
  // declined/ accepted
  await sendNewMessage({
    objectID: bookingID,
    user: {
      id: userID,
      info: userInfo,
    },
    text: `${userInfo.firstname} has ${
      status === 'confirmed' ? 'accepted' : 'declined'
    } the booking.`,
    type: 'bookingStatus',
  });
};

export {addContentToBooking, updateBookingStatus, updateBookingStatusAlert};
