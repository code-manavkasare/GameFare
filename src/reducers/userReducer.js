import {
    SET_USER_INFO,
    RESET_USER_INFO
} from '../actions/types';

const initialState = {
    userConnected: false,
    infoUser:{
        userInfo:{
        },
        wallet:{}
    },
    userID:'',
    phoneNumber: '',
    userIDSaved:'',
    country:{
        "name": "United States",
        "dial_code": "+1",
        "code": "US"
    },
}


const userReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_USER_INFO:
            return {...state,...action.userInfo}
        case RESET_USER_INFO:
            return initialState;
        default:
            return state;

    }
}

export default userReducer;