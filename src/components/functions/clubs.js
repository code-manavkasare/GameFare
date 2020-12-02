import database from '@react-native-firebase/database';

import {generateID} from './utility.js';
import {setClubs} from '../../store/actions/clubsActions';
import {store} from '../../store/reduxStore';
import {setServices} from '../../store/actions/servicesActions.js';

const createClub = async ({title, description}) => {
  const {userID} = store.getState().user;
  const id = generateID();
  const newClub = {
    id,
    owner: userID,
    members: {[userID]: true},
    info: {
      title,
      description,
    },
  };
  const clubCreation = {
    [`clubs/${id}/`]: newClub,
    [`users/${userID}/clubs/${id}`]: {
      id: id,
      timestamp: Date.now(),
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
  const newService = {
    id,
    owner: userID,
    title,
    price: {
      value: price.value,
      unit: price.unit,
    },
    duration: {
      value: duration.value,
      unit: duration.unit,
    },
  };
  const serviceCreation = {
    [`services/${id}/`]: newService,
    [`clubs/${clubID}/services/${id}`]: {
      id: id,
      timestamp: Date.now(),
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

export {createClub, createService, editService, removeService};
