import {
  SET_MYGROUPS,
  SET_ALL_GROUPS,
  SET_GROUPS_AROUND,
  EDIT_GROUP,
  ADD_MY_GROUP,
  DELETE_MY_GROUP,
} from '../actions/types';
import union from 'lodash/union';

const initialState = {
  mygroups: [],
  allGroups: {},
  groupsAround: [],
};

function getInfoGroup(state, action) {
  if (state.allGroups[action.data.objectID]) {
    return {
      ...action.data.info,
      ...state.allGroups[action.data.objectID].info,
    };
  }
  return action.data.info;
}

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
            info: getInfoGroup(state, action),
          },
        },
      };
    case ADD_MY_GROUP:
      return {...state, mygroups: union([action.objectID], state.mygroups)};
    case DELETE_MY_GROUP:
      return {
        ...state,
        mygroups: state.mygroups.filter((group) => group !== action.objectID),
      };
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
