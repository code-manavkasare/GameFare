import {SET_CLUBS, DELETE_CLUBS, RESET_CLUBS,SET_CLUB} from '../types';

const setClubs = (clubs) => ({
  type: SET_CLUBS,
  clubs,
});

const setClub = (club) => ({
  type: SET_CLUB,
  club,
});

const deleteClubs = (clubsIDs) => ({
  type: DELETE_CLUBS,
  clubsIDs,
});

const resetClubs = () => ({
  type: RESET_CLUBS,
});

export {setClubs, setClub, resetClubs, deleteClubs};
