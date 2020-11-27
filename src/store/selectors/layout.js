import {createSelector} from 'reselect';

const generalSessionRecordingSubSelector = (state) =>
  state.layout.generalSessionRecording;

const currentScreenSizeSubSelector = (state) => state.layout.currentScreenSize;
const notificationSubSelector = (state) => state.layout.notification;
const cameraAvailabilitySubSelector = (state) =>
  state.layout.cameraAvailability;

const generalSessionRecordingSelector = createSelector(
  generalSessionRecordingSubSelector,
  (item) => item,
);

const currentScreenSizeSelector = createSelector(
  currentScreenSizeSubSelector,
  (item) => item,
);

const portraitSelector = createSelector(
  currentScreenSizeSubSelector,
  (item) => item.portrait,
);

const notificationSelector = createSelector(
  notificationSubSelector,
  (item) => item,
);

const cameraAvailabilitySelector = createSelector(
  cameraAvailabilitySubSelector,
  (item) => item,
);
 

export {
  generalSessionRecordingSelector,
  currentScreenSizeSelector,
  notificationSelector,
  cameraAvailabilitySelector,
  portraitSelector,
};
