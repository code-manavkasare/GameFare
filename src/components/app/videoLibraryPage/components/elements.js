import React, {Component} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

import {getSortedMembers} from '../../../functions/session';
import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import ButtonColor from '../../../layout/Views/Button';
import {navigate} from '../../../../../NavigationService';
import CardConversation from '../../elementsMessage/CardConversation';
import {FlatListComponent} from '../../../layout/Views/FlatList';

import {store} from '../../../../../reduxStore';
import {unsetCurrentSession} from '../../../../actions/coachActions';
import {sessionOpening, addMembersToSession} from '../../../functions/coach';
import {shareVideosWithTeam} from '../../../functions/videoManagement';
import CardArchive from '../../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';

import {rowTitle} from '../../TeamPage/components/elements';
import ListIOSLibrary from './ListIOSLibrary';

const pickerlocalVideos = ({
  lengthGameFareLibrary,
  selectVideo,
  selectedLocalVideos,
  addFromCameraRoll,
}) => {
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
        // badge: 0,
        title: 'Camera roll',
      })}

      <View style={{marginLeft: '-5%', marginBottom: -10, width: '110%'}} />
      {/* <ListIOSLibrary
          selectedLocalVideos={selectedLocalVideos}
          selectVideo={(id, selected, local) =>
            selectVideo(id, selected, local)
          }
        /> */}

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
