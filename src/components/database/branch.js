import axios from 'axios';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import colors from '../style/colors';
import {Alert, Linking} from 'react-native';

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
module.exports = {
  getParams,
  openUrl,
};
