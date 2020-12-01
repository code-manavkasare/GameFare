import {SET_POSTS, DELETE_POSTS, RESET_POSTS} from '../types';

const setPosts = (posts) => ({
  type: SET_POSTS,
  posts,
});

const deletePosts = (postsIDs) => ({
  type: DELETE_POSTS,
  postsIDs,
});

const resetPosts = () => ({
  type: RESET_POSTS,
});

export {setPosts, resetPosts, deletePosts};
