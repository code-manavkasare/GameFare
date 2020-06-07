import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import MediaPicker from 'react-native-image-crop-picker';
import {includes} from 'ramda';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CardArchive from '../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';
import CardUploading from './components/CardUploading';
import {
  addVideoToMember,
  deleteVideoFromLibrary,
} from '../../database/firebase/videosManagement.js';

import ScrollView from '../../layout/scrollViews/ScrollView2';

import {
  sortVideos,
  permission,
  goToSettings,
  getVideoInfo,
} from '../../functions/pictures';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';
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

  static getDerivedStateFromProps = (props) => {
    const videosArray = sortVideos(props.archivedStreams);
    return {videosArray};
  };

  uploadingVideosList = () => {
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
  };

  deleteVideos = () => {
    deleteVideoFromLibrary(this.props.userID, this.state.selectedVideos);
    this.setState({selectedVideos: [], selectableMode: false});
  };

  listVideos() {
    const {
      loader,
      selectableMode,
      selectedVideos,
      uploadingVideosArray,
      videosArray,
    } = this.state;

    return (
      <View style={styles.container}>
        {this.uploadingVideosList()}
        {loader ? (
          this.placehoder()
        ) : videosArray.length === 0 && uploadingVideosArray.length === 0 ? (
          <Text style={[styleApp.text, styleApp.marginView, {marginTop: 0}]}>
            You have no video in your cloud yet. Start today by uploading some
            or record yourself !
          </Text>
        ) : (
          videosArray.map((video) => {
            const isSelected = includes(video.id, selectedVideos);
            return (
              <CardArchive
                selectableMode={selectableMode}
                isSelected={isSelected}
                selectVideo={this.selectVideo}
                style={styles.cardArchive}
                archive={video}
                key={video.id}
                noUpdateStatusBar={true}
              />
            );
          })
        )}
      </View>
    );
  }

  selectVideo = (id, isSelected) => {
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
  };

  uploadVideo = async () => {
    const {navigate} = this.props.navigation;
    const permissionLibrary = await permission('library');
    console.log('permissionLibrary', permissionLibrary);
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
    console.log('uploadingVideosArray', uploadingVideosArray);

    const testVideo = await getVideoInfo(uploadingVideosArray[0].path);
    console.log('testVideo', testVideo);

    await Promise.all(
      videos.map(async (video, i) => {
        let newVideo = await getVideoInfo(video.path);
        newVideo.path = video.path;
        newVideo.localIdentifier = video.localIdentifier;
        uploadingVideosArray[i] = newVideo;
        // return newVideo;
      }),
    );
    console.log('videos', uploadingVideosArray);

    this.setState({uploadingVideosArray});
  };

  dismissUploadCard = (videoUploaded) => {
    let {uploadingVideosArray} = this.state;
    const index = uploadingVideosArray.indexOf(videoUploaded);
    uploadingVideosArray.splice(index, 1);
    this.setState({uploadingVideosArray});
  };

  pickMembersToShareVideosWith = () => {
    const {navigate} = this.props.navigation;
    const {selectedVideos} = this.state;
    const {userID} = this.props;

    navigate('PickMembers', {
      usersSelected: {},
      selectMultiple: true,
      closeButton: true,
      loaderOnSubmit: true,
      contactsOnly: false,
      displayCurrentUser: false,
      noUpdateStatusBar: true,
      titleHeader: 'Select members to share video with',
      onGoBack: async (members) => {
        for (const member of Object.values(members)) {
          for (const videoId of selectedVideos) {
            addVideoToMember(userID, member.id, videoId);
          }
        }
        this.setState({selectableMode: false, selectedVideos: []});
        return navigate('VideoLibraryPage');
      },
    });
  };

  render() {
    const {goBack} = this.props.navigation;
    const {selectableMode, selectedVideos} = this.state;
    const {userID} = this.props;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={selectableMode ? 'Select Videos' : 'Video Library'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          initialBorderWidth={0.3}
          typeIcon2={'font'}
          sizeIcon2={17}
          icon1={selectableMode ? 'times' : 'arrow-left'}
          icon2={selectableMode ? 'user-plus' : 'cloud-upload-alt'}
          typeIconOffset={'font'}
          colorIconOffset={colors.white}
          sizeIconOffset={17}
          iconOffset={selectableMode ? 'trash-alt' : 'text'}
          textOffset={'Select'}
          clickButton1={() =>
            selectableMode ? this.setState({selectableMode: false}) : goBack()
          }
          clickButton2={() =>
            selectableMode
              ? this.pickMembersToShareVideosWith()
              : this.uploadVideo()
          }
          clickButtonOffset={() =>
            selectableMode
              ? this.deleteVideos()
              : this.setState({selectableMode: true})
          }
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.listVideos.bind(this)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          refreshControl={false}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooter + 70}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginLeft: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardArchive: {
    width: width / 2 - 10,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.title,
    margin: 5,
  },
  CardUploading: {
    width: width / 2 - 10,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'white',
    margin: 5,
  },
});

const mapStateToProps = (state) => {
  return {
    archivedStreams: state.user.infoUser.archivedStreams,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(VideoLibraryPage);
