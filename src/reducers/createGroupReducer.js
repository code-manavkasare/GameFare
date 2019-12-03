import {
    SET_INFO_GROUP_CREATE,
    SET_IMG_GROUP_CREATE,
    SET_LOCATION_GROUP_CREATE
} from '../actions/types';

const initialState = {
    info:{
        name:'',
        description:'',
        sport:'',
        public:true
    },
    img:'',
    location:{
        address:''
    }
}

const createGroupReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_INFO_GROUP_CREATE:
            return {...state,info:{...state.info,...action.info}};
        case SET_IMG_GROUP_CREATE:
            return {...state,img:action.img};
        case SET_LOCATION_GROUP_CREATE:
            return {...state,location:action.location};
        default:
            return state;
    }
}

export default createGroupReducer;