import {
  SET_LOCATION_SEARCH,
  SET_HISTORIC_LOCATION_SEARCH,
  SET_SPORT,
  SET_LEAGUE,
} from '../actions/types';

const initialState = {
  historicSearchLocation: {},
  searchLocation: {
    address: 'Los Angeles, California',
    lat: 34.052235,
    lng: -118.243683,
  },
  sport: '',
  league: '',
};

const historicSearchReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_HISTORIC_LOCATION_SEARCH:
      return {...state, historicSearchLocation: action.historicSearchLocation};
    case SET_LOCATION_SEARCH:
      return {...state, searchLocation: action.searchLocation};
    case SET_SPORT:
      return {
        ...state,
        sport: action.sport,
        league: action.league ? action.league : state.league,
      };
    case SET_LEAGUE:
      return {...state, league: action.league};
    default:
      return state;
  }
};

export default historicSearchReducer;
