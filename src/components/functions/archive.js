import React, {Component} from 'react';
import database from '@react-native-firebase/database';

import {store} from '../../../reduxStore';
import {setArchive, deleteArchive} from '../../actions/archivesActions';
import convertToCache from 'react-native-video-cache';

const getArchiveByID = (archiveID) => {
  return store.getState().archives
    ? store.getState().archives[archiveID]
    : null;
};

const bindArchive = (archiveID) => {
  database()
    .ref('archivedStreams/' + archiveID)
    .on('value', async function(snap) {
      const firebaseArchive = snap.val();
      if (firebaseArchive) {
        const storeArchive = getArchiveByID(archiveID);
        await store.dispatch(
          setArchive({
            ...firebaseArchive,
            id: archiveID,
            url: storeArchive?.localUrlCreated
              ? storeArchive.url
              : firebaseArchive.url,
            localUrlCreated: storeArchive?.localUrlCreated
              ? storeArchive.localUrlCreated
              : false,
          }),
        );
        if (!storeArchive?.localUrlCreated) {
          cacheArchive(archiveID);
        }
      } else {
        store.dispatch(deleteArchive(archiveID));
      }
    });
};

const unbindArchive = async (archiveID) => {
  database()
    .ref('archivedStreams/' + archiveID)
    .off();
};

const cacheArchive = async (archiveID) => {
  const archive = getArchiveByID(archiveID);
  const {local, url, localUrlCreated} = archive;
  if (!local && !localUrlCreated) {
    const cachedUrl = await convertToCache(url);
    store.dispatch(
      setArchive({
        ...archive,
        url: cachedUrl,
        localUrlCreated: true,
      }),
    );
  }
};

module.exports = {
  getArchiveByID,
  bindArchive,
  unbindArchive,
};
