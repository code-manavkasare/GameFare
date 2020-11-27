import {createSelector} from 'reselect';

const wifiAutoUploadSubSelector = (state) => state.appSettings.wifiAutoUpload;

const wifiAutoUploadSelector = createSelector(
  wifiAutoUploadSubSelector,
  (item) => item,
);

export {wifiAutoUploadSelector};
