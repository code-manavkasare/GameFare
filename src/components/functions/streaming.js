import {uploadPictureFirebase} from '../functions/pictures';
import firebase from 'react-native-firebase';
import axios from 'axios';

const MUX_TOKEN_ID = 'cbc3b201-74d4-42ce-9296-a516a1c0d11d';
const MUX_TOKEN_SECRET =
  'pH0xdGK3b7qCA/kH8PSNspLqyLa+BJnsjnY4OBtHzECpDg6efuho2RdFsRgKkDqutbCkzAHS9Q1';

async function createStreamFirebase(stream, eventID) {
  const firebaseStream = {
    ...stream,
    eventID: eventID,
  };
  await firebase
    .database()
    .ref('streams/' + firebaseStream.id + '/')
    .set(firebaseStream);
}

async function createStream(eventID) {
  var url = 'https://api.mux.com/video/v1/live-streams';
  const response = await axios.post(
    url,
    {
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
    },
    {
      auth: {
        username: MUX_TOKEN_ID,
        password: MUX_TOKEN_SECRET,
      },
    },
  );
  const stream = {
    streamKey: response.data.data.stream_key,
    playbackID: response.data.data.playback_ids[0].id,
    id: response.data.data.id,
  };
  await createStreamFirebase(stream, eventID);
  return stream;
}

async function destroyStream(streamID) {
  var url = 'https://api.mux.com/video/v1/live-streams/' + streamID;
  await axios.delete(url, {
    auth: {
      username: MUX_TOKEN_ID,
      password: MUX_TOKEN_SECRET,
    },
  });
  await firebase
    .database()
    .ref('streams/' + streamID + '/')
    .remove();
}

async function uploadNetlinePhoto(streamID, uri) {
  const pictureUri = await uploadPictureFirebase(
    uri,
    'streams/' + streamID + '/',
  );
  await firebase
    .database()
    .ref('streams/' + streamID + '/')
    .update({netlinePhoto: pictureUri});
}

module.exports = {createStream, destroyStream, uploadNetlinePhoto};
