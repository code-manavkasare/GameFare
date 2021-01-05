import {createSelector} from 'reselect';
import {infoUserSubSelector} from './user';

const wifiAutoUploadSelector = createSelector(
  infoUserSubSelector,
  (item) => {
    if (!item.appSettings) return false;
    return item.appSettings.wifiAutoUpload;
  },
);

export {wifiAutoUploadSelector};
