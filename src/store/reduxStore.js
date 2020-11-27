import {applyMiddleware, createStore} from 'redux';
import {persistStore, persistReducer, createMigrate} from 'redux-persist';
import {
  createNetworkMiddleware,
  offlineActionCreators,
  checkInternetConnection,
} from 'react-native-offline';
import {composeWithDevTools} from 'remote-redux-devtools';
import AsyncStorage from '@react-native-community/async-storage';
import thunk from 'redux-thunk';

import rootReducer from './reducers';
const networkMiddleware = createNetworkMiddleware();
const middlewares = [networkMiddleware, thunk];

if (__DEV__) {
  const createDebugger = require('redux-flipper').default;
  middlewares.push(createDebugger());
}

const migrations = {
  2: (state) => {
    return {
      ...state,
      userCloudArchives: {
        ['demoVideo']: {
          bitrate: 2597953,
          durationSeconds: 40,
          frameRate: 30,
          fromNativeLibrary: false,
          id: 'demoVideo',
          local: false,
          size: {width: 720, height: 1280},
          sourceUser: 'UTylyySkfEa4eOqDAQEKDiCggHp1',
          startTimestamp: 1599673574851,
          thumbnail:
            'https://firebasestorage.googleapis.com/v0/b/gamefare-dev-cfc88.appspot.com/o/Demo%2FDemo%20thumbnail.jpg?alt=media&token=51b60f1e-612e-406a-b391-938d1c295146',
          thumbnailSize: {width: 1125, height: 2436},
          uploadedByUser: true,
          url:
            'https://app.box.com/shared/static/plq4mdtro8gjrpj18o0fv7n6o32obmfe.mov',
          volatile: false,
        },
        user: {infoUser: {userInfo: {}}, wallet: {}},
      },
    };
  },
};

const persistConfig = {
  key: 'root',
  timeout: 10000,
  storage: AsyncStorage,
  version: 2,
  blacklist: ['message', 'coach', 'layout', 'network', 'connectionType'],
  migrate: createMigrate(migrations, {debug: true}),
};

const pReducer = persistReducer(persistConfig, rootReducer);
const composeEnhancers = composeWithDevTools({realtime: true});

export const store = createStore(
  pReducer,
  composeEnhancers(applyMiddleware(...middlewares)),
);

export const storeInitializationAfterRehydration = async () => {
  // After rehydration completes, we detect initial connection
  const isConnected = await checkInternetConnection();
  const {connectionChange} = offlineActionCreators;
  await store.dispatch(connectionChange(isConnected));
};

export const persistor = persistStore(store, null, () => {
  storeInitializationAfterRehydration();
});
