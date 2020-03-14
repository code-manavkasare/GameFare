import {rotateImage, uploadPictureFirebase} from '../functions/pictures';
import firebase from 'react-native-firebase';
import axios from 'axios';
import Config from 'react-native-config';
import {subscribeToTopics} from './notifications';

async function createStream(eventID) {
  let stream = await createStreamMux();
  if (stream) {
    stream = {
      ...stream,
      eventID: eventID,
    };
    await createStreamFirebase(stream);
  }
  return stream;
}
async function createStreamMux() {
  let stream = null;
  const url = `${Config.MUX_LIVE_STREAM_URL}`;
  await axios
    .post(
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
      stream = {
        streamKey: response.data.data.stream_key,
        playbackID: response.data.data.playback_ids[0].id,
        id: response.data.data.id,
      };
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
  return stream;
}
async function createStreamFirebase(stream) {
  await firebase
    .database()
    .ref('streams/' + stream.id + '/')
    .set(stream)
    .catch((error) => {
      console.log('ERROR: destroyStreamFirebase: ' + error.message);
    });
  await subscribeToTopics([stream.id]);
}

async function saveStreamResultsMatches(stream, matches, done) {
  await firebase
    .database()
    .ref('streams/' + stream.id + '/liveballResults')
    .update({matches: matches, organized: done})
    .catch((error) => {
      console.log('ERROR: saveStreamResultsMatches: ' + error.message);
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
      console.log('ERROR: destroyStreamFirebase: ' + error.message);
    });
}

async function destroyStreamMux(streamID) {
  const url = `${Config.MUX_LIVE_STREAM_URL}/` + streamID;
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

async function uploadNetlinePhoto(streamID, img, orientation) {
  let rotatedImage = img;
  // IF USING BACK CAMERA
  // if (orientation === 'LANDSCAPE-LEFT') {
  //   rotatedImage = await rotateImage(img.uri, img.height, img.width, 270);
  // } else if (orientation === 'LANDSCAPE-RIGHT') {
  //   rotatedImage = await rotateImage(img.uri, img.height, img.width, 90);
  // }
  // IF USING FRONT CAMERA
  if (orientation === 'LANDSCAPE-LEFT') {
    rotatedImage = await rotateImage(img.uri, img.height, img.width, 90);
  } else if (orientation === 'LANDSCAPE-RIGHT') {
    rotatedImage = await rotateImage(img.uri, img.height, img.width, 270);
  }
  const pictureUri = await uploadPictureFirebase(
    rotatedImage.uri,
    'streams/' + streamID + '/',
  );
  await firebase
    .database()
    .ref('streams/' + streamID + '/')
    .update({netlinePhoto: pictureUri});
}

module.exports = {
  createStream,
  destroyStream,
  uploadNetlinePhoto,
  saveStreamResultsMatches,
};
