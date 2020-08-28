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
  const currentArchive = store.getState().archives[archiveID];
  if (!isArchiveBinded) {
    database()
      .ref('archivedStreams/' + archiveID)
      .on('value', async function(snap) {
        let archive = snap.val();
        let {url} = archive;
        try {
          // url = await convertToCache(url);
        } catch (e) {
          console.log(e);
        }
        store.dispatch(
          setArchive({
            ...archive,
            id: archiveID,
            url,
            localUrlCreated: true,
          }),
        );
        store.dispatch(setArchiveBinded({id: archiveID, isBinded: true}));
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
