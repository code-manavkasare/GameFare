import database from '@react-native-firebase/database';

import {store} from '../../../../reduxStore';
import {deleteArchive} from '../../../actions/archivesActions';

const addVideoToMember = async (ownerId, userId, videoId) => {
  const date = Date.now();
  let updates = {};
  updates[`users/${userId}/archivedStreams/${videoId}`] = {
    id: videoId,
    startTimestamp: date,
    uploadedByUser: false,
  };
  updates[`archivedStreams/${videoId}/members/${userId}`] = {
    id: userId,
    invitedBy: ownerId,
    timestamp: date,
  };
  await database()
    .ref()
    .update(updates);
};

const deleteVideoFromLibrary = async (userId, videoIdArray) => {
  let updates = {};
  for (const videoId of videoIdArray) {
    store.dispatch(deleteArchive(videoId));
    updates[`users/${userId}/archivedStreams/${videoId}`] = null;
    updates[`archivedStreams/${videoId}/members/${userId}`] = null;
  }
  database()
    .ref()
    .update(updates);
};

export {addVideoToMember, deleteVideoFromLibrary};
