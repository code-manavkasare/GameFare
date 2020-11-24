import React from 'react';
import {View} from 'react-native';

import colors from '../../../style/colors';

import {rowTitle} from '../../TeamPage/components/elements';

const pickerlocalVideos = ({lengthGameFareLibrary, addFromCameraRoll}) => {
  return (
    <View>
      {rowTitle({
        icon: {
          name: 'video-camera',
          type: 'moon',
          color: colors.title,
          size: 20,
        },
        hideDividerHeader: false,
        button: {
          text: 'Select',
          click: () => addFromCameraRoll({selectOnly: true}),
        },
        title: 'Camera roll',
      })}

      <View style={{marginLeft: '-5%', marginBottom: -10, width: '110%'}} />

      {rowTitle({
        icon: {name: 'galery', type: 'moon', color: colors.title, size: 20},
        hideDividerHeader: true,

        badge: lengthGameFareLibrary,
        title: 'GameFare',
      })}
    </View>
  );
};

export {pickerlocalVideos};
