import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import MediaPicker from 'react-native-image-crop-picker';
import {includes} from 'ramda';
import StatusBar from '@react-native-community/status-bar';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CardArchive from '../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';
import {coachAction} from '../../../actions/coachActions';
import {layoutAction} from '../../../actions/layoutActions';
import CardUploading from './components/CardUploading';
import {
  addVideoToMember,
  deleteVideoFromLibrary,
} from '../../database/firebase/videosManagement.js';
import {navigate} from '../../../../NavigationService';
import Button from '../../layout/buttons/Button';

import {
  sortVideos,
  permission,
  goToSettings,
  getVideoInfo,
} from '../../functions/pictures';
import {openSession} from '../../functions/coach';
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
  };
  async openSession() {
    await this.setState({loader: true});
    const {
      userID,
      infoUser,
      coachAction,
      layoutAction,
      currentSessionID,
    } = this.props;
    const session = await openSession(
      {
        id: userID,
        info: infoUser,
      },
      {},
    );
    if (currentSessionID !== session.objectID)
      await coachAction('unsetCurrentSession');
    await coachAction('setCurrentSession', session);
    await layoutAction('setLayout', {isFooterVisible: false});
    StatusBar.setBarStyle('light-content', true);
    navigate('Session', {
      screen: 'Session',
      params: {},
    });
    await this.setState({loader: false});
  }

  listVideos() {
    const {
      selectableMode,
      selectedVideos,
      uploadingVideosArray,
      videosArray,
    } = this.state;
    const isListEmpty =
      videosArray.length === 0 && uploadingVideosArray.length === 0;

    return (
      <View
        style={[
          styleApp.marginView,
          {marginTop: sizes.marginTopApp + sizes.heightHeaderHome},
        ]}>
        {this.uploadingVideosList()}
        {isListEmpty ? (
          <View>
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
              click={async () => this.uploadVideo()}
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
          <FlatList
            data={videosArray}
            renderItem={this.renderCardArchive}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{paddingBottom: 150}}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
          />
        )}
      </View>
    );
  }

  renderCardArchive = (video) => {
    const {selectableMode, selectedVideos} = this.state;
    const isSelected = includes(video.item.id, selectedVideos);
    return (
      <CardArchive
        selectableMode={selectableMode}
        isSelected={isSelected}
        selectVideo={this.selectVideo}
        style={styles.cardArchive}
        archive={video.item}
        key={video.item.id}
        noUpdateStatusBar={true}
      />
    );
  };

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

    const testVideo = await getVideoInfo(uploadingVideosArray[0].path);

    await Promise.all(
      videos.map(async (video, i) => {
        let newVideo = await getVideoInfo(video.path);
        newVideo.path = video.path;
        newVideo.localIdentifier = video.localIdentifier;
        uploadingVideosArray[i] = newVideo;
        // return newVideo;
      }),
    );

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
    const {
      selectableMode,
      videosArray,
      uploadingVideosArray,
      loader,
    } = this.state;
    const isListEmpty =
      videosArray.length === 0 && uploadingVideosArray.length === 0;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={selectableMode ? 'Select Videos' : ''}
          inputRange={[5, 10]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          icon1={selectableMode ? 'times' : 'cloud-upload-alt'}
          // colorIcon2={colors.white}
          icon2={isListEmpty ? null : selectableMode ? 'trash-alt' : 'text'}
          text2={'Select'}
          typeIcon2={'font'}
          sizeIcon2={17}
          sizeIcon1={22}
          clickButton2={() =>
            selectableMode
              ? this.deleteVideos()
              : this.setState({selectableMode: true})
          }
          clickButton1={() =>
            selectableMode
              ? this.setState({selectableMode: false})
              : this.uploadVideo()
          }
          iconOffset={selectableMode && 'user-plus'}
          typeIconOffset="font"
          sizeIconOffset={16}
          colorIconOffset={colors.title}
          clickButtonOffset={() => this.pickMembersToShareVideosWith()}
        />
        {this.listVideos()}
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
    currentSessionID: state.coach.currentSessionID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {coachAction, layoutAction},
)(VideoLibraryPage);
