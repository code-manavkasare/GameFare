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
import CardUploading from './components/CardUploading';
import {
  addVideoToMember,
  deleteVideoFromLibrary,
} from '../../database/firebase/videosManagement.js';
import Button from '../../layout/buttons/Button';
import ScrollView2 from '../../layout/scrollViews/ScrollView2';
import QueueList from '../elementsUpload/QueueList';

import {
  sortVideos,
  permission,
  goToSettings,
  getVideoInfo,
} from '../../functions/pictures';
import {openSession} from '../../functions/coach';
import sizes from '../../style/sizes';
import {recordVideo} from '../../functions/videoManagement';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {navigate} from '../../../../NavigationService';
import HeaderVideoLibrary from './components/HeaderVideoLibrary';
import LocalVideoLibrary from './components/localVideoLibraryPage/index';
import ExpandedSnippetsView from './components/expandedSnippetsView';
const {height, width} = Dimensions.get('screen');

class VideoLibraryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videosArray: [],
      loader: false,
      uploadingVideosArray: [],
      selectableMode: false,
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
    const cloudVideosArray = sortVideos(props.archivedStreams);
    const localVideosArray = sortVideos(props.videoLibrary);
    const videosArray = localVideosArray.concat(cloudVideosArray);
    return {videosArray};
  }
  uploadingVideosList() {
    const {uploadingVideosArray} = this.state;
    return (
      uploadingVideosArray.length > 0 &&
      uploadingVideosArray.map((uploadingVideo, i) => {
        return (
          <CardUploading
            key={uploadingVideo.localIdentifier}
            style={styles.CardUploading}
            videoInfo={uploadingVideo}
            uploadOnMount={true}
            dismiss={(videoUploaded) => this.dismissUploadCard(videoUploaded)}
            onRef={(ref) => (this.cardUploadingRef = ref)}
          />
        );
      })
    );
  }
  deleteVideos() {
    const {selectedVideos} = this.state;
    const numberVideos = selectedVideos.length;
    if (numberVideos !== 0) {
      navigate('Alert', {
        title: `Are you sure you want to delete this video? This action cannot be undone.`,
        textButton: `Delete (${numberVideos})`,
        onGoBack: async () => {
          deleteVideoFromLibrary(this.props.userID, selectedVideos);
        },
      });
    }
    this.setState({selectedVideos: [], selectableMode: false});
  }
  async openSession() {
    await this.setState({loader: true});
    const {userID, infoUser} = this.props;
    const session = await openSession(
      {
        id: userID,
        info: infoUser,
      },
      {},
    );
    await this.setState({loader: false});
    finalizeOpening(session);
  }
  selectVideo(id, isSelected) {
    let {selectedVideos} = this.state;
    if (isSelected) {
      selectedVideos.push(id);
    } else {
      const index = selectedVideos.indexOf(id);
      if (index > -1) {
        selectedVideos.splice(index, 1);
      }
    }
    this.setState({selectedVideos});
  }
  async uploadVideo() {
    const {navigate} = this.props.navigation;
    const permissionLibrary = await permission('library');
    if (!permissionLibrary)
      return navigate('Alert', {
        textButton: 'Open Settings',
        title:
          'You need to allow access to your library before uploading videos.',
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
      compressVideoPreset: __DEV__ ? 'MediumQuality' : 'HighestQuality',
    }).catch((err) => console.log('error', err));
    let uploadingVideosArray = videos;

    await Promise.all(
      videos.map(async (video, i) => {
        let newVideo = await getVideoInfo(video.path);
        newVideo.path = video.path;
        newVideo.localIdentifier = video.localIdentifier;
        uploadingVideosArray[i] = newVideo;
        return newVideo;
      }),
    );

    this.setState({uploadingVideosArray});
  }
  async addVideo() {
    const {navigate, layoutAction} = this.props.navigation;
    navigate('Alert', {
      title: `Select an option.`,
      displayList: true,
      listOptions: [
        {
          title: 'Upload video',
          operation: () => this.uploadVideo(),
        },
        {
          title: 'Record video',
          forceNavigation: true,
          operation: () => recordVideo(),
        },
      ],
    });
  }
  dismissUploadCard(videoUploaded) {
    let {uploadingVideosArray} = this.state;
    const index = uploadingVideosArray.indexOf(videoUploaded);
    uploadingVideosArray.splice(index, 1);
    this.setState({uploadingVideosArray});
  }
  noVideos() {
    const {uploadingVideosArray, videosArray} = this.state;
    const {videoLibrary} = this.props;
    return (
      videosArray.length === 0 &&
      uploadingVideosArray.length === 0 &&
      (!videoLibrary || Object.keys(videoLibrary).length === 0)
    );
  }
  listVideos() {
    const {uploadingVideosArray, videosArray} = this.state;
    return (
      <View style={{marginTop:72+sizes.marginTopApp}}>
        <QueueList localList={true} onOpen={() => true} onClose={() => true} />
        <LocalVideoLibrary />

        <View style={styleApp.marginView}>{this.uploadingVideosList()}</View>
        {this.noVideos() ? (
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
              text={'Upload video'}
              icon={{
                name: 'cloud-upload-alt',
                size: 22,
                type: 'font',
                color: colors.white,
              }}
              backgroundColor={'green'}
              onPressColor={colors.greenLight}
              click={() => this.uploadVideo()}
            />
            <View style={{height: 20}} />
            <Button
              text={'Record session'}
              icon={{
                name: 'video',
                size: 22,
                type: 'font',
                color: colors.white,
              }}
              backgroundColor={'blue'}
              onPressColor={colors.blueLight}
              click={() => this.openSession()}
            />
          </View>
        ) : (
          <View style={{paddingLeft:'5%', paddingBottom:170+sizes.marginBottomApp}}>
            <Text style={[styleApp.title, {marginBottom: 20}]}>
              GameFare library {!this.noVideos() && `(${videosArray.length})`}
            </Text>
            <FlatList
              data={videosArray}
              renderItem={(video) => this.renderCardArchive(video)}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={true}
              contentContainerStyle={{paddingBottom: 0}}
              showsVerticalScrollIndicator={true}
              initialNumToRender={10}
            />
          </View>
        )}
      </View>
    );
  }
  renderCardArchive(video) {
    const {selectableMode, selectedVideos} = this.state;
    const {local, snippets, id} = video.item;
    const isSelected = includes(video.item.id, selectedVideos);
    return (
      <CardArchive
        local={local ? true : false}
        selectableMode={selectableMode}
        isSelected={isSelected}
        selectVideo={(id, selected) => this.selectVideo(id, selected)}
        style={styles.cardArchive}
        id={id}
        key={id}
        noUpdateStatusBar={true}
        openVideo={(snippets && Object.values(snippets).length > 0) ? 
          (id) => this.openVideoWithSnippets(id) : null}
      />
    );
  }

  render() {
    const {
      selectableMode,
      videosArray,
      uploadingVideosArray,
      loader,
      selectedVideos,
    } = this.state;

    return (
      <View style={styleApp.stylePage}>
        <HeaderVideoLibrary
          loader={loader}
          selectableMode={selectableMode}
          isListEmpty={this.noVideos()}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          selectedVideos={selectedVideos}
          uploadVideo={this.addVideo.bind(this)}
          deleteVideos={this.deleteVideos.bind(this)}
          setState={this.setState.bind(this)}
        />

        {this.listVideos()}
        {/* <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.listVideos()}
          keyboardAvoidDisable={true}
          marginBottomScrollView={sizes.heightFooter + sizes.marginBottomApp}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          refreshControl={false}
          offsetBottom={30}
          showsVerticalScrollIndicator={true}
        /> */}
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
    archivedStreams: state.user.infoUser.archivedStreams,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    videoLibrary: state.localVideoLibrary.videoLibrary,
  };
};
export default connect(
  mapStateToProps,
  {},
)(VideoLibraryPage);
