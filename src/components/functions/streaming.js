import {uploadPictureFirebase} from '../functions/pictures';
import {indexEvents} from '../database/algolia';
import firebase from 'react-native-firebase';
import axios from 'axios';


const MUX_TOKEN_ID = 'cbc3b201-74d4-42ce-9296-a516a1c0d11d';
const MUX_TOKEN_SECRET =
  'pH0xdGK3b7qCA/kH8PSNspLqyLa+BJnsjnY4OBtHzECpDg6efuho2RdFsRgKkDqutbCkzAHS9Q1';
async function createStreamFirebase(stream, eventID) {
  const firebaseStream = {
    ...stream,
    eventID: eventID,
    finished: false,
    netlineResults: null,
    netlinePicture: null,
  };
  await firebase
  .database()
  .ref('streams/' + firebaseStream.id + '/finished/')
  .set(firebaseStream);
}

async function createStream(eventID) {
  // create stream mux
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
  // store stream firebase
  const stream = {
    streamKey: response.data.data.stream_key,
    playbackID: response.data.data.playback_ids.id,
    id: response.data.data.id,
  };
  await createStreamFirebase(stream, eventID);
  console.log(JSON.stringify(stream, null, 2));
  return stream;
}

async function destroyStream(streamID) {
  var url = 'https://api.mux.com/video/v1/assets/' + streamID;
  const response = await axios.delete(
    url,
    {},
    { auth: {
        username: MUX_TOKEN_ID,
        password: MUX_TOKEN_SECRET,
      },
    },
  );
  await firebase
    .database()
    .ref('streams/' + streamID + '/')
    .d
  console.log(response);
}

module.exports = {createStream, destroyStream};
