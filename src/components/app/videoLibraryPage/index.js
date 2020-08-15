import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {connect} from 'react-redux';
import MediaPicker from 'react-native-image-crop-picker';
import {includes} from 'ramda';
import Orientation from 'react-native-orientation-locker';

import CardArchive from '../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';
import {deleteCloudVideo} from '../../database/firebase/videosManagement.js';
import {shareVideosWithTeam} from '../../functions/videoManagement';
import {pickerlocalVideos} from './components/elements';
import {rowTitle} from '../TeamPage/components/elements';
import {FlatListComponent} from '../../layout/Views/FlatList';
import Button from '../../layout/buttons/Button';

import UploadHeader from './components/UploadHeader';
import {uploadQueueAction} from '../../../actions/uploadQueueActions';

import LogoutView from '../coachFlow/StreamPage/components/LogoutView';

import {
  sortVideos,
  permission,
  goToSettings,
  getVideoInfo,
} from '../../functions/pictures';
import sizes from '../../style/sizes';
import {
  recordVideo,
  openVideoPlayer,
  addLocalVideo,
  removeLocalVideo,
} from '../../functions/videoManagement';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {navigate} from '../../../../NavigationService';
import HeaderVideoLibrary from './components/HeaderVideoLibrary';
const {height, width} = Dimensions.get('screen');

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    const {params} = props.route;
    this.state = {
      videosArray: [],
      loader: false,
      selectableMode: params ? params.selectableMode : false,
      selectOnly: params ? params.selectOnly : false,
      selectedFirebaseVideos: [],
      selectedLocalVideos: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
  }
  static getDerivedStateFromProps(props) {
    const allVideos = {
      ...props.archivedStreams,
      ...props.videoLibrary,
    };
    const videosArray = sortVideos(allVideos);
    return {videosArray};
  }
  shareSelectedVideos() {
    const {selectedFirebaseVideos, selectedLocalVideos} = this.state;
    const {navigation} = this.props;
    const numberVideos =
      selectedFirebaseVideos.length + selectedLocalVideos.length;
    if (numberVideos > 0) {
      this.setState({
        selectedFirebaseVideos: [],
        selectedLocalVideos: [],
        selectableMode: false,
      });
      navigation.push('ShareVideo', {
        firebaseVideos: selectedFirebaseVideos,
        localVideos: selectedLocalVideos,
      });
    }
  }
  deleteSelectedVideos() {
    const {userID} = this.props;
    const {selectedFirebaseVideos, selectedLocalVideos} = this.state;
    const numberVideos =
      selectedFirebaseVideos.length + selectedLocalVideos.length;
    if (numberVideos > 0) {
      navigate('Alert', {
        title: `Are you sure you want to delete this video? This action cannot be undone.`,
        textButton: `Delete (${numberVideos})`,
        onGoBack: () => {
          if (selectedFirebaseVideos.length > 0) {
            selectedFirebaseVideos.map((videoID) => deleteCloudVideo(videoID));
          }
          if (selectedLocalVideos.length > 0) {
            selectedLocalVideos.map((videoID) => removeLocalVideo(videoID));
          }
        },
      });
    }
    this.setState({
      selectedFirebaseVideos: [],
      selectedLocalVideos: [],
      selectableMode: false,
    });
  }
  selectVideo(id, isSelected, local) {
    console.log('id', id, isSelected, local);
    let {selectedFirebaseVideos, selectedLocalVideos} = this.state;
    if (isSelected) {
      if (local) {
        selectedLocalVideos.push(id);
      } else {
        selectedFirebaseVideos.push(id);
      }
    } else {
      const index = local
        ? selectedLocalVideos.indexOf(id)
        : selectedFirebaseVideos.indexOf(id);
      if (index > -1) {
        local
          ? selectedLocalVideos.splice(index, 1)
          : selectedFirebaseVideos.splice(index, 1);
      }
    }
    this.setState({selectedFirebaseVideos, selectedLocalVideos});
  }
  async addFromCameraRoll({selectOnly}) {
    const {navigation} = this.props;
    const {navigate} = navigation;
    const permissionLibrary = await permission('library');
    if (!permissionLibrary)
      return navigate('Alert', {
        textButton: 'Open Settings',
        title:
          'You need to allow access to your library before adding videos from the camera roll.',
        colorButton: 'blue',
        onPressColor: colors.blueLight,
        onGoBack: () => goToSettings(),
        icon: (
          <Image
            source={require('../../../img/icons/technology.png')}
            style={{width: 25, height: 25}}
          />
        ),
      });
    const videos = await MediaPicker.openPicker({
      multiple: true,
      mediaType: 'video',
      compressVideoPreset: 'HighestQuality',
    }).catch((err) => console.log('error', err));
    if (videos) {
      let newVideos = [];
      for (var i in videos) {
        const video = videos[i];
        let newVideo = await getVideoInfo(video.path);
        addLocalVideo(newVideo);
        newVideos.push(newVideo);
        if (videos.length === 1 && !selectOnly) openVideoPlayer(newVideo, true);
      }
      if (selectOnly) {
        let {selectedLocalVideos} = this.state;
        selectedLocalVideos = selectedLocalVideos.concat(
          newVideos.map((video) => video.id),
        );

        this.setState({selectedLocalVideos});
      }
    }
  }
  async addVideo() {
    const {navigate} = this.props.navigation;
    navigate('Alert', {
      title: `New video`,
      displayList: true,
      listOptions: [
        {
          title: 'Select',
          forceNavigation: true,
          operation: () => this.addFromCameraRoll(),
        },
        {
          title: 'Record',
          forceNavigation: true,
          operation: () => recordVideo(),
        },
      ],
    });
  }

  noVideos() {
    return (
      <View style={styleApp.marginView}>
        <View style={styleApp.center}>
          <Image
            source={require('../../../img/images/video-library.png')}
            style={{
              height: 100,
              width: 100,
              marginBottom: 30,
            }}
          />
        </View>
        <Button
          text={'Add from library'}
          icon={{
            name: 'film',
            size: 22,
            type: 'font',
            color: colors.white,
          }}
          backgroundColor={'green'}
          onPressColor={colors.greenLight}
          click={() => this.addFromCameraRoll()}
        />
        <View style={{height: 20}} />
        <Button
          text={'Record video'}
          icon={{
            name: 'video',
            size: 22,
            type: 'font',
            color: colors.white,
          }}
          backgroundColor={'blue'}
          onPressColor={colors.blueLight}
          click={() => recordVideo()}
        />
      </View>
    );
  }

  listVideos() {
    const {videosArray, selectOnly, selectedLocalVideos} = this.state;
    return (
      <View style={styleApp.fullSize}>
        {!selectOnly && <UploadHeader />}

        <FlatListComponent
          list={videosArray}
          cardList={({item: video}) => this.renderCardArchive(video)}
          numColumns={2}
          incrementRendering={4}
          initialNumberToRender={8}
          paddingBottom={
            selectOnly ? 0 : sizes.heightFooter + sizes.marginBottomApp + 20
          }
          header={
            !selectOnly
              ? rowTitle({
                  icon: {
                    name: 'television',
                    type: 'moon',
                    color: colors.title,
                    size: 23,
                  },
                  badge: videosArray.length === 0 ? false : videosArray.length,
                  title: 'Library',
                  hideDividerHeader: true,
                })
              : pickerlocalVideos({
                  lengthGameFareLibrary: videosArray.length,
                  selectVideo: this.selectVideo.bind(this),
                  addFromCameraRoll: this.addFromCameraRoll.bind(this),
                  selectedLocalVideos,
                })
          }
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  }
  renderCardArchive(video) {
    const {
      selectableMode,
      selectedFirebaseVideos,
      selectedLocalVideos,
    } = this.state;
    const {local, id} = video;
    const isSelected = local
      ? includes(video.id, selectedLocalVideos)
      : includes(video.id, selectedFirebaseVideos);
    return (
      <CardArchive
        local={local}
        selectableMode={selectableMode}
        isSelected={isSelected}
        selectVideo={(id, selected) => this.selectVideo(id, selected, local)}
        style={styles.cardArchive}
        id={id}
        key={id}
        noUpdateStatusBar={true}
      />
    );
  }

  render() {
    const {navigation, route, userConnected} = this.props;

    const {
      videosArray,
      selectableMode,
      loader,
      selectedFirebaseVideos,
      selectedLocalVideos,
      selectOnly,
    } = this.state;
    if (!userConnected) return <LogoutView />;
    return (
      <View style={styleApp.stylePage}>
        <HeaderVideoLibrary
          // loader={loader}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          toggleSelect={() => this.setState({selectableMode: !selectableMode})}
          selectableMode={selectableMode}
          navigation={navigation}
          selectOnly={selectOnly}
          isListEmpty={videosArray.length === 0}
          add={() => this.addVideo()}
          remove={() => this.deleteSelectedVideos()}
          share={() => this.shareSelectedVideos()}
        />

        <View
          style={{
            marginTop: sizes.heightHeaderHome + sizes.marginTopApp,
          }}>
          {videosArray.length === 0 ? this.noVideos() : this.listVideos()}
        </View>

        {selectOnly &&
          (selectedFirebaseVideos.length !== 0 ||
            selectedLocalVideos.length !== 0) && (
            <View style={[styleApp.footerBooking, styleApp.marginView]}>
              <Button
                text={`Confirm ${selectedFirebaseVideos.length +
                  selectedLocalVideos.length} videos`}
                backgroundColor={'green'}
                loader={loader}
                onPressColor={colors.greenLight}
                click={async () => {
                  await this.setState({loader: true});

                  await route.params.confirmVideo(
                    selectedLocalVideos,
                    selectedFirebaseVideos,
                  );

                  return navigation.goBack();
                }}
              />
            </View>
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardArchive: {
    // width: (width * 0.9) / 2 - 10,
    width: width / 2,
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: colors.title,
    // margin: 5,
    borderWidth: 1,
    borderColor: colors.white,
  },
});
const mapStateToProps = (state) => {
  return {
    archivedStreams: state.user.infoUser.archivedStreams,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    videoLibrary: state.localVideoLibrary.videoLibrary,
    userConnected: state.user.userConnected,
  };
};
export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(VideoLibraryPage);
