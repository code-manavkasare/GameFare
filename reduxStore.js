import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import {
  reducer as network,
  createNetworkMiddleware,
  offlineActionCreators,
  checkInternetConnection,
} from 'react-native-offline';
import {composeWithDevTools} from 'remote-redux-devtools';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import AsyncStorage from '@react-native-community/async-storage';
import thunk from 'redux-thunk';

import {setArchiveFirebaseBindStatus} from './src/actions/userActions.js';
import rootReducer from './src/reducers';

const networkMiddleware = createNetworkMiddleware();
const middlewares = [networkMiddleware, thunk];

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
    'network',
  ],
  // stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};

const pReducer = persistReducer(persistConfig, rootReducer);
const composeEnhancers = composeWithDevTools({realtime: true});

export const store = createStore(
  pReducer,
  composeEnhancers(applyMiddleware(...middlewares)),
);

const storeInitializationAfterRehydration = () => {
  // After rehydration completes, we detect initial connection
  checkInternetConnection().then((isConnected) => {
    const {connectionChange} = offlineActionCreators;
    store.dispatch(connectionChange(isConnected));
  });
  //Initialize Firebase Bindings to false
  const archivedStreams = store.getState().user.infoUser.archivedStreams;
  for (const archive of Object.values(archivedStreams)) {
    store.dispatch(setArchiveFirebaseBindStatus(archive.id, false));
  }
};

export const persistor = persistStore(store, null, () => {
  storeInitializationAfterRehydration();
});
