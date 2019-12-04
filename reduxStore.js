import { createStore,applyMiddleware,compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
// const { REHYDRATE }  = require('redux-persist/constants')
// import storage from 'redux-persist/lib/storage';

import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import rootReducer from './src/reducers';
import thunk from 'redux-thunk';
import AsyncStorage from '@react-native-community/async-storage';



const persistConfig = {
 key: 'root',
 storage: AsyncStorage,
 blacklist: ['conversations','events']
 // stateReconciler: autoMergeLevel2 // see "Merge Process" section for details.
};
import { composeWithDevTools } from 'remote-redux-devtools';

const pReducer = persistReducer(persistConfig, rootReducer);
const composeEnhancers = composeWithDevTools({ realtime: true });

export const store = createStore(pReducer,
    composeEnhancers(
      applyMiddleware(thunk)
    ));
export const persistor = persistStore(store);
