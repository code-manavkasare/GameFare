import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import {reducer as network} from 'react-native-offline';
import {composeWithDevTools} from 'remote-redux-devtools';

import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import rootReducer from './src/reducers';
import thunk from 'redux-thunk';
import AsyncStorage from '@react-native-community/async-storage';

const middlewares = [thunk];

if (__DEV__) {
  const createDebugger = require('redux-flipper').default;
  middlewares.push(createDebugger());
  console.log('middlewares: ', middlewares);
}

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: [
    'conversations',
    'events',
    'message',
    'createChallengeData',
    'coach',
    'layout',
    'globaleVariables',
    'uploadQueue',
  ],
  // stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};

const pReducer = persistReducer(persistConfig, rootReducer);
const composeEnhancers = composeWithDevTools({realtime: true});

export const store = createStore(
  pReducer,
  composeEnhancers(applyMiddleware(...middlewares)),
);
export const persistor = persistStore(store);
