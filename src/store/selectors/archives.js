import {createSelector} from 'reselect';

const localVideosSelector = (state) =>
  state.localVideoLibrary.userLocalArchives;
const videoLibrarySubSelector = (state) => state.localVideoLibrary.videoLibrary;

const archiveSubSelector = (state, props) => state.archives[props.id];
const archivedStreamsSelector = (state) => state.userCloudArchives;
const userLocalArchivesSubSelector = (state) =>
  state.localVideoLibrary.userLocalArchives;

const lastDeletedArchiveIdsSubSelector = (state) =>
  state.localVideoLibrary.lastDeletedArchiveIds;

const cloudVideosSelector = createSelector(
  archivedStreamsSelector,
  (cloudVideos) => cloudVideos,
);

const allVideosSelector = createSelector(
  localVideosSelector,
  archivedStreamsSelector,
  (localVideos, cloudVideos) => {
    return {...localVideos, ...cloudVideos};
  },
);

const videoLibrarySelector = createSelector(
  allVideosSelector,
  (videos) =>
    Object.values(videos)
      .filter((v) => v.id && v.startTimestamp)
      .sort((a, b) => b.startTimestamp - a.startTimestamp)
      .map((v) => v.id),
);

const archiveSelector = createSelector(
  archiveSubSelector,
  (archive) => {
    if (!archive) return archive;
    return archive;
  },
);

const userLocalArchivesSelector = createSelector(
  userLocalArchivesSubSelector,
  (item) => item,
);

const thumbnailSelector = createSelector(
  archiveSubSelector,
  (archive) => {
    if (!archive) return '';
    return archive.thumbnail;
  },
);

const videoLibraryUploadSelector = createSelector(
  videoLibrarySubSelector,
  (item) => item,
);

const lastDeletedArchiveIdsSelector = createSelector(
  lastDeletedArchiveIdsSubSelector,
  (item) => item,
);

export {
  videoLibrarySelector,
  archiveSelector,
  cloudVideosSelector,
  userLocalArchivesSelector,
  thumbnailSelector,
  videoLibraryUploadSelector,
  lastDeletedArchiveIdsSelector,
};
