import React, {Component} from 'react';
import {Animated, Dimensions, View, StatusBar} from 'react-native';
import {connect} from 'react-redux';

import CardArchive from '../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import VideoBeingShared from './components/VideoBeingShared';
import {FlatListComponent} from '../../layout/Views/FlatList';
import Button from '../../layout/buttons/Button';
import ModalHeader from '../../layout/headers/ModalHeader';

import {boolShouldComponentUpdate} from '../../functions/redux';
import {uploadQueueAction} from '../../../store/actions/uploadQueueActions';
import {layoutAction} from '../../../store/actions/layoutActions';
import {rowTitle} from '../TeamPage/components/elements';

import {sortVideos} from '../../functions/pictures';
import sizes from '../../style/sizes';
import {
  openVideoPlayer,
  deleteVideos,
  selectVideosFromCameraRoll,
} from '../../functions/videoManagement';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {navigate} from '../../../../NavigationService';
import HeaderVideoLibrary from './components/HeaderVideoLibrary';
import ToolRow from './components/ToolRow';
import {store} from '../../../store/reduxStore';
import CamerarollList from './components/CamerarollList';

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    const {params} = props.route;
    this.state = {
      loader: false,
      hideLocal: params ? params.hideLocal : false,
      hideCloud: params ? params.hideCloud : false,
      selectableMode: params ? params.selectableMode : false,
      selectOnly: params ? params.selectOnly : false,
      selectFromCameraRoll: params ? params.selectFromCameraRoll : false,
      selectOne: params ? params.selectOnly && params.selectOne : false,
      modalMode: params ? params.modalMode : false,
      selectedVideos: [],
      nonplayableVideos: 0,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'VideoLibraryPage',
    });
  }
  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      const currentSessionID = store.getState().coach.currentSessionID;
      if (currentSessionID) this.setState({selectableMode: true});
    });
  }
  componentWillUnmount = () => {
    this.focusListener();
  };
  componentDidUpdate(prevProps) {
    const {userConnected} = this.props;
    if (userConnected !== prevProps.userConnected)
      this.flatListRef.setState({numberToRender: 13});
  }
  toggleSelectable(force) {
    const {selectableMode} = this.state;
    this.setState({selectableMode: force ? false : !selectableMode});
  }
  playSelectedVideos = ({forceSharing}) => {
    const {selectedVideos, nonplayableVideos} = this.state;
    if (nonplayableVideos > 0) return;
    openVideoPlayer({
      archives: selectedVideos,
      open: true,
      forceSharing,
    });
  };
  async shareSelectedVideos() {
    const {selectedVideos} = this.state;
    const {navigation, userConnected} = this.props;
    if (!userConnected) return navigation.navigate('SignIn');
    if (selectedVideos.length > 0) {
      navigation.navigate('ModalCallTab', {
        action: 'shareArchives',
        archivesToShare: selectedVideos,
        modal: true,
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
          await this.setState({
            selectedVideos: [],
            selectableMode: false,
          });
          return deleteVideos(selectedVideos);
        },
      });
    }
  }
  selectVideo = ({id, playable}) => {
    let nextSelectedVideos = this.state.selectedVideos.slice();
    let {nonplayableVideos} = this.state;
    if (nextSelectedVideos.filter((idVideo) => idVideo === id).length === 0) {
      nextSelectedVideos.push(id);
      if (playable === false) nonplayableVideos++;
    } else {
      nextSelectedVideos = nextSelectedVideos.filter(
        (idVideo) => idVideo !== id,
      );
      if (playable === false) nonplayableVideos--;
    }

    this.setState({selectedVideos: nextSelectedVideos, nonplayableVideos});
  };

  listVideos = () => {
    const {navigation} = this.props;
    const {
      selectOnly,
      selectableMode,
      selectFromCameraRoll,
      modalMode,
    } = this.state;
    const videosArray = this.videosArray();
    const selectMargin = selectableMode ? 80 : 0;
    if (selectFromCameraRoll) {
      return <CamerarollList />;
    }
    return (
      <View style={styleApp.fullSize}>
        <FlatListComponent
          styleContainer={modalMode ? {paddingTop: 80} : {}}
          list={videosArray}
          cardList={({item: videoID, index}) =>
            this.renderCardArchive(videoID, index)
          }
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onRef={(ref) => {
            this.flatListRef = ref;
          }}
          fetchData={async ({numberToRender, nextNumberRender}) => {}}
          ListEmptyComponent={{
            clickButton: () => navigation.navigate('Session'),
            textButton: 'Record',
            iconButton: 'video',
            clickButton2: () => selectVideosFromCameraRoll(),
            textButton2: 'Pick from library',
            iconButton2: 'images',
            text: `You don't have any videos yet.`,

            image: require('../../../img/images/video-player.png'),
          }}
          header={
            <View>
              {modalMode
                ? null
                : rowTitle({
                    hideDividerHeader: true,
                    title: !selectableMode ? 'Library' : 'Select Videos',
                    titleColor: colors.black,
                    titleStyle: {
                      fontWeight: '800',
                      fontSize: 23,
                    },
                  })}
              <VideoBeingShared />
            </View>
          }
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
  };
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
    const {width} = Dimensions.get('screen');
    return (
      <CardArchive
        selectableMode={selectableMode}
        isSelected={isSelected}
        selectVideo={this.selectVideo}
        style={[
          styleApp.cardArchiveVideoLibrary,
          styleBorder,
          {width: width / 3},
        ]}
        id={videoID}
        index={index}
        key={videoID}
        noUpdateStatusBar={true}
      />
    );
  }
  videosArray = () => {
    const {userLocalArchives, archivedStreams} = this.props;
    const videosArray = {
      ...userLocalArchives,
      ...archivedStreams,
    };
    const allVideos = Object.values(videosArray).filter(
      (v) => v.id && v.startTimestamp,
    );
    return sortVideos(allVideos).map((v) => v.id);
  };
  render() {
    const {navigation, route, currentSessionID, position} = this.props;
    const videosArray = this.videosArray();
    const {
      selectableMode,
      loader,
      selectedVideos,
      selectOnly,
      selectFromCameraRoll,
      modalMode,
    } = this.state;
    const containerStyle = modalMode
      ? styleApp.stylePageModal
      : styleApp.stylePage;
    const listContainerStyle = {
      marginTop: modalMode ? 0 : sizes.heightHeaderHome + sizes.marginTopApp,
      zIndex: 10,
    };
    return (
      <View style={containerStyle}>
        <StatusBar hidden={false} barStyle={'dark-content'} />
        {modalMode ? (
          <ModalHeader
            title={
              selectFromCameraRoll
                ? 'Add from Camera Roll'
                : selectableMode
                ? 'Select Videos'
                : 'Library'
            }
          />
        ) : (
          <HeaderVideoLibrary
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            navigation={navigation}
            selectOnly={selectOnly}
            text={!selectableMode ? 'Library' : 'Select Videos'}
            selectableMode={selectableMode}
            toggleSelectable={this.toggleSelectable.bind(this)}
            isListEmpty={videosArray.length === 0}
          />
        )}

        <View style={listContainerStyle}>{this.listVideos()}</View>

        {selectOnly && selectedVideos.length > 0 ? (
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
        ) : null}

        {!selectOnly ? (
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
            selectVideo={this.selectVideo}
          />
        ) : null}
      </View>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    archivedStreams: state.user.infoUser.archivedStreams,
    userLocalArchives: state.localVideoLibrary.userLocalArchives,
    currentSessionID: state.coach.currentSessionID,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};
export default connect(
  mapStateToProps,
  {uploadQueueAction, layoutAction},
)(VideoLibraryPage);
