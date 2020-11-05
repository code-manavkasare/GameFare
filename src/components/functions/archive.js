import {store} from '../../store/reduxStore';
import {setArchive} from '../../store/actions/archivesActions';
import convertToCache from 'react-native-video-cache';

const getArchiveByID = (archiveID) => {
  return store.getState().archives
    ? store.getState().archives[archiveID]
    : null;
};

const cacheArchive = async (archiveID) => {
  const archive = getArchiveByID(archiveID);
  const {local, url, localUrlCreated} = archive;
  if (!local && !localUrlCreated && url) {
    const cachedUrl = await convertToCache(url);
    if (cachedUrl)
      store.dispatch(
        setArchive({
          ...archive,
          url: cachedUrl,
          localUrlCreated: true,
        }),
      );
  }
};

export {getArchiveByID, cacheArchive};
