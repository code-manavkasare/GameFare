import {
  SET_MEMBERS_CHALLENGE,
  RESET_CHALLENGECREATE_DATA,
  SET_INFO_CHALLENGE,
  SET_LOCATION_CHALLENGE,
  SET_DATE_CHALLENGE,
} from '../actions/types';

const initialState = {
  members: {},
  info: {
    sport: '',
    format: '',
    image: '',
    name: '',
    instructions: '',
  },
  date: {
    start: '',
    end: '',
  },
  location: {},
};

const createChallengeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MEMBERS_CHALLENGE:
      return {...state, members: {...state.members, ...action.members}};
    case SET_LOCATION_CHALLENGE:
      return {...state, location: {...state.location, ...action.location}};
    case SET_DATE_CHALLENGE:
      return {...state, date: {...state.date, ...action.date}};
    case SET_INFO_CHALLENGE:
      return {...state, info: {...state.info, ...action.info}};
    case RESET_CHALLENGECREATE_DATA:
      return initialState;
    default:
      return state;
  }
};

export default createChallengeReducer;
