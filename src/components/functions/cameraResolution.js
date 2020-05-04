import {getDeviceId} from 'react-native-device-info';

const getDeviceFormated = () => {
  let deviceId = getDeviceId();
  deviceId = deviceId.split(',')[0];
  deviceId = Number(deviceId.split('iPhone')[1]);
  return deviceId;
};

/*
Device ID:

iphone 5s -> 6
iphone 6 -> 7
iphone 6s,SE -> 8
iphone 7 -> 9
iphone 8,X -> 10
iphone Xs -> 11
iphone 11 -> 12

*/

const getResolutions = (cameraFront) => {
  const deviceID = getDeviceFormated();
  console.log('deviceID', deviceID);
  if (deviceID === 7) {
    if (cameraFront)
      return [
        {
          text: 'Normal',
          resolution: [720, 30],
        },
      ];
    return [
      {
        text: 'Normal',
        resolution: [1080, 60],
      },
      {
        text: 'Slow mo',
        resolution: [720, 240],
      },
    ];
  }
  if (deviceID === 8) {
    if (cameraFront)
      return [
        {
          text: 'Normal',
          resolution: [720, 30],
        },
      ];
    return [
      {
        text: 'Normal',
        resolution: [1080, 60],
      },
      {
        text: 'Slow mo',
        resolution: [1080, 120],
      },
      {
        text: 'Super slow mo',
        resolution: [720, 240],
      },
    ];
  }
  if (deviceID === 9) {
    if (cameraFront)
      return [
        {
          text: 'Normal',
          resolution: [1080, 30],
        },
      ];
    return [
      {
        text: 'Normal',
        resolution: [1080, 60],
      },
      {
        text: 'Slow mo',
        resolution: [1080, 120],
      },
      {
        text: 'Super slow mo',
        resolution: [720, 240],
      },
    ];
  }
  if (deviceID === 10) {
    if (cameraFront)
      return [
        {
          text: 'Normal',
          resolution: [1080, 30],
        },
        {
          text: 'Slow mo',
          resolution: [720, 240],
        },
      ];
    return [
      {
        text: 'Normal',
        resolution: [1080, 60],
      },
      {
        text: 'Slow mo',
        resolution: [1080, 120],
      },
      {
        text: 'Super slow mo',
        resolution: [1080, 240],
      },
    ];
  }
  if (deviceID === 11) {
    if (cameraFront)
      return [
        {
          text: 'Normal',
          resolution: [1080, 60],
        },
        {
          text: 'Slow mo',
          resolution: [720, 240],
        },
      ];
    return [
      {
        text: 'Normal',
        resolution: [1080, 60],
      },
      {
        text: 'Slow mo',
        resolution: [1080, 120],
      },
      {
        text: 'Super slow mo',
        resolution: [1080, 240],
      },
    ];
  }
  if (deviceID === 12) {
    if (cameraFront)
      return [
        {
          text: 'Normal',
          resolution: [1080, 60],
        },
        {
          text: 'Slow mo',
          resolution: [1080, 120],
        },
      ];
    return [
      {
        text: 'Normal',
        resolution: [1080, 60],
      },
      {
        text: 'Slow mo',
        resolution: [1080, 120],
      },
      {
        text: 'Super slow mo',
        resolution: [1080, 240],
      },
    ];
  }
};

module.exports = {
  getResolutions,
};
