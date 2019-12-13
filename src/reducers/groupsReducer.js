import {
  SET_MYGROUPS,
  SET_ALL_GROUPS,
  SET_GROUPS_AROUND,
  EDIT_GROUP,
  ADD_MY_GROUP,
} from '../actions/types';
import union from 'lodash/union';

const initialState = {
  mygroups: [],
  allGroups: {},
  groupsAround: [],
};

const eventsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MYGROUPS:
      return {...state, mygroups: action.mygroups};
    case SET_GROUPS_AROUND:
      return {...state, groupsAround: action.groupsAround};
    case EDIT_GROUP:
      return {
        ...state,
        allGroups: {
          ...state.allGroups,
          [action.data.objectID]: {
            ...state.allGroups[action.data.objectID],
            ...action.data,
          },
        },
      };
    case ADD_MY_GROUP:
      return {...state, mygroups: union([action.objectID], state.mygroups)};
    case SET_ALL_GROUPS:
      return {
        ...state,
        allGroups: {...state.allGroups, ...action.groupsToModify},
      };
    default:
      return state;
  }
};

export default eventsReducer;
