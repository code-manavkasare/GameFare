import {ProcessingManager} from 'react-native-video-processing';

const generateSnippetsFromFlags = async (source, flags) => {
  console.log('source: ', source);
  console.log('flags: ', flags);
  //TODO : delete example when data is good
  const flagsExample = {
    flag1: {id: 'flag1', startTime: 1000, stopTime: 4000, time: 2000},
    flag2: {id: 'flag2', startTime: 2000, stopTime: 5000, time: 3000},
    flag3: {id: 'flag3', startTime: 3000, stopTime: 6000, time: 5000},
  };
  const sourceExample =
    'file:///private/var/mobile/Containers/Data/Application/07A87600-4F3F-4BA8-A2A6-5DAF7041655E/tmp/react-native-image-crop-picker/3A5711F9-6C57-4621-BCE7-9100D781BBAD.mp4';

  let flagsWithSnippets = flagsExample;

  for (const flag of Object.values(flagsExample)) {
    console.log('flag: ', flag);
    const {id, startTime, stopTime} = flag;
    const trimOptions = {
      startTime: startTime / 1000,
      endTime: stopTime / 1000,
      saveToCameraRoll: true,
      saveWithCurrentDate: true,
    };

    await ProcessingManager.trim(sourceExample, trimOptions).then(
      (snippetLocalPath) => {
        flagsWithSnippets[id].snippetLocalPath = snippetLocalPath;
      },
    );
  }
  return flagsWithSnippets;
};

export {generateSnippetsFromFlags};
