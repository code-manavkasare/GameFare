import database from '@react-native-firebase/database';

import {generateID} from './utility.js';
import {setClubs} from '../../store/actions/clubsActions';
import {store} from '../../store/reduxStore';
import {setServices} from '../../store/actions/servicesActions.js';
import {chargeUser} from './stripe.js';
import {setPosts} from '../../store/actions/postsActions.js';
import {setBookings} from '../../store/actions/bookingsActions.js';

const createClub = async ({title, description}) => {
  const {userID} = store.getState().user;
  const id = generateID();
  const timestamp = Date.now();
  const newClub = {
    id,
    owner: userID,
    members: {[userID]: true},
    timestamp,
    info: {
      title,
      description,
    },
  };
  const clubCreation = {
    [`clubs/${id}/`]: newClub,
    [`users/${userID}/clubs/${id}`]: {
      id: id,
      timestamp,
    },
  };
  await store.dispatch(setClubs({[id]: newClub}));
  await database()
    .ref()
    .update(clubCreation);
};

const createService = async ({title, price, duration, clubID}) => {
  const {userID} = store.getState().user;
  const id = generateID();
  const timestamp = Date.now();
  const newService = {
    id,
    owner: userID,
    title,
    price: {
      value: price.value,
      unit: price.unit,
    },
    timestamp,
    duration: {
      value: duration.value,
      unit: duration.unit,
    },
  };
  const serviceCreation = {
    [`services/${id}/`]: newService,
    [`clubs/${clubID}/services/${id}`]: {
      id: id,
      timestamp,
    },
  };
  await store.dispatch(setServices({[id]: newService}));
  await database()
    .ref()
    .update(serviceCreation);
};

const editService = async ({title, price, duration, clubID, serviceID}) => {
  await database()
    .ref(`services/${serviceID}`)
    .update({
      title,
      price: {
        value: price.value,
        unit: price.unit,
      },
      duration: {
        value: duration.value,
        unit: duration.unit,
      },
    });
};

const removeService = async ({clubID, serviceID}) => {
  const serviceDeletion = {
    [`services/${serviceID}/`]: null,
    [`clubs/${clubID}/services/${serviceID}`]: null,
  };
  await database()
    .ref()
    .update(serviceDeletion);
  return true;
};

const createPost = async ({clubID, text, video}) => {
  const {userID} = store.getState().user;
  const id = generateID();
  const timestamp = Date.now();
  const newPost = {
    id,
    userID,
    text,
    video,
    timestamp,
  };
  const postCreation = {
    [`posts/${id}/`]: newPost,
    [`clubs/${clubID}/posts/${id}`]: {
      id,
      timestamp,
    },
  };
  await store.dispatch(setPosts({[id]: newPost}));
  await database()
    .ref()
    .update(postCreation);
};

const confirmBookingService = async ({clubID, serviceID}) => {
  const service = store.getState().services[serviceID];
  const {userID} = store.getState().user;

  ///// charge user //////
  const {value: chargeAmount} = service.price;
  const chargeUserRequest = await chargeUser(chargeAmount);
  if (!chargeUserRequest.response) return chargeUserRequest;

  ////// create new booking ////////
  const id = generateID();
  const timestamp = Date.now();
  const newBooking = {
    id,
    userID,
    serviceID,
    serviceOwnerID: service.owner,
    requestorID: userID,
    members: {[userID]: true},
    status: 'pending',
    timestamp,
  };
  const bookingCreation = {
    [`bookings/${id}/`]: newBooking,
    [`users/${service.owner}/bookings/${id}`]: {
      id,
      timestamp,
    },
    [`users/${userID}/bookings/${id}`]: {
      id,
      timestamp,
    },
  };
  await store.dispatch(setBookings({[id]: newBooking}));
  await database()
    .ref()
    .update(bookingCreation);

  return {response: true};
};

export {
  createClub,
  createService,
  editService,
  removeService,
  confirmBookingService,
  createPost,
};
