import {ProcessingManager} from 'react-native-video-processing';
import {getVideoUUID} from './coach';
import {getVideoInfo} from './pictures';

const generateSnippetsFromFlags = async (source, flags) => {
  for (const flag of Object.values(flags)) {
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
  if (!(`${userID}-fullVideo` in flagsSelected)) {
    const flagsWithSnippets = await generateSnippetsFromFlags(
      recording.localSource,
      flagsSelected,
    );
    let snippets = [];
    for (var i in flagsWithSnippets) {
      const flag = flagsWithSnippets[i];
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
      const videoInfo = await getVideoInfo(snippetLocalPath);

      snippets.push({
        path: snippetLocalPath,
        localIdentifier: getVideoUUID(snippetLocalPath),
        storageDestination: destinationCloud,
        destinationFile: `${destinationCloud}/url`,
        firebaseUpdates: {
          [`${destinationCloud}/durationSeconds`]: duration / 1000,
          [`${destinationCloud}/id`]: uuid,
          [`${destinationCloud}/uploadedByUser`]: true,
          [`${destinationCloud}/sourceUser`]: memberID,
          [`${destinationCloud}/size`]: videoInfo.size,
          [`${destinationCloud}/thumbnail`]: thumbnail ? thumbnail : false,
          [`${destinationCloud}/startTimestamp`]: Date.now(),
          ...updateMembers,
        },
        type: 'video',
        duration: (stopTime - startTime) / 1000,
        displayInList: true,
        thumbnail: thumbnail ? thumbnail : false,
        filename: uuid,
        progress: 0,
        updateFirebaseAfterUpload: true,
        date: Date.now(),
      });
    }
    return snippets;
  } else {
    const {localSource, thumbnail, startTimestamp, stopTimestamp} = recording;
    const uuid = getVideoUUID(localSource);
    const videoInfo = await getVideoInfo(localSource);
    const destinationCloud = `archivedStreams/${uuid}`;
    const updateMembers = updatesMember({
      members,
      destinationCloud,
      userID,
      uuid,
    });
    return [
      {
        path: localSource,
        duration: (stopTimestamp - startTimestamp) / 1000,
        localIdentifier: getVideoUUID(localSource),
        storageDestination: destinationCloud,
        destinationFile: `${destinationCloud}/url`,
        displayInList: true,
        firebaseUpdates: {
          [`${destinationCloud}/durationSeconds`]:
            (stopTimestamp - startTimestamp) / 1000,
          [`${destinationCloud}/id`]: uuid,
          [`${destinationCloud}/size`]: videoInfo.size,
          [`${destinationCloud}/uploadedByUser`]: true,
          [`${destinationCloud}/sourceUser`]: memberID,
          [`${destinationCloud}/thumbnail`]: thumbnail ? thumbnail : '',
          [`${destinationCloud}/startTimestamp`]: Date.now(),
          ...updateMembers,
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
