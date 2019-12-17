import {
  SET_INFO_GROUP_CREATE,
  SET_IMG_GROUP_CREATE,
  SET_LOCATION_GROUP_CREATE,
  RESET_GROUPCREATE_DATA,
} from './types';

const setInfoCreateGroup = value => ({
  type: SET_INFO_GROUP_CREATE,
  info: value,
});
const setImgCreateGroup = value => ({
  type: SET_IMG_GROUP_CREATE,
  img: value,
});
const setLocationCreateGroup = value => ({
  type: SET_LOCATION_GROUP_CREATE,
  location: value,
});

const reset = () => ({
  type: RESET_GROUPCREATE_DATA,
});

export const createGroupAction = (val, data) => {
  return async function(dispatch) {
    if (val === 'setInfoCreateGroup') {
      await dispatch(setInfoCreateGroup(data));
    } else if (val === 'setImgCreateGroup') {
      await dispatch(setImgCreateGroup(data));
    } else if (val === 'setLocationCreateGroup') {
      await dispatch(setLocationCreateGroup(data));
    } else if (val === 'reset') {
      await dispatch(reset());
    }
    return true;
  };
};
