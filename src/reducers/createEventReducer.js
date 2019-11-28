import {
    SET_STEP0,
    SET_STEP1,
    SET_STEP2,
    RESET
} from '../actions/types';

const initialState = {
    step0:{
        sport:'',
        league:'',
        rule:'',
    },
    step1:{
        level:-1,
        levelOption:'equal',
        gender:'mixed',
        numberPlayers:1
    },
    step2:{},
    listGender:[{
        "icon" : "venus-mars",
        "text" : "Mixed",
        "typeIcon" : "font",
        "value" : "mixed"
        }, {
        "icon" : "venus",
        "text" : "Female",
        "typeIcon" : "font",
        "value" : "female"
        }, {
        "icon" : "mars",
        "text" : "Male",
        "typeIcon" : "font",
        "value" : "male"
    }],
    listLevelOption:[{value:'equal',text:'Only'},{value:'min',text:'And above'},{value:'max',text:'And below'}]
}

const createEventReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_STEP0:
            return {...state,step0:action.step0};
        case SET_STEP1:
                return {...state,step1:action.step1};
        case SET_STEP2:
            return {...state,step2:action.step2};
        case RESET:
            return initialState;
        default:
            return state;
    }
}

export default createEventReducer;