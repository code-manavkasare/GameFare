import {ProcessingManager} from 'react-native-video-processing';
import {getVideoUUID} from './coach';

const generateSnippetsFromFlags = async (source, flags) => {
  for (const flag of Object.values(flags)) {
    console.log('flag: ', flag);
    const {id, startTime, stopTime} = flag;
    const trimOptions = {
      startTime: startTime / 1000,
      endTime: stopTime / 1000,
      saveToCameraRoll: true,
      saveWithCurrentDate: true,
    };

    if (!source) flags[id].snippetLocalPath = 'simulator';
    else
      await ProcessingManager.trim(source, trimOptions).then(
        (snippetLocalPath) => {
          flags[id].snippetLocalPath = snippetLocalPath;
        },
      );
  }
  return flags;
};

const updatesMember = ({members, destinationCloud, userID, uuid}) => {
  let updates = {};
  console.log('bim !!!!!', members);
  Object.values(members).map((member) => {
    const memberID = member.id;
    const timeStamp = Date.now();
    updates[`${destinationCloud}/members/${member.id}/timestamp`] = timeStamp;
    updates[`${destinationCloud}/members/${memberID}/id`] = memberID;
    updates[`${destinationCloud}/members/${memberID}/invitedBy`] = userID;
    updates[`users/${memberID}/${destinationCloud}/id`] = uuid;
    updates[`users/${memberID}/${destinationCloud}/startTimestamp`] = timeStamp;
    updates[`users/${memberID}/${destinationCloud}/uploadedByUser`] = true;
  });
  console.log('updatesMember', updates);
  return updates;
};

const arrayUploadFromSnipets = async ({
  flagsSelected,
  recording,
  coachSessionID,
  memberID,
  members,
  userID,
}) => {
  console.log('arrayUploadFromSnipets', {
    flagsSelected,
    recording,
    coachSessionID,
    memberID,
  });
  if (!flagsSelected['fullVideo']) {
    console.log('Video uploaded.');
    const flagsWithSnippets = await generateSnippetsFromFlags(
      recording.localSource,
      flagsSelected,
    );
    return Object.values(flagsWithSnippets).map((flag) => {
      const {snippetLocalPath, id, thumbnail, startTime, stopTime} = flag;
      const duration = stopTime - startTime;
      const uuid = getVideoUUID(snippetLocalPath);
      const destinationCloud = `archivedStreams/${uuid}`;
      const updateMembers = updatesMember({
        members,
        destinationCloud,
        userID,
        uuid,
      });
      console.log('updateMembers0', updateMembers);
      return {
        path: snippetLocalPath,
        localIdentifier: getVideoUUID(snippetLocalPath),
        storageDestination: destinationCloud,
        destinationFile: `${destinationCloud}/url`,
        firebaseUpdates: {
          [`${destinationCloud}/durationSeconds`]: duration,
          [`${destinationCloud}/id`]: uuid,
          [`${destinationCloud}/uploadedByUser`]: true,
          [`${destinationCloud}/sourceUser`]: memberID,
          [`${destinationCloud}/thumbnail`]: thumbnail ? thumbnail : false,
          [`${destinationCloud}/startTimestamp`]: Date.now(),
          ...updateMembers,
        },
        type: 'video',
        duration: stopTime - startTime,
        thumbnail: thumbnail ? thumbnail : false,
        filename: uuid,
        progress: 0,
        updateFirebaseAfterUpload: true,
        date: Date.now(),
      };
    });
  } else {
    const {localSource, thumbnail, startTimestamp, stopTimestamp} = recording;
    const uuid = getVideoUUID(localSource);
    const destinationCloud = `archivedStreams/${uuid}`;
    return [
      {
        path: localSource,
        duration: stopTimestamp - startTimestamp,
        localIdentifier: getVideoUUID(localSource),
        storageDestination: destinationCloud,
        destinationFile: `${destinationCloud}/url`,
        firebaseUpdates: {
          [`${destinationCloud}/durationSeconds`]:
            stopTimestamp - startTimestamp,
          [`${destinationCloud}/id`]: uuid,
          [`${destinationCloud}/uploadedByUser`]: true,
          [`${destinationCloud}/sourceUser`]: memberID,
          [`${destinationCloud}/thumbnail`]: thumbnail ? thumbnail : '',
          [`${destinationCloud}/startTimestamp`]: Date.now(),
        },
        type: 'video',
        filename: uuid,
        progress: 0,
        thumbnail: thumbnail ? thumbnail : false,
        updateFirebaseAfterUpload: true,
        date: Date.now(),
      },
    ];
  }
};

export {generateSnippetsFromFlags, arrayUploadFromSnipets};
