import {ProcessingManager} from 'react-native-video-processing';
import {createThumbnail} from 'react-native-create-thumbnail';
import {uploadImage} from '../functions/upload';
import {getVideoUUID} from './coach';
import {getVideoInfo} from './pictures';

const generateSnippetsFromFlags = async (source, flags) => {
  for (var f in flags) {
    let flag = flags[f]
    const {id, startTime, stopTime} = flag;
    const trimOptions = {
      startTime: startTime / 1000,
      endTime: stopTime / 1000,
      saveToCameraRoll: true,
      saveWithCurrentDate: true,
    };

    if (!source) flags[f].snippetLocalPath = 'simulator';
    else
      await ProcessingManager.trim(source, trimOptions).then(
        (snippetLocalPath) => {
          flags[f].snippetLocalPath = snippetLocalPath;
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
  let snippets = [];
  let flags = Object.values(flagsSelected)
    .filter((flag) => {return flag?.id !== `${userID}-fullVideo`})
  if (flags.length > 0) {
    const flagsWithSnippets = await generateSnippetsFromFlags(
      recording.localSource,
      flags,
    );
    for (var i in flagsWithSnippets) {
      const flag = flagsWithSnippets[i];
      const {snippetLocalPath, id, startTime, stopTime} = flag;
      let {thumbnail} = flag;
      const uuid = getVideoUUID(snippetLocalPath);
      const destinationCloud = `archivedStreams/${uuid}`;
      const updateMembers = updatesMember({
        members,
        destinationCloud,
        userID,
        uuid,
      }); 
      if (!thumbnail) {
        let {path: localThumbnail} = await createThumbnail({
          url: snippetLocalPath,
          timeStamp: flag.time, 
        });
        thumbnail = await uploadImage(
          localThumbnail,
          destinationCloud,
          'thumbnail.jpg',
        );
      }
      const videoInfo = await getVideoInfo(snippetLocalPath);
      const duration = videoInfo?.duration ?? (stopTime - startTime);
      snippets.push({
        path: snippetLocalPath,
        localIdentifier: getVideoUUID(snippetLocalPath),
        storageDestination: destinationCloud,
        destinationFile: `${destinationCloud}/url`,
        firebaseUpdates: {
          [`${destinationCloud}/durationSeconds`]: duration,
          [`${destinationCloud}/id`]: uuid,
          [`${destinationCloud}/uploadedByUser`]: true,
          [`${destinationCloud}/sourceUser`]: memberID,
          [`${destinationCloud}/size`]: videoInfo.size,
          [`${destinationCloud}/thumbnail`]: thumbnail ? thumbnail : false,
          [`${destinationCloud}/startTimestamp`]: Date.now(),
          ...updateMembers,
        },
        type: 'video',
        duration: duration,
        displayInList: true,
        thumbnail: thumbnail ? thumbnail : false,
        filename: uuid,
        progress: 0,
        updateFirebaseAfterUpload: true,
        date: Date.now(),
      });
    }
  } 
  if (flagsSelected[`${userID}-fullVideo`]) {
    const {localSource, startTimestamp, stopTimestamp} = recording;
    let {thumbnail} = recording
    const uuid = getVideoUUID(localSource);
    const videoInfo = await getVideoInfo(localSource);
    const duration = videoInfo?.duration ?? 
      ((stopTimestamp - startTimestamp) / 1000);
    const destinationCloud = `archivedStreams/${uuid}`;
    const updateMembers = updatesMember({
      members,
      destinationCloud,
      userID,
      uuid,
    });
    if (!thumbnail) {
      let {path: localThumbnail} = await createThumbnail({
        url: localSource,
        timeStamp: 500,
      });
      thumbnail = await uploadImage(
        localThumbnail,
        destinationCloud,
        'thumbnail.jpg',
      );
    }
    snippets.push ({
        path: localSource,
        duration,
        localIdentifier: getVideoUUID(localSource),
        storageDestination: destinationCloud,
        destinationFile: `${destinationCloud}/url`,
        displayInList: true,
        firebaseUpdates: {
          [`${destinationCloud}/durationSeconds`]: duration,
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
      })
  }
  return snippets;
};

export {generateSnippetsFromFlags, arrayUploadFromSnipets};
