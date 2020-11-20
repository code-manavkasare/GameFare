import React, {Component} from 'react';
import {View} from 'react-native';

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
    this.state = {
      videos: [],
      selectedVideos: [],
      selectedVideosLocalIdentifiers: [],
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

  confirmVideosImport = async () => {
    const {selectedVideosLocalIdentifiers} = this.state;
    await this.setState({loadingExport: true});
    await addVideosFromCamerarollToApp(selectedVideosLocalIdentifiers);
    await this.setState({loadingExport: false});
  };

  render = () => {
    const {
      loadingExport,
      loadingCameraRoll,
      videos,
      selectedVideos,
      hasNextPage,
      lastElement,
    } = this.state;

    return (
      <View style={styleApp.fullSize}>
        <FlatListComponent
          styleContainer={{paddingTop: 80}}
          list={videos ? videos : []}
          cardList={({item: video, index}) =>
            this.renderCardArchive(video, index)
          }
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
        {selectedVideos.length > 0 ? (
          <View style={[styleApp.footerBooking, styleApp.marginView]}>
            <Button
              text={
                `Add ${selectedVideos.length} video` +
                (selectedVideos.length === 1 ? '' : 's')
              }
              backgroundColor={'green'}
              loadingExport={loadingExport}
              onPressColor={colors.greenLight}
              click={() => this.confirmVideosImport()}
            />
          </View>
        ) : null}
      </View>
    );
  };
}
