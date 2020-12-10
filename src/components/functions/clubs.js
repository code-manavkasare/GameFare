import database from '@react-native-firebase/database';

import {generateID} from './utility.js';
import {store} from '../../store/reduxStore';
import {chargeUser} from './stripe.js';
import {createInviteToClubBranchUrl} from '../database/branch';
import {goBack, navigate} from '../../../NavigationService';
import {getValueOnce} from '../database/firebase/methods.js';

const createClub = async ({title, description, sport}) => {
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
      sport,
    },
  };
  const clubCreation = {
    [`clubs/${id}/`]: newClub,
    [`users/${userID}/clubs/${id}`]: {
      id: id,
      timestamp,
    },
  };
  await database()
    .ref()
    .update(clubCreation);
};

const editClub = async ({title, description, sport, clubID}) => {
  const clubEdit = {
    [`clubs/${clubID}/info`]: {
      title,
      description,
      sport,
    },
  };
  await database()
    .ref()
    .update(clubEdit);
};

const deleteClub = async ({clubID}) => {
  const {members} = store.getState().clubs[clubID];
  let clubDeletion = {
    [`clubs/${clubID}`]: null,
  };
  if (members) {
    Object.keys(members).map((userID) => {
      clubDeletion[`users/${userID}/clubs/${clubID}`] = null;
    });
  }
  await database()
    .ref()
    .update(clubDeletion);
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
  const {members} = store.getState().clubs[clubID];
  const id = generateID();
  const timestamp = Date.now();
  const newPost = {
    id,
    userID,
    text,
    video,
    timestamp,
  };
  let postCreation = {
    [`posts/${id}/`]: newPost,
    [`clubs/${clubID}/posts/${id}`]: {
      id,
      timestamp,
    },
    [`clubs/${clubID}/timestamp`]: timestamp,
  };
  if (members) {
    Object.keys(members).map((userID) => {
      postCreation[`users/${userID}/clubs/${clubID}/timestamp`] = timestamp;
    });
  }
  await database()
    .ref()
    .update(postCreation);
};

const removePost = async ({postID, clubID}) => {
  const postDeletion = {
    [`posts/${postID}/`]: null,
    [`clubs/${clubID}/posts/${postID}`]: null,
  };
  await database()
    .ref()
    .update(postDeletion);
  return true;
};

const confirmBookingService = async ({serviceID}) => {
  const service = store.getState().services[serviceID];
  const {userID, infoUser} = store.getState().user;
  const {userInfo} = infoUser;
  const ownerInfo = await getValueOnce(`users/${service.owner}/userInfo`);

  ///// charge user //////
  const {value: chargeAmount} = service.price;
  const chargeUserRequest = await chargeUser(chargeAmount);
  if (!chargeUserRequest.response) return chargeUserRequest;

  ////// create new booking ////////
  const id = generateID();
  const timestamp = Date.now();
  const membersBooking = {
    [userID]: {
      id: userID,
      info: userInfo,
      timestamp,
    },
    [service.owner]: {
      id: service.owner,
      info: ownerInfo,
      timestamp,
    },
  };
  const newBooking = {
    id,
    userID,
    serviceID,
    serviceOwnerID: service.owner,
    requestorID: userID,
    members: membersBooking,
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
    // create new conversation
    [`coachSessions/${id}/`]: {
      members: membersBooking,
      objectID: id,
      isBooking: true,
      info: {
        organizer: userID,
      },
    },
  };
  await database()
    .ref()
    .update(bookingCreation);

  return {response: true, id};
};

const inviteUsersToClub = async ({clubID}) => {
  const branchLink = await createInviteToClubBranchUrl(clubID)
    .then((r) => r)
    .catch(() => null);
  navigate('UserDirectory', {
    action: 'inviteToClub',
    branchLink: branchLink,
    clubID,
    onConfirm: async ({users}) => {
      goBack();
      if (users) {
        const userIDs = Object.keys(users);
        const timestamp = Date.now();
        let updates = {};
        userIDs.map((userID) => {
          updates[`users/${userID}/clubs/${clubID}`] = {
            id: clubID,
            timestamp,
            pending: true,
          };
        });
        await database()
          .ref()
          .update(updates);
      }
    },
  });
};

const addUserToClub = async ({clubID, userID}) => {
  const timestamp = Date.now();
  const updates = {
    [`users/${userID}/clubs/${clubID}`]: {
      clubID,
      timestamp,
    },
    [`clubs/${clubID}/members/${userID}`]: true,
  };
  await database()
    .ref()
    .update(updates);
};

const acceptInvite = async ({clubID}) => {
  const {userID} = store.getState().user;
  if (!userID || !clubID) return false;
  const timestamp = Date.now();
  let updates = {
    [`users/${userID}/clubs/${clubID}`]: {
      id: clubID,
      timestamp,
      pending: null,
    },
    [`clubs/${clubID}/members/${userID}`]: true,
  };
  return await database()
    .ref()
    .update(updates);
};

const declineInvite = async ({clubID}) => {
  const {userID} = store.getState().user;
  if (!userID || !clubID) return false;
  let updates = {
    [`users/${userID}/clubs/${clubID}`]: null,
  };
  return await database()
    .ref()
    .update(updates);
};

export {
  createClub,
  editClub,
  deleteClub,
  createService,
  editService,
  removeService,
  confirmBookingService,
  createPost,
  removePost,
  inviteUsersToClub,
  addUserToClub,
  acceptInvite,
  declineInvite,
};
