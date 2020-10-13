import * as Sentry from '@sentry/react-native';

import {store} from '../../../reduxStore';
import {mixPanelToken} from '../database/firebase/tokens';

import Mixpanel from 'react-native-mixpanel';
Mixpanel.sharedInstanceWithToken(mixPanelToken);

const logMixpanel = ({label, params}) => {
  const {userID} = store.getState().user;
  Mixpanel.trackWithProperties(label, {...params, userID, date: new Date()});
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
};
