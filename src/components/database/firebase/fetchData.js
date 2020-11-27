import database from '@react-native-firebase/database';
import axios from 'axios';
import Config from 'react-native-config';

import {getValueOnce} from './methods';
import {store} from '../../../store/reduxStore';
import {timeout} from '../../functions/coach';
import {setArchives} from '../../../store/actions/archivesActions';

const fetchArchives = async ({listIds, fetchAll}) => {
  const {isConnected} = store.getState().network;
  if (!isConnected) return true;

  let listIdsToFetch = [];
  if (fetchAll) listIdsToFetch = listIds;
  else
    for (let i in listIds) {
      const archiveID = listIds[i];
      const archiveInStore = store.getState().archives[archiveID];
      if (!archiveInStore) listIdsToFetch.push(archiveID);
    }
  const url = `${Config.FIREBASE_CLOUD_FUNCTIONS_URL}getAllElements`;
  const {data} = await axios.post(url, {
    ids: listIdsToFetch,
    path: 'archivedStreams',
  });
  const archives = data.response;

  await store.dispatch(setArchives(archives));
  await timeout(400);
  return true;
};

const updateData = async () => {
  const data = await getValueOnce('');
  let updates = {};
  //   for (var i in data) {
  //     updates[
  //       `coachSessions/${objectID}/members/${id}/permissionOtherUserToRecord`
  //     ] = true;
  //   }
  console.log('updates', updates);
  database()
    .ref()
    .update(updates);
};

export {fetchArchives, updateData};
