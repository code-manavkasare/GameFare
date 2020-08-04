import {
  SET_CAPTAINS_CHALLENGE,
  RESET_CHALLENGECREATE_DATA,
  SET_INFO_CHALLENGE,
  SET_LOCATION_CHALLENGE,
  SET_DATE_CHALLENGE,
  SET_PRICE_CHALLENGE,
  SET_TEAMS_DATA,
} from '../actions/types';

// import {generateID} from '../components/functions/createEvent';

// const idTeam1 = generateID();
// const idTeam2 = generateID();

const initialState = {
  info: {
    sport: '',
    format: '',
    image: '',
    name: '',
    instructions: '',
  },
  price: {
    amount: 20,
    odds: 1,
  },
  date: {
    start: '',
    end: '',
  },
  location: {},
  // teamsData: {
  //   typeChallengeTeam: false,
  //   oponent: {},
  //   allMembers: {},
  //   teams: {
  //     [idTeam1]: {
  //       id: idTeam1,
  //       name: 'Team 1',
  //       createdAt: Number(new Date()),
  //     },
  //     [idTeam2]: {
  //       id: idTeam2,
  //       name: 'Team 2',
  //       createdAt: Number(new Date()),
  //     },
  //   },
  // },
};

const createChallengeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CAPTAINS_CHALLENGE:
      return {...state, captains: action.captains};
    case SET_LOCATION_CHALLENGE:
      return {...state, location: {...state.location, ...action.location}};
    case SET_DATE_CHALLENGE:
      return {...state, date: {...state.date, ...action.date}};
    case SET_PRICE_CHALLENGE:
      return {...state, price: {...state.price, ...action.price}};
    case SET_INFO_CHALLENGE:
      return {...state, info: {...state.info, ...action.info}};
    case SET_TEAMS_DATA:
      return {...state, teamsData: {...state.teamsData, ...action.teamsData}};
    case RESET_CHALLENGECREATE_DATA:
      return initialState;
    default:
      return state;
  }
};

export default createChallengeReducer;
