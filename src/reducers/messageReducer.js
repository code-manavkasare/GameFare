import {
    SET_CONVERSATION
} from '../actions/types';

const initialState = {
    'convo1':{
        members:['me','Tiff'],
        messages:{
            ['messageID']:{
                sender:'me',
                message:'Welcome to gamefare. We are very happy to have you onboard for this adventure.',
                type:'text',
                date:(new Date()).toString()
            }
        }
    }
}

const messageReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_CONVERSATION:
            return {...state,[action.conversationID]:action.messages};
        default:
            return state;
    }
}

export default eventsReducer;