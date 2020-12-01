import database from '@react-native-firebase/database';

import {generateID} from './utility.js';
import {setClubs} from '../../store/actions/clubsActions';
import {store} from '../../store/reduxStore';

const createClub = async ({title, description}) => {
  const {userID} = store.getState().user;
  const clubID = generateID();
  const newClub = {
    id: clubID,
    owner: userID,
    members: {[userID]: true},
    info: {
      title,
      description,
    },
  };
  const clubCreation = {
    [`clubs/${clubID}/`]: newClub,
    [`users/${userID}/clubs/${clubID}`]: {
      id: clubID,
      timestamp: Date.now(),
    },
  };
  console.log('newClub', newClub);
  await store.dispatch(setClubs({[clubID]: newClub}));
  await database()
    .ref()
    .update(clubCreation);
};

export {createClub};
