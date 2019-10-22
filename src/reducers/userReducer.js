import {
    SET_USER_INFO,
    RESET_USER_INFO
} from '../actions/types';

const initialState = {
    userConnected: false,
    infoUser:{},
    country:{
        "name": "United States",
        "dial_code": "+1",
        "code": "US"
    },
}


const userReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_USER_INFO:
            return {...state,userConnected:action.userInfo.userConnected,infoUser:action.userInfo.infoUser}
        case RESET_USER_INFO:
            return initialState;
        default:
            return state;

    }
}

export default userReducer;