import {SET_CONTENT} from '../types';

const setContent = (value) => ({
  type: SET_CONTENT,
  content: value,
});

module.exports = {setContent};
