import {
  SET_LOCATION_SEARCH,
  SET_HISTORIC_LOCATION_SEARCH,
  SET_SPORT
  } from './types';
  
  const setLocationSearch = (value) => ({
    type: SET_LOCATION_SEARCH,
    searchLocation:value
  }); 

  const setHistoricLocationSearch = (value) => ({
    type: SET_HISTORIC_LOCATION_SEARCH,
    historicSearchLocation:value
  }); 

  const setSport = (value) => ({
    type: SET_SPORT,
    sport:value
  }); 
  
  export const historicSearchAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'setLocationSearch') {
        await dispatch(setLocationSearch(data))
      } else if (val == 'setHistoricLocationSearch') {
        await dispatch(setHistoricLocationSearch(data))
      } else if (val == 'setSport') {
        await dispatch(setSport(data))
      }
      
      return true
    }
  }
  