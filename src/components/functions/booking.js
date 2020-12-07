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
  navigate('Alert', {
    title: `Do you want to ${
      status === 'confirmed' ? 'confirm' : 'decline'
    } the booking?`,
    subtitle: 'This action cannot be undone.',
    textButton: status === 'confirmed' ? 'Confim' : 'Decline',
    colorButton: status === 'confirmed' ? 'green' : 'red',
    onPressColor: status === 'confirmed' ? colors.greenLight : colors.red,
    onGoBack: async () => updateBookingStatus({bookingID, status}),
  });
};

const updateBookingStatus = async ({bookingID, status}) => {
  console.log('updateBookingStatus', status, bookingID);
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
