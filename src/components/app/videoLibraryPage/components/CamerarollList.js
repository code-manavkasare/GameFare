import React, {Component} from 'react';
import {View, InteractionManager} from 'react-native';

import {
  addVideosFromCamerarollToApp,
  getVideosFormattedFromCameraroll,
} from '../../../functions/videoManagement.js';
import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive.js';
import {FlatListComponent} from '../../../layout/Views/FlatList';
import Button from '../../../layout/buttons/Button';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

export default class CamerarollList extends Component {
  constructor(props) {
    super(props);
    this.selectedVideos = {};
    this.selectedVideosLocalIdentifiers = {};
    this.state = {
      videos: [],
      loadingCameraRoll: true,
      loadingExport: false,
      hasNextPage: false,
      lastElement: null,
    };
  }
  componentDidMount = async () => {
    this.fetchNewPage({firstFetch: true});
  };

  fetchNewPage = async ({firstFetch, lastElement}) => {
    InteractionManager.runAfterInteractions(async () => {
      const {
        videosFormatted: videosFromCameraroll,
        page_info,
      } = await getVideosFormattedFromCameraroll(lastElement);
      await this.setState({
        videos: firstFetch
          ? videosFromCameraroll
          : this.state.videos.concat(videosFromCameraroll),
        hasNextPage: page_info.has_next_page,
        lastElement: page_info.end_cursor,
        loadingCameraRoll: false,
      });
    });
  };

  selectVideo = ({id, isSelected, localIdentifier}) => {
    const {canExportVideos} = this.state;

    if (isSelected) {
      this.selectedVideos[id] = true;
      this.selectedVideosLocalIdentifiers[localIdentifier] = true;
    } else if (this.selectedVideos[id]) {
      delete this.selectedVideos[id];
      delete this.selectedVideosLocalIdentifiers[localIdentifier];
    }

    const lengthVideos = Object.values(this.selectedVideos).length;
    if (lengthVideos <= 0 && canExportVideos) {
      this.setState({canExportVideos: false});
    } else if (lengthVideos > 0 && !canExportVideos) {
      this.setState({canExportVideos: true});
    }
  };

  renderCardArchive = (video, index) => {
    const {id} = video;

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
        selectVideo={this.selectVideo}
        style={[styleApp.cardArchiveVideoLibrary, styleBorder]}
        id={id}
        index={index}
        key={id}
        noUpdateStatusBar={true}
      />
    );
  };

  confirmVideosImport = async () => {
    const {selectedVideosLocalIdentifiers} = this;
    await this.setState({loadingExport: true});
    await addVideosFromCamerarollToApp(
      Object.keys(selectedVideosLocalIdentifiers),
    );
    await this.setState({loadingExport: false});
  };

  render = () => {
    const {
      loadingExport,
      loadingCameraRoll,
      videos,
      hasNextPage,
      lastElement,
      canExportVideos,
    } = this.state;

    return (
      <View style={styleApp.fullSize}>
        <FlatListComponent
          styleContainer={{paddingTop: 80}}
          list={videos ? videos : []}
          cardList={({item: video, index}) =>
            this.renderCardArchive(video, index)
          }
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onRef={(ref) => {
            this.flatListRef = ref;
          }}
          fetchData={() => {
            hasNextPage && this.fetchNewPage({firstFetch: false, lastElement});
          }}
          ListEmptyComponent={
            !loadingCameraRoll
              ? {
                  text: 'No videos',
                  image: require('../../../../img/images/shelve.png'),
                }
              : null
          }
          numColumns={3}
          incrementRendering={20}
          initialNumberToRender={20}
          showsVerticalScrollIndicator={true}
          paddingBottom={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          noLazy={true}
        />
        {canExportVideos ? (
          <View style={[styleApp.footerBooking, styleApp.marginView]}>
            <Button
              text={'Add to Library'}
              backgroundColor={'green'}
              loader={loadingExport}
              onPressColor={colors.greenLight}
              click={() => this.confirmVideosImport()}
            />
          </View>
        ) : null}
      </View>
    );
  };
}
