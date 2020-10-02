import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  Text,
  StatusBar,
} from 'react-native';
import {connect} from 'react-redux';
import MediaPicker from 'react-native-image-crop-picker';

import Orientation from 'react-native-orientation-locker';
import isEqual from 'lodash.isequal';

import CardArchive from '../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';

import {createShareVideosBranchUrl} from '../../database/branch';

import VideoBeingShared from './components/VideoBeingShared';
import {FlatListComponent} from '../../layout/Views/FlatList';
import Button from '../../layout/buttons/Button';

import {uploadQueueAction} from '../../../actions/uploadQueueActions';

import LogoutView from '../coachFlow/GroupsPage/components/LogoutView';

import {
  sortVideos,
  permission,
  goToSettings,
  getNativeVideoInfo,
} from '../../functions/pictures';
import sizes from '../../style/sizes';
import {
  openVideoPlayer,
  addLocalVideo,
  deleteVideos,
} from '../../functions/videoManagement';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {navigate} from '../../../../NavigationService';
import HeaderVideoLibrary from './components/HeaderVideoLibrary';
import ToolRow from './components/ToolRow';
import {store} from '../../../../reduxStore';
const {height, width} = Dimensions.get('screen');

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    const {params} = props.route;
    this.state = {
      videosArray: [],
      loader: false,
      hideLocal: params ? params.hideLocal : false,
      hideCloud: params ? params.hideCloud : false,
      selectableMode: params ? params.selectableMode : false,
      selectOnly: params ? params.selectOnly : false,
      selectOne: params ? params.selectOnly && params.selectOne : false,
      selectedVideos: [],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  static getDerivedStateFromProps(props) {
    const allVideos = Object.values(props.archivedStreams).filter(
      (v) => v.id && v.startTimestamp,
    );
    const sortedVideos = sortVideos(allVideos).map((v) => v.id);
    return {videosArray: sortedVideos};
  }

  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
      const currentSessionID = store.getState().coach.currentSessionID;
      if (currentSessionID) this.setState({selectableMode: true});
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!isEqual(nextState, this.state)) {
      return true;
    }
    if (isEqual(this.props, nextProps)) {
      return false;
    }
  }

  toggleSelectable(force) {
    const {selectableMode} = this.state;
    this.setState({selectableMode: force ? false : !selectableMode});
  }
  playSelectedVideos = ({forceSharing}) => {
    const {selectedVideos} = this.state;

    openVideoPlayer({
      archives: selectedVideos,
      open: true,
      forceSharing,
    });
  };
  async shareSelectedVideos() {
    const {selectedVideos} = this.state;
    const {navigation} = this.props;
    if (selectedVideos.length > 0) {
      navigation.navigate('ModalCallTab', {
        action: 'shareArchives',
        archivesToShare: selectedVideos,
        modal: true,
        branchLink: await createShareVideosBranchUrl(selectedVideos),
        inlineSearch: true,
      });
    }
  }
  deleteSelectedVideos() {
    const {selectedVideos} = this.state;
    const numberVideos = selectedVideos.length;
    if (numberVideos > 0) {
      navigate('Alert', {
        title:
          'Are you sure you want to delete ' +
          (numberVideos === 1 ? 'this video' : 'these videos') +
          '?',
        subtitle: 'This action cannot be undone.',
        textButton: `Delete (${numberVideos})`,
        onGoBack: async () => {
          await deleteVideos(selectedVideos);
          return this.setState({
            selectedVideos: [],
            selectableMode: false,
          });
        },
      });
    }
  }
  selectVideo(id) {
    let nextSelectedVideos = this.state.selectedVideos.slice();

    if (nextSelectedVideos.filter((idVideo) => idVideo === id).length === 0) {
      nextSelectedVideos.push(id);
    } else {
      nextSelectedVideos = nextSelectedVideos.filter(
        (idVideo) => idVideo !== id,
      );
    }

    this.setState({selectedVideos: nextSelectedVideos});
  }
  async addFromCameraRoll({selectOnly}) {
    const {navigation} = this.props;
    const {navigate} = navigation;
    const permissionLibrary = await permission('library');
    if (!permissionLibrary) {
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
    }
    const videos = await MediaPicker.openPicker({
      multiple: true,
      mediaType: 'video',
      writeTempFile: false,
    }).catch((err) => console.log('error', err));
    if (videos) {
      const videoInfos = await Promise.all(
        videos.map((video) => getNativeVideoInfo(video.localIdentifier)),
      );
      videoInfos.forEach((video) => {
        addLocalVideo(video);
      });
      if (videoInfos.length === 1 && !selectOnly) {
        openVideoPlayer({
          archives: [videoInfos[0].id],
          open: true,
        });
      } else if (selectOnly) {
        videoInfos.forEach((info) => this.selectVideo(info.id, true));
      }
    }
  }

  listVideos() {
    const {navigation} = this.props;
    const {videosArray, selectOnly, selectableMode} = this.state;

    const selectMargin = selectableMode ? 80 : 0;
    return (
      <View style={styleApp.fullSize}>
        <FlatListComponent
          list={videosArray}
          cardList={({item: videoID, index}) =>
            this.renderCardArchive(videoID, index)
          }
          ListEmptyComponent={{
            clickButton: () => navigation.navigate('Session'),
            textButton: 'Record',
            iconButton: 'video',
            clickButton2: () => this.addFromCameraRoll({selectOnly: false}),
            textButton2: 'Pick from library',
            iconButton2: 'images',
            text: `You don't have any videos yet.`,

            image: require('../../../img/images/video-player.png'),
          }}
          header={<VideoBeingShared />}
          numColumns={3}
          incrementRendering={12}
          initialNumberToRender={15}
          showsVerticalScrollIndicator={false}
          paddingBottom={
            selectOnly
              ? 0
              : sizes.heightFooter + sizes.marginBottomApp + 110 + selectMargin
          }
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  }
  renderCardArchive(videoID, index) {
    const {selectableMode, selectedVideos} = this.state;
    const isSelected =
      selectedVideos.filter((idVideo) => idVideo === videoID).length !== 0;

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
        selectableMode={selectableMode}
        isSelected={isSelected}
        selectVideo={(id) => this.selectVideo(id)}
        style={[styles.cardArchive, styleBorder]}
        id={videoID}
        index={index}
        key={videoID}
        noUpdateStatusBar={true}
      />
    );
  }

  render() {
    const {
      navigation,
      route,
      userConnected,
      currentSessionID,
      position,
    } = this.props;

    const {
      videosArray,
      selectableMode,
      loader,
      selectedVideos,
      selectOnly,
    } = this.state;

    if (!userConnected) {
      return <LogoutView />;
    }
    return (
      <View style={styleApp.stylePage}>
        <StatusBar hidden={false} barStyle={'dark-content'} />
        <HeaderVideoLibrary
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          navigation={navigation}
          selectOnly={selectOnly}
          text={!selectableMode ? 'Library' : 'Select videos'}
          selectableMode={selectableMode}
          toggleSelectable={this.toggleSelectable.bind(this)}
          addFromCameraRoll={this.addFromCameraRoll.bind(this)}
          isListEmpty={videosArray.length === 0}
        />

        <View
          style={{
            marginTop: sizes.heightHeaderHome + sizes.marginTopApp,
            zIndex: 10,
          }}>
          {this.listVideos()}
        </View>

        {selectOnly && selectedVideos.length > 0 && (
          <View style={[styleApp.footerBooking, styleApp.marginView]}>
            <Button
              text={`Confirm ${selectedVideos.length} videos`}
              backgroundColor={'green'}
              loader={loader}
              onPressColor={colors.greenLight}
              click={async () => {
                await this.setState({loader: true});
                await route.params.confirmVideo(selectedVideos);
                if (route.params.navigateBackAfterConfirm) {
                  return navigation.goBack();
                }
              }}
            />
          </View>
        )}

        {!selectOnly && (
          <ToolRow
            onRef={(ref) => {
              this.toolRowRef = ref;
            }}
            positon={position}
            displayButton0={currentSessionID}
            clickButton1={this.toggleSelectable.bind(this)}
            
            isButton2Selected={selectableMode}
            clickButton0={() => this.playSelectedVideos({forceSharing: true})}
            clickButton4={() => this.deleteSelectedVideos()}
            clickButton3={() => this.shareSelectedVideos()}
            clickButton2={() => this.playSelectedVideos({})}
            selectedVideos={selectedVideos}
            addFromCameraRoll={this.addFromCameraRoll.bind(this)}
            selectVideo={this.selectVideo.bind(this)}
          />
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
    width: width / 3,
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    borderBottomWidth: 1.5,
    borderColor: colors.white,
  },
});
const mapStateToProps = (state) => {
  return {
    archivedStreams: {
      ...state.localVideoLibrary.userLocalArchives,
      ...state.user.infoUser.archivedStreams,
    },

    currentSessionID: state.coach.currentSessionID,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
  };
};
export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(VideoLibraryPage);
