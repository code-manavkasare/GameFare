import {
    SET_VARIABLES
  } from './types';
  
  const setVariables = (value) => ({
    type: SET_VARIABLES,
    value:value
  }); 
  
  
  export const globaleVariablesAction = (value) =>{
    return async function(dispatch){
      await dispatch(setVariables(value))
      return true
    }
  }
  