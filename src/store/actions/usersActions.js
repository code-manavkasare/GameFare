import {SET_USERS, RESET_USERS} from '../types';

const setUsers = (users) => ({
  type: SET_USERS,
  users,
});

const resetUsers = () => ({
  type: RESET_USERS,
});

export {setUsers, resetUsers};
