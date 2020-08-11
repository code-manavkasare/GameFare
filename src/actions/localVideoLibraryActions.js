import {ADD_VIDEOS_LOCAL_LIBRARY, DELETE_VIDEO_LOCAL_LIBRARY, DELETE_SNIPPET_LOCAL_LIBRARY} from './types';

export const addVideos = (value) => ({
  type: ADD_VIDEOS_LOCAL_LIBRARY,
  videos: value,
});

export const deleteVideo = (value) => ({
  type: DELETE_VIDEO_LOCAL_LIBRARY,
  videoID: value,
});

export const deleteSnippet = (value) => ({
  type: DELETE_SNIPPET_LOCAL_LIBRARY,
  id: value.id,
  parent: value.parent,
})

export const localVideoLibraryAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'addVideos') {
      await dispatch(addVideos(data));
    } else if (val === 'deleteVideo') {
      await dispatch(deleteVideo(data));
    } else if (val === 'deleteSnippet') {
      await dispatch(deleteVideo(data));
    }
    return true;
  };
};
