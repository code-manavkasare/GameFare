import {
  SET_MYGROUPS
  } from './types';
  
  const setMygroups = (value) => ({
    type: SET_MYGROUPS,
    mygroups:value
  }); 
  
  export const groupsAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setMygroups') {
        await dispatch(setMygroups(data))
      }
      return true
    }
  }
  