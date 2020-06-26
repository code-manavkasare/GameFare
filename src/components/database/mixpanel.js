import Mixpanel from 'react-native-mixpanel';
import {mixPanelToken} from './firebase/tokens';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

const logMixpanel = (string, data) => {
  Mixpanel.trackWithProperties(string, data);
};

module.exports = {
  logMixpanel,
};
