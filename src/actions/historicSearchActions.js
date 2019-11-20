import {
  SET_LOCATION_SEARCH
  } from './types';
  
  const setLocationSearch = (value) => ({
    type: SET_LOCATION_SEARCH,
    searchLocation:value
  }); 
  
  
  export const historicSearchAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setLocationSearch') {
        await dispatch(setLocationSearch(data))
      }
      
      return true
    }
  }
  