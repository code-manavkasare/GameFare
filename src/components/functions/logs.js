import * as Sentry from '@sentry/react-native';

import {store} from '../../store/reduxStore';
import {mixPanelToken} from '../database/firebase/tokens';

import Mixpanel from 'react-native-mixpanel';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

import Snoopy from 'rn-snoopy';
import EventEmitter from 'react-native/Libraries/vendor/emitter/EventEmitter';
import filter from 'rn-snoopy/stream/filter';

const logMixpanel = ({label, params}) => {
  const {userID} = store.getState().user;
  Mixpanel.trackWithProperties(label, {...params, userID, date: new Date()});
  sentryAddBreadcrumb('action', label);
};

const isDevEnv = __DEV__;

const sentryCaptureException = (event) => {
  if (!isDevEnv) {
    Sentry.captureException(event);
  }
};

const sentryCaptureMessage = (message) => {
  if (!isDevEnv) {
    Sentry.captureMessage(message);
  }
};

const sentrySeverity = (string) => {
  switch (string) {
    case 'critical':
      return Sentry.Severity.Critical;
    case 'debug':
      return Sentry.Severity.Debug;
    case 'error':
      return Sentry.Severity.Error;
    case 'fatal':
      return Sentry.Severity.Fatal;
    case 'info':
      return Sentry.Severity.Info;
    case 'log':
      return Sentry.Severity.Log;
    case 'warning':
      return Sentry.Severity.Warning;
    default:
      return Sentry.Severity.Log;
  }
};

const logsBridgeRN = () => {
  const emitter = new EventEmitter();
  const events = Snoopy.stream(emitter);
  filter({type: Snoopy.TO_NATIVE}, true)(events).subscribe();
  filter({type: Snoopy.TO_JS}, true)(events).subscribe();
};

const sentryAddBreadcrumb = (category, message, level = 'info') => {
  if (!isDevEnv) {
    Sentry.addBreadcrumb({
      category: category,
      message: message,
      level: sentrySeverity(level),
    });
  }
};
export {
  logMixpanel,
  sentryAddBreadcrumb,
  sentryCaptureException,
  sentryCaptureMessage,
  logsBridgeRN,
};
