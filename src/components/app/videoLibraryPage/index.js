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
import {
  addVideoToMember,
  deleteVideoFromLibrary,
} from '../../database/firebase/videosManagement.js';
import Button from '../../layout/buttons/Button';

import UploadHeader from './components/UploadHeader';
import {uploadQueueAction} from '../../../actions/uploadQueueActions';

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
  removeLocalVideos,
  uploadLocalVideos,
  addVideo,
} from '../../functions/videoManagement';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {navigate} from '../../../../NavigationService';
import HeaderVideoLibrary from './components/HeaderVideoLibrary';
const {height, width} = Dimensions.get('screen');

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videosArray: [],
      loader: false,
      selectableMode: false,
      selectedFirebaseVideos: [],
      selectedLocalVideos: [],
    };
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
    }
    const videosArray = sortVideos(allVideos);
    return {videosArray};
  }
  shareSelectedVideos() {
    const {userID} = this.props;
    const {selectedFirebaseVideos, selectedLocalVideos} = this.state;
    const numberVideos = selectedFirebaseVideos.length + selectedLocalVideos.length;
    if (numberVideos > 0) {
      navigate('PickMembers', {
        usersSelected: {},
        allowSelectMultiple: true,
        selectFromGamefare: true,
        selectFromContacts: true,
        closeButton: true,
        displayCurrentUser: false,
        noUpdateStatusBar: true,
        titleHeader: 'Select members to share video(s) with',
        onSelectMembers: (users, contacts) => {
          for (const user of Object.values(users)) {
            for (const videoId of selectedFirebaseVideos) {
              addVideoToMember(userID, user.id, videoId);
            }
            uploadLocalVideos(selectedLocalVideos);
            for (const videoId of selectedLocalVideos) {
              addVideoToMember(userID, user.id, videoId);
            }
          }
          for (const contact of Object.values(contacts)) {
            console.log('error sharing with contact', contact);
          }
          this.setState({selectedFirebaseVideos: [], selectedLocalVideos: [], selectableMode: false});
        },
      });
    }
  }
  deleteSelectedVideos() {
    const {userID} = this.props;
    const {selectedFirebaseVideos, selectedLocalVideos} = this.state;
    const numberVideos = selectedFirebaseVideos.length + selectedLocalVideos.length;
    if (numberVideos > 0) {
      navigate('Alert', {
        title: `Are you sure you want to delete this video? This action cannot be undone.`,
        textButton: `Delete (${numberVideos})`,
        onGoBack: () => {
          if (selectedFirebaseVideos.length > 0) {
            deleteVideoFromLibrary(userID, selectedFirebaseVideos);
          }
          if (selectedLocalVideos.length > 0) {
            removeLocalVideos(selectedLocalVideos);
          }
        },
      });
    }
    this.setState({selectedFirebaseVideos: [], selectedLocalVideos: [], selectableMode: false});
  }
  selectVideo(id, isSelected, local) {
    let {selectedFirebaseVideos, selectedLocalVideos} = this.state;
    if (isSelected) {
      if (local) {
        selectedLocalVideos.push(id);
      } else {
        selectedFirebaseVideos.push(id);
      }
    } else {
      const index = local ? selectedLocalVideos.indexOf(id) : selectedFirebaseVideos.indexOf(id);
      if (index > -1) {
        local ? selectedLocalVideos.splice(index, 1) : selectedFirebaseVideos.splice(index, 1);
      }
    }
    this.setState({selectedFirebaseVideos, selectedLocalVideos});
  }
  async addFromCameraRoll() {
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
      if (videos.length === 1) {
        let newVideo = await getVideoInfo(videos[0].path, true, 0);
        await addVideo(newVideo);
        openVideoPlayer(newVideo, true);
      }
      videos.map(async (video) => {
        let newVideo = await getVideoInfo(video.path, true, 0);
        addVideo(newVideo);
      });
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
    const {videosArray} = this.state;
    return (
      <FlatList
        ListHeaderComponent={
          <View
            style={{
              backgroundColor: colors.white,
              borderBottomWidth: 0,
              borderColor: colors.off,
              paddingTop:25,
              marginTop:-12
            }}>
            <Text style={[styleApp.title, {marginBottom: 11, zIndex: 2}]}>
              GameFare Library{` (${videosArray.length})`}
            </Text>
          </View>
        }
        data={videosArray}
        renderItem={(video) => this.renderCardArchive(video)}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: this.AnimatedHeaderValue,
                },
              },
            },
          ],
          {useNativeDriver: false},
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={true}
        contentContainerStyle={{
          paddingBottom: 150,
          paddingLeft: '5%',
          paddingRight: '5%',
          paddingTop: 0,
        }}
        showsVerticalScrollIndicator={true}
        initialNumToRender={7}
      />
    );
  }
  renderCardArchive(video) {
    const {selectableMode, selectedFirebaseVideos, selectedLocalVideos} = this.state;
    const {local, id} = video.item;
    const isSelected = local ? includes(video.item.id, selectedLocalVideos) : includes(video.item.id, selectedFirebaseVideos);
    return (
      <CardArchive
        local={local ? true : false}
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
    const {videosArray, selectableMode, loader, selectedVideos} = this.state;
    return (
      <View style={styleApp.stylePage}>
        <HeaderVideoLibrary
          loader={loader}
          toggleSelect={() => this.setState({selectableMode: !selectableMode})}
          selectableMode={selectableMode}
          isListEmpty={videosArray.length === 0}
          selectedVideos={selectedVideos}
          add={() => this.addVideo()}
          remove={() => this.deleteSelectedVideos()}
          share={() => this.shareSelectedVideos()}
        />
        <UploadHeader />
        <View style={{marginTop: sizes.heightHeaderHome + sizes.marginTopApp}}>
          {videosArray.length === 0 ? this.noVideos() : this.listVideos()}
        </View>
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
    width: (width * 0.9) / 2 - 10,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.title,
    margin: 5,
  },
  CardUploading: {
    width: (width * 0.9) / 2 - 10,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
    margin: 8,
  },
});
const mapStateToProps = (state) => {
  return {
    archives: state.archives,
    archivedStreams: state.user.infoUser.archivedStreams,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    videoLibrary: state.localVideoLibrary.videoLibrary,
  };
};
export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(VideoLibraryPage);
