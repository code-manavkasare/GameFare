import React, {Component} from 'react';

import database from '@react-native-firebase/database';

import {store} from '../../../reduxStore';
import {setArchive, setArchiveBinded} from '../../actions/archivesActions';
import {setLayout} from '../../actions/layoutActions';
import {navigate} from '../../../NavigationService';

const bindArchive = (archiveID) => {
  const isArchiveBinded = store.getState().bindedArchives[archiveID];
  if (!isArchiveBinded)
    database()
      .ref('archivedStreams/' + archiveID)
      .on('value', async function(snap) {
        let archive = snap.val();
        console.log('data got', archive);
        store.dispatch(setArchive({...archive, id: archiveID}));
        store.dispatch(setArchiveBinded({id: archiveID, isBinded: true}));
      });
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
