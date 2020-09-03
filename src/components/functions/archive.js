import React, {Component} from 'react';
import database from '@react-native-firebase/database';

import {store} from '../../../reduxStore';
import {setArchive, setArchiveBinded} from '../../actions/archivesActions';
// import convertToProxyURL from 'react-native-video-cache';
import convertToCache from 'react-native-video-cache';
import {setLayout} from '../../actions/layoutActions';
import {navigate} from '../../../NavigationService';

const bindArchive = (archiveID) => {
  const isArchiveBinded = store.getState().bindedArchives[archiveID];
  if (!isArchiveBinded) {
    database()
      .ref('archivedStreams/' + archiveID)
      .on('value', async function(snap) {
        let firebaseArchive = snap.val();
        try {
          if (!firebaseArchive.url) {
            store.dispatch(
              setArchive({
                ...firebaseArchive,
                id: archiveID,
                localUrlCreated: false,
              }),
            );
          } else {
            let {url} = firebaseArchive;
            url = await convertToCache(url);
            store.dispatch(
              setArchive({
                ...firebaseArchive,
                id: archiveID,
                url,
                localUrlCreated: true,
              }),
            );
          }
          store.dispatch(setArchiveBinded({id: archiveID, isBinded: true}));
        } catch (e) {
          console.log(e);
        }
      });
  }
};

const unbindArchive = async (archiveID) => {
  const isArchiveBinded = store.getState().bindedArchives[archiveID];
  if (!isArchiveBinded) {
    await database()
      .ref('archivedStreams/' + archiveID)
      .off();
    store.dispatch(setArchiveBinded({id: archiveID, isBinded: false}));
  }
};

module.exports = {
  bindArchive,
  unbindArchive,
};
