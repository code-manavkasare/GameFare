import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';

import {
  addVideosFromCamerarollToApp,
  getVideosFormattedFromCameraroll,
} from '../../../functions/videoManagement.js';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive.js';
import {rowTitle} from '../../TeamPage/components/elements.js';
import {FlatListComponent} from '../../../layout/Views/FlatList';
import Button from '../../../layout/buttons/Button';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

export default class CamerarollList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videos: [],
      selectedVideos: [],
      selectedVideosLocalIdentifiers: [],
      loader: false,
    };
  }
  componentDidMount = async () => {
    //TODO: lazy loading of local assets using RNCameraroll methods
    const videosFromCameraroll = await getVideosFormattedFromCameraroll();
    console.log('videosFromCameraroll: ', videosFromCameraroll);
    this.setState({videos: videosFromCameraroll});
  };

  selectVideo(id, isSelected, localIdentifier) {
    let nextSelectedVideos = this.state.selectedVideos.slice();
    let nextSelectedVideosLocalIdentifiers = this.state.selectedVideosLocalIdentifiers.slice();

    if (nextSelectedVideos.filter((idVideo) => idVideo === id).length === 0) {
      nextSelectedVideos.push(id);
      nextSelectedVideosLocalIdentifiers.push(localIdentifier);
    } else {
      nextSelectedVideos = nextSelectedVideos.filter(
        (idVideo) => idVideo !== id,
      );
      nextSelectedVideosLocalIdentifiers = nextSelectedVideosLocalIdentifiers.filter(
        (localId) => localId !== localIdentifier,
      );
    }
    this.setState({
      selectedVideos: nextSelectedVideos,
      selectedVideosLocalIdentifiers: nextSelectedVideosLocalIdentifiers,
    });
  }

  renderCardArchive = (video, index) => {
    const {id} = video;
    const {selectedVideos} = this.state;
    const isSelected =
      selectedVideos.filter((idVideo) => idVideo === id).length !== 0;

    let styleBorder = {};

    if ((Number(index) + 1) % 3 === 0)
      styleBorder = {
        borderLeftWidth: 1.5,
      };

    if ((Number(index) + 3) % 3 === 0)
      styleBorder = {
        borderRightWidth: 1.5,
      };
    return (
      <CardArchive
        archiveFromCameraroll={video}
        selectableMode={true}
        isSelected={isSelected}
        selectVideo={(id, isSelected, localIdentifier) =>
          this.selectVideo(id, isSelected, localIdentifier)
        }
        style={[styleApp.cardArchiveVideoLibrary, styleBorder]}
        id={id}
        index={index}
        key={id}
        noUpdateStatusBar={true}
      />
    );
  };

  confirmVideosImport = async (selectedVideosLocalIdentifiers) => {
    await this.setState({loader: true});
    await addVideosFromCamerarollToApp(selectedVideosLocalIdentifiers);
    await this.setState({loader: false});
  };

  render = () => {
    const {
      loader,
      videos,
      selectedVideos,
      selectedVideosLocalIdentifiers,
    } = this.state;

    return (
      <View style={styleApp.fullSize}>
        <FlatListComponent
          list={videos ? videos : []}
          cardList={({item: video, index}) =>
            this.renderCardArchive(video, index)
          }
          onRef={(ref) => {
            this.flatListRef = ref;
          }}
          fetchData={async ({numberToRender, nextNumberRender}) => {
            console.log('fetchData', {numberToRender, nextNumberRender});
          }}
          ListEmptyComponent={{
            text: `You don't have any videos in your cameraroll.`,
            image: require('../../../../img/images/video-player.png'),
          }}
          header={
            <View>
              {rowTitle({
                hideDividerHeader: true,
                title: 'Select Videos',
                titleColor: colors.black,
                titleStyle: {
                  fontWeight: '800',
                  fontSize: 23,
                },
              })}
            </View>
          }
          numColumns={3}
          incrementRendering={12}
          initialNumberToRender={15}
          showsVerticalScrollIndicator={false}
          paddingBottom={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
        {selectedVideos.length > 0 && (
          <View style={[styleApp.footerBooking, styleApp.marginView]}>
            <Button
              text={`Confirm ${selectedVideos.length} videos`}
              backgroundColor={'green'}
              loader={loader}
              onPressColor={colors.greenLight}
              click={() =>
                this.confirmVideosImport(selectedVideosLocalIdentifiers)
              }
            />
          </View>
        )}
      </View>
    );
  };
}
