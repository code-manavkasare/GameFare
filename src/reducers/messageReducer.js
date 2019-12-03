import {
    SET_CONVERSATION
} from '../actions/types';

const initialState = {
    'convo1':{
        id :'convo1',
        members:[
            {firstname:'Florian',lastname:'Birolleau',userID:'fkQAXcr0lQRTvZN9CNkdHRR0jR93'},
            {firstname:'Tiff',lastname:'Ambler',userID:''}
        ],
        messages:[{
                _id:'sdgfdfgdgfdgdf',
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/sports%2Ftennis%2FtypeEvent%2Fball%20(1).png?alt=media&token=a7be580e-a13b-4432-92bb-b31014675ab3',
                },
                text:'Welcome to gamefare. We are very happy to have you onboard for this adventure.',
                createdAt: new Date(Date.UTC(2016, 5, 11, 17, 20, 0)),
            },
            {
                _id:'sdfdfsdfsdfsdfsfsd',
                user: {
                    _id: 2,
                    name: 'React Native',
                    avatar: 'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/sports%2Ftennis%2FtypeEvent%2Fball%20(1).png?alt=media&token=a7be580e-a13b-4432-92bb-b31014675ab3',
                },
                text:'Hey gamefare',
                createdAt:new Date()
            },
            {
                _id:'sfdklhkg;heri;oiirugkdfl',
                user: {
                    _id: 'fkQAXcr0lQRTvZN9CNkdHRR0jR93',
                    name: 'React Native',
                    avatar: 'https://facebook.github.io/react/img/logo_og.png',
                },
                text:'https://gamefare.app.link/skldfjk',
                createdAt:new Date()
            }
        ]
    }
}

const messageReducer =  (state=initialState,action) => {
    switch (action.type){
        case SET_CONVERSATION:
            return {...state,[action.conversationID]:{
                ...state[action.conversationID],
                messages:action.messages
            }};
        default:
            return state;
    }
}

export default messageReducer;