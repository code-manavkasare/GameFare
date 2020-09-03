import {
  ADD_VIDEOS_LOCAL_LIBRARY,
  REMOVE_VIDEO_LOCAL_LIBRARY,
  DELETE_SNIPPET_LOCAL_LIBRARY,
  HIDE_VIDEO_LOCAL_LIBRARY,
  UPDATE_PATH_LOCAL_LIBRARY,
  UPDATE_THUMBNAIL_LOCAL_LIBRARY,
  UPDATE_PROGRESS_LOCAL_VIDEO,
} from './types';

export const addVideos = (value) => ({
  type: ADD_VIDEOS_LOCAL_LIBRARY,
  videos: value,
});

export const removeVideo = (value) => ({
  type: REMOVE_VIDEO_LOCAL_LIBRARY,
  videoID: value,
});

export const hideVideo = (value) => ({
  type: HIDE_VIDEO_LOCAL_LIBRARY,
  videoID: value,
});

export const deleteSnippet = (value) => ({
  type: DELETE_SNIPPET_LOCAL_LIBRARY,
  id: value.id,
  parent: value.parent,
});

export const updateLocalPath = (value) => ({
  type: UPDATE_PATH_LOCAL_LIBRARY,
  videoID: value.id,
  url: value.url,
});

export const updateLocalThumbnail = (value) => ({
  type: UPDATE_THUMBNAIL_LOCAL_LIBRARY,
  videoID: value.id,
  thumbnail: value.thumbnail,
});

export const updateProgressLocalVideo = (value) => ({
  type: UPDATE_PROGRESS_LOCAL_VIDEO,
  videoID: value.videoID,
  progress: value.progress,
});

export const localVideoLibraryAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'addVideos') {
      await dispatch(addVideos(data));
    } else if (val === 'removeVideo') {
      await dispatch(removeVideo(data));
    } else if (val === 'hideVideo') {
      await dispatch(hideVideo(data));
    } else if (val === 'updateLocalPath') {
      await dispatch(updateLocalPath(data));
    } else if (val === 'updateLocalThumbnail') {
      await dispatch(updateLocalThumbnail(data));
    } else if (val === 'updateProgressLocalVideo') {
      await dispatch(updateProgressLocalVideo(data));
    }
    return true;
  };
};
