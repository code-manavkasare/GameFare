import {
} from '../actions/types';

const initialState = {

}

const globaleVariablesReducer =  (state=initialState,action) => {
    switch (action.type){
        // case OPEN_REVIEW:
        //     return {...state,showReview:action.showReview,infoReview:action.infoReview};
        default:
            return state;
    }
}

export default globaleVariablesReducer;