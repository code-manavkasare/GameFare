import {
  SET_MYGROUPS,
  SET_ALL_GROUPS,
  SET_GROUPS_AROUND
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
  
  export const groupsAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setMygroups') {
        await dispatch(setMygroups(data))
      }
      return true
    }
  }
  