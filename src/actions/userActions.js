import {
    SET_USER_INFO,
    RESET_USER_INFO
  } from './types';
  
  const setUserInfo = (value) => ({
    type: SET_USER_INFO,
    userInfo:value
  }); 

  const resetUserInfo = () => ({
    type: RESET_USER_INFO
  }); 
  
  
  export const userAction = (val,data) =>{
    return async function(dispatch){
      if (val == 'signIn') {
        console.log('we sign in user')
        console.log(data)
        var userInfo = {
          userConnected:true,
          infoUser:{}
        }
        await dispatch(setUserInfo(userInfo))
        return true
      } else if (val == 'logout') {
        console.log('logout!!!!!')
        await dispatch(resetUserInfo())
        return true
      }
      return true
    }
  }
  