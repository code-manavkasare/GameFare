import database from '@react-native-firebase/database';
import {store} from '../../../reduxStore';
import {mixPanelToken} from '../database/firebase/tokens';

import Mixpanel from 'react-native-mixpanel';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

const logMixpanel = ({label, params}) => {
  const {userID} = store.getState().user;
  Mixpanel.trackWithProperties(label, {...params, userID, date: new Date()});
};

export {logMixpanel};
