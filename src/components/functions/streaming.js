import {uploadPictureFirebase} from '../functions/pictures';
import firebase from 'react-native-firebase';
import axios from 'axios';
import Config from 'react-native-config';

// const MUX_TOKEN_ID = 'cbc3b201-74d4-42ce-9296-a516a1c0d11d';
// const MUX_TOKEN_SECRET =
//   'pH0xdGK3b7qCA/kH8PSNspLqyLa+BJnsjnY4OBtHzECpDg6efuho2RdFsRgKkDqutbCkzAHS9Q1';



async function createStream(eventID) {
  const stream = await createStreamMux();
  if (stream) {
    await createStreamFirebase(stream, eventID);
  }
  return stream;
}
async function createStreamFirebase(stream, eventID) {
  const firebaseStream = {
    ...stream,
    eventID: eventID,
  };
  await firebase
    .database()
    .ref('streams/' + firebaseStream.id + '/')
    .set(firebaseStream)
    .catch((error) => {
      console.log(
        'ERROR: destroyStreamFirebase: ' + error.message,
      );
    });
}
async function createStreamMux() {
  const url = `${Config.MUX_LIVE_STREAM_URL}`;
  axios.post(
    url,
    {
      playback_policy: ['public'],
      new_asset_settings: {
        playback_policy: ['public'],
      },
    },
    {
      auth: {
        username: `${Config.MUX_TOKEN_ID}`,
        password: `${Config.MUX_TOKEN_SECRET}`,
      },
    },
  )
  .then((response) => {
    const stream = {
      streamKey: response.data.data.stream_key,
      playbackID: response.data.data.playback_ids[0].id,
      id: response.data.data.id,
    };
    return stream;
  })
  .catch((error) => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('ERROR: createStreamMux: ', error.message);
    }
    console.log(error.config);
    return false;
  });


}


async function destroyStream(streamID, saveFirebase) {
  await destroyStreamMux(streamID);
  if (!saveFirebase) {
    destroyStreamFirebase(streamID);
  }
}
async function destroyStreamFirebase(streamID) {
  await firebase
    .database()
    .ref('streams/' + streamID + '/')
    .remove()
    .catch(function(error) {
      console.log(
        'ERROR: destroyStreamFirebase: ' + error.message,
      );
    });
}

async function destroyStreamMux(streamID) {
  const url = `${Config.MUX_LIVE_STREAM_URL}streamID`;
  await axios
    .delete(url, {
      auth: {
        username: `${Config.MUX_TOKEN_ID}`,
        password: `${Config.MUX_TOKEN_SECRET}`,
      },
    })
    .catch(function(error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('ERROR: destroyStreamMux: ', error.message);
      }
      console.log(error.config);
    });
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
