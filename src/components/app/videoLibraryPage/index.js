import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import MediaPicker from 'react-native-image-crop-picker';
import {ProcessingManager} from 'react-native-video-processing';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CardArchive from '../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';
import CardUploading from './components/CardUploading';

import ScrollView from '../../layout/scrollViews/ScrollView2';

import {sortVideos} from '../../functions/pictures';
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
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.getUserVideos();
  }
  componentDidUpdate = () => {
    this.getUserVideos();
  };

  getUserVideos = async () => {
    const videosArray = sortVideos(this.props.archivedStreams);
    await this.setState({videosArray});
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
            dismiss={(videoUploaded) => this.dismissUploadCard(videoUploaded)}
          />
        );
      })
    );
  };

  listVideos() {
    const {loader, videosArray} = this.state;

    return (
      <View style={styles.container}>
        {this.uploadingVideosList()}
        {loader ? (
          this.placehoder()
        ) : videosArray.length === 0 ? (
          <Text style={[styleApp.text, {marginLeft: 20, marginTop: 10}]}>
            You have no video in your cloud yet. Start today by uploading some
            or record yourself !
          </Text>
        ) : (
          videosArray.map((video, i) => {
            return (
              <CardArchive
                style={styles.cardArchive}
                archive={video}
                key={video.id}
              />
            );
          })
        )}
      </View>
    );
  }

  uploadVideo = async () => {
    const videos = await MediaPicker.openPicker({
      multiple: true,
      mediaType: 'video',
    });
    let uploadingVideosArray = videos;

    await Promise.all(
      videos.map(async (video, i) => {
        await ProcessingManager.getVideoInfo(video.path).then(({duration}) => {
          uploadingVideosArray[i].duration = Math.round(duration);
        });
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

  render() {
    const {goBack} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Video Library'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          //   initialBorderColorHeader={colors.grey}
          initialTitleOpacity={1}
          initialBorderWidth={0.3}
          typeIcon2={'font'}
          sizeIcon2={17}
          icon1={'arrow-left'}
          icon2={'cloud-upload-alt'}
          clickButton1={() => goBack()}
          clickButton2={() => this.uploadVideo()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.listVideos.bind(this)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          refreshControl={false}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooter + 40}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    minHeight: height,
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
