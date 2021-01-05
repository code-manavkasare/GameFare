import {createSelector} from 'reselect';

const uploadQueueSubSelector = (state) => state.uploadQueue;
const queueSubSelector = (state) => state.uploadQueue.queue;
const statusSubSelector = (state) => state.uploadQueue.queue;

const uploadQueueSelector = createSelector(
  uploadQueueSubSelector,
  (item) => item,
);

const queueSelector = createSelector(
  queueSubSelector,
  (item) => item.queue,
);

const statusUploadSelector = createSelector(
  statusSubSelector,
  (item) => item,
);

export {uploadQueueSelector, queueSelector, statusUploadSelector};
