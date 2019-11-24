import {
  SET_STEP0,
  SET_STEP1,
  SET_STEP2,
  
  } from './types';
  
  const setStep0 = (value) => ({
    type: SET_STEP0,
    step0:value
  }); 
  const setStep1 = (value) => ({
    type: SET_STEP1,
    step1:value
  }); 
  const setStep2 = (value) => ({
    type: SET_STEP2,
    step2:value
  }); 

  
  export const createEventAction = (val,data) =>{
    return async function(dispatch){
      console.log('setStep +' + val)
      if (val == 'setStep0') {
        await dispatch(setStep0(data))
      } else if (val == 'setStep1') {
        await dispatch(setStep1(data))
      } else if (val == 'setStep2') {
        await dispatch(setStep2(data))
      }
      
      return true
    }
  }
  