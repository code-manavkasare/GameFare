import axios from 'axios';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import colors from '../style/colors';
import {Alert, Linking} from 'react-native';
import branch from 'react-native-branch';
import {date} from '../layout/date/date';
import {store} from '../../../reduxStore';


async function getParams(link) {
  try {
    var checkDeepLink = link.includes('gamefare.app.link');
    var url = link;
    if (checkDeepLink)
      var url = `https://api.branch.io/v1/url?url=${link}&branch_key=${'key_live_deNF7ruAiHN7qKjWA8xlOekkAyonPxeV'}`;

    const promiseData = await axios.get(url, {
      params: {},
    });
    return promiseData.data.data;
  } catch (e) {
    return false;
  }
}

async function openUrl(url) {
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
}

const dataBranchLink = (objData, action) => {
  let description = '';
  let title = '';
  if (action === 'Challenge') {
    title = objData.info.name;
    description =
      'Join my challenge ' +
      objData.info.name +
      ' on ' +
      date(objData.date.start, 'ddd, MMM D') +
      ' at ' +
      date(objData.date.start, 'h:mm a') +
      ' by following the link!';
  } else if (action === 'Event') {
    title = objData.info.name;
    description =
      'Join my event ' +
      objData.info.name +
      ' on ' +
      date(objData.date.start, 'ddd, MMM D') +
      ' at ' +
      date(objData.date.start, 'h:mm a') +
      ' by following the link!';
  } else if (action === 'Group') {
    title = objData.info.name;
    description =
      'Join my group ' + objData.info.name + ' by following the link!';
  } else {
    title='Join the GameFare community.'
    description='Subtitle'
  }
  return {description, title};
};

const createBranchUrl = async (dataObj, action, image) => {
  const {description, title} = dataBranchLink(dataObj, action);
  let branchUniversalObject = await branch.createBranchUniversalObject(
    'canonicalIdentifier',
    {
      contentDescription: description,
      title: title,
      contentMetadata: {
        customMetadata: {
          objectID: dataObj.objectID,
          action: action,
          $uri_redirect_mode: '1',
          $og_image_url: image,
        },
      },
    },
  );

  let linkProperties = {feature: 'share', channel: 'GameFare'};
  let controlParams = {$desktop_url: 'http://getgamefare.com'};

  let {url} = await branchUniversalObject.generateShortUrl(
    linkProperties,
    controlParams,
  );
  return {url, description, title, image, action, objectID: dataObj.objectID};
};

const createShareVideosBranchUrl = async (videos) => {
  let name = store.getState().user.infoUser.userInfo.firstname;
  let description = 'See the video shared with you!';
  if (name) {
    description = `See the video ${name} shared with you!`;
  }
  let branchUniversalObject = await branch.createBranchUniversalObject(
    'canonicalIdentifier',
    {
      contentDescription: description,
      title: 'Join GameFare',
      contentMetadata: {
        customMetadata: {
          ...videos,
          type: 'ShareVideos',
          $uri_redirect_mode: '1',
        },
      },
    },
  );
  let linkProperties = {feature: 'share', channel: 'GameFare'};
  let controlParams = {$desktop_url: 'http://getgamefare.com'};
  let {url} = await branchUniversalObject.generateShortUrl(
    linkProperties,
    controlParams,
  )
  return url;
}


module.exports = {
  getParams,
  openUrl,
  createBranchUrl,
  createShareVideosBranchUrl,
};
