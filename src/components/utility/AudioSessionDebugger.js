import AudioSession from 'react-native-audio-session';
import DeviceInfo from 'react-native-device-info';

const audioDebugger = async (options) => {
  let {interval, disabled} = options;
  interval = interval ? interval : 5000;

  // Get device name
  const device = await DeviceInfo.getDeviceName();

  !disabled &&
    setInterval(async () => {
      console.log('');
      console.log(' AVAudioSession Info');
      console.log('  Device |', device);

      // Get current AVAudioSession category
      AudioSession.currentCategory()
        .then((category) => {
          console.log('Category |', category);
        })
        .catch((e) => {
          console.log('Category | nil');
        });

      // Get current AVAudioSession options
      AudioSession.currentCategoryOptions()
        .then((options) => {
          console.log(' Options |', options);
        })
        .catch((e) => {
          console.log(' Options | nil');
        });
      // Get current AVAudioSession mode
      AudioSession.currentMode()
        .then((mode) => {
          console.log('    Mode |', mode);
        })
        .catch((e) => {
          console.log('    Mode | nil');
        });
    }, interval);
};

export {audioDebugger};
