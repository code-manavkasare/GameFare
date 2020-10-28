import axios from 'axios';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import colors from '../style/colors';
import {Alert, Linking} from 'react-native';
import branch from 'react-native-branch';
import {date} from '../layout/date/date';
import {store} from '../../../reduxStore';
import {createPlaceholderCoachSession} from '../functions/coach';

const getArchivesFromBranchParams = (params) => {
  return params.archives ? params.archives.split(',') : [];
};

const getSessionFromBranchParams = (params) => {
  return params.sessionID ?? null;
};

const getParams = async (link) => {
  try {
    const isDeepLink = link.includes('gamefare.app.link');
    const url = isDeepLink
      ? `https://api.branch.io/v1/url?url=${link}&branch_key=${'key_live_deNF7ruAiHN7qKjWA8xlOekkAyonPxeV'}`
      : link;
    const promiseData = await axios.get(url, {
      params: {},
    });
    return promiseData?.data?.data;
  } catch (e) {
    return false;
  }
};

const openUrl = async (url) => {
  try {
    if (await InAppBrowser.isAvailable()) {
      const result = await InAppBrowser.open(url, {
        // iOS Properties
        dismissButtonStyle: 'cancel',
        preferredBarTintColor: 'white',
        preferredControlTintColor: colors.primary,
        readerMode: false,
        animated: true,
        modalPresentationStyle: 'overFullScreen',
        modalTransitionStyle: 'coverVertical',
        modalEnabled: true,
        // Android Properties
        showTitle: true,
        toolbarColor: 'white',
        secondaryToolbarColor: colors.primary,
        enableUrlBarHiding: true,
        enableDefaultShare: true,
        forceCloseOnRedirection: false,
        // Specify full animation resource identifier(package:anim/name)
        // or only resource name(in case of animation bundled with app).
        animations: {
          startEnter: 'slide_in_right',
          startExit: 'slide_out_left',
          endEnter: 'slide_in_left',
          endExit: 'slide_out_right',
        },
        headers: {
          'my-custom-header': 'my custom header value',
        },
        waitForRedirectDelay: 0,
      });
      return result;
    } else Linking.openURL(url);
  } catch (error) {
    Alert.alert(error.message);
  }
};

// const dataBranchLink = (objData, action) => {
//   let description = '';
//   let title = '';
//   if (action === 'Challenge') {
//     title = objData.info.name;
//     description =
//       'Join my challenge ' +
//       objData.info.name +
//       ' on ' +
//       date(objData.date.start, 'ddd, MMM D') +
//       ' at ' +
//       date(objData.date.start, 'h:mm a') +
//       ' by following the link!';
//   } else if (action === 'Event') {
//     title = objData.info.name;
//     description =
//       'Join my event ' +
//       objData.info.name +
//       ' on ' +
//       date(objData.date.start, 'ddd, MMM D') +
//       ' at ' +
//       date(objData.date.start, 'h:mm a') +
//       ' by following the link!';
//   } else if (action === 'Group') {
//     title = objData.info.name;
//     description =
//       'Join my group ' + objData.info.name + ' by following the link!';
//   } else {
//     title = 'Join the GameFare community.';
//     description = 'Subtitle';
//   }
//   return {description, title};
// };

// const createBranchUrl = async (dataObj, action, image) => {
//   const {description, title} = dataBranchLink(dataObj, action);
//   let branchUniversalObject = await branch.createBranchUniversalObject(
//     'canonicalIdentifier',
//     {
//       contentDescription: description,
//       title: title,
//       contentMetadata: {
//         customMetadata: {
//           objectID: dataObj.objectID,
//           action: action,
//           $uri_redirect_mode: '1',
//           $og_image_url: image,
//         },
//       },
//     },
//   );

//   let linkProperties = {feature: 'share', channel: 'GameFare'};
//   let controlParams = {$desktop_url: 'http://getgamefare.com'};

//   let {url} = await branchUniversalObject.generateShortUrl(
//     linkProperties,
//     controlParams,
//   );
//   return {url, description, title, image, action, objectID: dataObj.objectID};
// };

const createInviteToAppBranchUrl = async () => {
  const {user} = store.getState();
  const {userID} = user;
  const branchUniversalObject = await branch.createBranchUniversalObject(
    'canonicalIdentifier',
    {
      title: 'Join the GameFare community.',
      contentDescription: 'Download the GameFare iOS app today!',
      contentMetadata: {
        customMetadata: {
          type: 'invite',
          sentBy: userID,
          $uri_redirect_mode: '1',
        },
      },
    },
  );
  const branchPromise = createBranchUrl(branchUniversalObject);
  branchPromise.catch((r) => {
    console.log('createInviteToAppBranchUrl error', r);
    return false;
  });
  const response = await branchPromise;
  return await response;
};

const createInviteToSessionBranchUrl = async (sessionID) => {
  const {userID} = store.getState().user;
  const branchUniversalObject = await branch.createBranchUniversalObject(
    'canonicalIdentifier',
    {
      title: 'Come chat with me on GameFare.',
      contentDescription: 'Join the GameFare community today!',
      contentMetadata: {
        customMetadata: {
          sessionID,
          type: 'session',
          sentBy: userID,
          $uri_redirect_mode: '1',
        },
      },
    },
  );
  const branchPromise = createBranchUrl(branchUniversalObject);
  branchPromise.catch((r) => {
    console.log('createInviteToSessionBranchUrl error', r);
    return false;
  });
  const response = await branchPromise;
  return await response;
};

const createShareVideosBranchUrl = async (archiveIDs) => {
  if (archiveIDs && archiveIDs.length > 0) {
    const description = 'Watch my video on GameFare!';
    const {user} = store.getState();
    const {userID} = user;
    const archives = archiveIDs
      .map((id) => store.getState().archives[id])
      .filter((a) => a); 
    const thumbnail = archives.reduce((thumbnail, archive) => {
      // need uploaded thumbnail
      if (
        thumbnail === '' &&
        archive.thumbnail &&
        archive.thumbnail.substring(0, 4) === 'http'
      ) {
        return archive.thumbnail;
      }
      return thumbnail;
    }, '');
    const archiveMetadata = archives.reduce((data, archive, i) => {
      return i === 0 ? archive.id : data + ',' + archive.id;
    }, ''); 
    const branchUniversalObject = await branch.createBranchUniversalObject(
      'canonicalIdentifier',
      {
        contentDescription: description,
        title: description,
        contentMetadata: {
          customMetadata: {
            archives: archiveMetadata,
            type: 'archives',
            sentBy: userID,
            $uri_redirect_mode: '1',
            $og_image_url: thumbnail,
          },
        },
      },
    );
    const branchPromise = createBranchUrl(branchUniversalObject);
    branchPromise.catch((r) => {
      console.log('createShareVideosBranchUrl error', r);
      return false;
    });
    const response = await branchPromise;
    return await response;
  }
  return null;
};

const createBranchUrl = async (branchUniversalObject) => {
  const linkProperties = {feature: 'share', channel: 'GameFare'};
  const controlParams = {$desktop_url: 'http://getgamefare.com'};
  const {url} = await branchUniversalObject.generateShortUrl(
    linkProperties,
    controlParams,
  );
  return url;
};

module.exports = {
  getParams,
  openUrl,
  createInviteToAppBranchUrl,
  createInviteToSessionBranchUrl,
  createShareVideosBranchUrl,
  getArchivesFromBranchParams,
  getSessionFromBranchParams,
};
