import {
  SET_MYGROUPS,
  SET_ALL_GROUPS,
  SET_GROUPS_AROUND,
  EDIT_GROUP
  } from './types';
  
  const setMygroups = (value) => ({
    type: SET_MYGROUPS,
    mygroups:value
  }); 

  const setAllGroups = (value) => ({
    type: SET_ALL_GROUPS,
    groupsToModify:value
  }); 

  const setGroupsAround = (value) => ({
    type: SET_GROUPS_AROUND,
    groupsAround:value
  }); 

  const editGroup = (value) => ({
    type: EDIT_GROUP,
    data:value
  }); 
  
  export const groupsAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setMygroups') {
        await dispatch(setMygroups(data))
      } else if (val == 'setAllGroups') {
        await dispatch(setAllGroups(data))
      } else if (val == 'setGroupsAround') {
        await dispatch(setGroupsAround(data))
      } else if (val == 'editGroup') {
        await dispatch(editGroup(data))
      }
      return true
    }
  }
  