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
import {includes} from 'ramda';
import Orientation from 'react-native-orientation-locker';

import CardArchive from '../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import {
  isUserAlone,
  isSomeoneSharingScreen,
  userPartOfSession,
  getVideosSharing,
  getMember,
  toggleVideoPublish,
} from '../../functions/coach';

import {pickerlocalVideos} from './components/elements';
import {rowTitle} from '../TeamPage/components/elements';
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
  }
  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
  }

  static getDerivedStateFromProps(props) {
    const allVideos = Object.values(props.archivedStreams).filter(v => v.id && v.startTimestamp);
    const sortedVideos = sortVideos(allVideos).map(v => v.id);
    return {videosArray: sortedVideos};
  }
  toggleSelectable() {
    const {selectableMode} = this.state;
    if (selectableMode) {
      this.setState({
        selectedVideos: [],
        selectableMode: false,
      });
    } else {
      this.setState({selectableMode: true});
    }
  }
  shareSelectedVideos() {
    const {selectedVideos} = this.state;
    const {navigation} = this.props;
    if (selectedVideos.length > 0) {
      navigation.push('ShareVideo', {
        videos: selectedVideos,
      });
      this.setState({
        selectedVideos: [],
        selectableMode: false,
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
        onGoBack: () => {
          deleteVideos(selectedVideos);
          this.setState({
            selectedVideos: [],
            selectableMode: false,
          });
        },
      });
    }
  }
  selectVideo(id, isSelected) {
    let {selectedVideos, selectOne} = this.state;
    if (isSelected) {
      if (selectOne) {
        selectedVideos = [id];
      } else {
        selectedVideos.push(id);
      }
    } else {
      const index = selectedVideos.indexOf(id);
      if (index > -1) {
        selectedVideos.splice(index, 1);
      }
    }
    this.setState({selectedVideos});
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

  noVideos() {
    const {navigate} = this.props.navigation;
    return (
      <View style={styleApp.marginView}>
        <View style={styleApp.center}>
          <Image
            source={require('../../../img/logos/logoTitle.png')}
            style={{
              tintColor: colors.greyDark,
              borderRadius: 25,
              height: 100,
              width: 300,
              marginBottom: 30,
              resizeMode: 'contain',
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
          backgroundColor={'blue'}
          onPressColor={colors.greyDark}
          click={() => this.addFromCameraRoll({selectOnly: false})}
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
          onPressColor={colors.greyDark}
          click={() => navigate('Session')}
        />
      </View>
    );
  }

  listVideos() {
    const {session: coachSession, coachSessionID} = this.props;
    const {videosArray, selectOnly, selectedVideos} = this.state;

    const personSharingScreen = isSomeoneSharingScreen(coachSession);
    const videosBeingShared = getVideosSharing(
      coachSession,
      personSharingScreen,
    );
    return (
      <View style={styleApp.fullSize}>
        <FlatListComponent
          list={videosArray}
          cardList={({item: videoID}) => this.renderCardArchive(videoID)}
          numColumns={3}
          incrementRendering={12}
          initialNumberToRender={12}
          paddingBottom={
            selectOnly ? 0 : sizes.heightFooter + sizes.marginBottomApp + 20
          }
          header={
            <View>
              {!selectOnly
                ? rowTitle({
                    icon: {
                      name: 'tv',
                      type: 'font',
                      // name: 'television',
                      // type: 'moon',
                      color: colors.title,
                      size: 20,
                    },
                    badge:
                      videosArray.length === 0 ? false : videosArray.length,
                    title: 'Library',
                    hideDividerHeader: true,
                    containerStyle: {
                      marginBottom: 15,
                    },
                  })
                : pickerlocalVideos({
                    lengthGameFareLibrary: videosArray.length,
                    selectVideo: this.selectVideo.bind(this),
                    addFromCameraRoll: this.addFromCameraRoll.bind(this),
                    selectedVideos,
                  })}
              {videosBeingShared &&
                rowTitle({
                  icon: {
                    name: 'satellite-dish',
                    type: 'font',
                    color: colors.black,
                    size: 20,
                  },
                  hideDividerHeader: true,
                  customButtom: (
                    <CardArchive
                      id={Object.keys(videosBeingShared)[0]}
                      videosToOpen={Object.keys(videosBeingShared).map(
                        (video) => {
                          return {id: video};
                        },
                      )}
                      style={{
                        ...styleApp.cardArchive3,
                        ...styleApp.shadow,
                        height: 70,
                        width: 115,
                        borderRadius: 5,
                        borderWidth: 0,
                        marginRight: 10,
                      }}
                      coachSessionID={coachSessionID}
                      hidePlayIcon={true}
                    />
                  ),
                  title: 'Live now',
                  titleColor: colors.black,
                  titleStyle: {
                    fontWeight: '800',
                    fontSize: 20,
                  },
                  containerStyle: {
                    ...styleApp.shadow,
                    marginTop: 10,
                    borderRadius: 10,
                    backgroundColor: colors.white,
                    height: 100,
                    marginBottom: 15,
                  },
                })}
            </View>
          }
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  }
  renderCardArchive(videoID) {
    const {selectableMode, selectedVideos} = this.state;
    const isSelected = includes(videoID, selectedVideos);
    return (
      <CardArchive
        selectableMode={selectableMode}
        isSelected={isSelected}
        selectVideo={(id, selected) => this.selectVideo(id, selected)}
        style={styles.cardArchive}
        id={videoID}
        key={videoID}
        noUpdateStatusBar={true}
        showUploadProgress={true}
      />
    );
  }

  render() {
    const {navigation, route, userConnected} = this.props;

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
          // loader={loader}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          toggleSelect={() => this.toggleSelectable()}
          selectableMode={selectableMode}
          navigation={navigation}
          selectOnly={selectOnly}
          isListEmpty={videosArray.length === 0}
          add={() => this.addFromCameraRoll({selectOnly: false})}
          remove={() => this.deleteSelectedVideos()}
          share={() => this.shareSelectedVideos()}
        />

        <View
          style={{
            marginTop: sizes.heightHeaderHome + sizes.marginTopApp,
            zIndex: 10,
          }}>
          {videosArray.length === 0 ? this.noVideos() : this.listVideos()}
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
    width: width / 3,
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    // backgroundColor: colors.title,
    // margin: 5,
    borderWidth: 1,
    borderColor: colors.white,
  },
});
const mapStateToProps = (state) => {
  return {
    archivedStreams: {...state.localVideoLibrary.userLocalArchives, ...state.user.infoUser.archivedStreams},
    session: state.coachSessions[state.coach.currentSessionID],
    coachSessionID: state.coach.currentSessionID,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
  };
};
export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(VideoLibraryPage);
