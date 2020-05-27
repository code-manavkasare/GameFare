import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  View,
  StyleSheet,
  Animated,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import * as Progress from 'react-native-progress';
import {Col, Row} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

import {timing, native} from '../../../animations/animations';
import ButtonColor from '../../../layout/Views/Button';
import Loader from '../../../layout/loaders/Loader';
import AllIcons from '../../../layout/icons/AllIcons';
import {resolutionP} from '../../../functions/pictures';
import isEqual from 'lodash.isequal';

class CardUploading extends Component {
  static propTypes = {
    videoInfo: PropTypes.object,
    style: PropTypes.object,
    dismiss: PropTypes.func,
    uploadOnMount: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      status: 'stop',
      uploadTask: '',
      videoInfo: {
        duration: 0,
        size: {},
      },
    };
    this.scaleCard = new Animated.Value(0);
  }
  componentDidMount = async () => {
    this.props.onRef(this);
    const {uploadOnMount} = this.props;
    const {videoInfo} = this.state;
    if (uploadOnMount) {
      await this.open(true, videoInfo);
      this.uploadFile();
    }
  };
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.videoInfo, state.videoInfo) && props.videoInfo)
      return {
        videoInfo: props.videoInfo,
      };
    return {};
  }
  getVideoUploadStatus() {
    const {progress, videoInfo} = this.state;
    if (progress !== 0 && progress !== 1) return videoInfo;
    return false;
  }
  open = async (nextVal, videoInfo) => {
    if (nextVal && videoInfo) await this.setState({videoInfo});
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(nextVal ? 1 : 0)),
    ]).start();
  };
  uploadThumbnail = async (thumbnail, destination, name) => {
    const videoRef = storage()
      .ref(destination)
      .child(name);
    const uploadTask = videoRef.putFile(thumbnail, {
      contentType: 'image/jpeg',
      cacheControl: 'no-store',
    });
    const that = this;
    return new Promise((resolve, reject) =>
      uploadTask.on(
        'state_changed',
        async function(snapshot) {
          let progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (isNaN(progress)) progress = 0;
          console.log('progress thumbnal', progress);
          await that.setState({
            progress: (progress.toFixed(0) / 100) * 0.2,
            status: 'uploading',
          });
          switch (snapshot.state) {
            case storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              break;
          }
        },
        function(error) {
          console.log(error);
          reject(error);
        },
        async () => {
          console.log('Upload thumbnail complete');
          var url = await videoRef.getDownloadURL();
          console.log('url: ', url);
          resolve(url);
        },
      ),
    );
  };
  uploadVideoFirebase = async (videoInfo, destination, name) => {
    const that = this;
    const {path} = videoInfo;

    const videoRef = storage()
      .ref(destination)
      .child(name);
    const uploadTask = videoRef.putFile(path, {
      contentType: 'video',
      cacheControl: 'no-store',
    });
    return new Promise((resolve, reject) =>
      uploadTask.on(
        'state_changed',
        async function(snapshot) {
          let progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (isNaN(progress)) progress = 0;
          console.log('progress', progress);

          await that.setState({
            progress: 0.2 + (Number(progress.toFixed(0)) / 100) * 0.8,
            status: 'uploading',
          });
          switch (snapshot.state) {
            case storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case storage.TaskState.RUNNING: // or 'running'
              console.log('Upload video is running');
              break;
          }
        },
        function(error) {
          console.log(error);
          reject(error);
        },
        async () => {
          console.log('Upload complete');
          var url = await videoRef.getDownloadURL();
          console.log('url: ', url);
          resolve(url);
        },
      ),
    );
  };

  uploadFile = async () => {
    await this.setState({status: 'loading'});
    const {videoInfo} = this.state;
    const {userID, dismiss} = this.props;
    const {duration, size} = videoInfo;

    const id = videoInfo.localIdentifier.split('/')[0];
    console.log('videoInfovideoInfovideoInfovideoInfo', videoInfo);

    const destinationCloud = `archivedStreams/${id}`;
    const thumbnailUrl = await this.uploadThumbnail(
      'file:///private' + videoInfo.thumbnail,
      destinationCloud,
      'thumbnail.jpg',
    );
    console.log('thumbnailUrl', thumbnailUrl);
    const videoUrl = await this.uploadVideoFirebase(
      videoInfo,
      destinationCloud,
      'archive.mp4',
    );
    console.log('videoUrl: ', videoUrl);

    let updates = {};
    const startTimestamp = Date.now();

    updates[`${destinationCloud}/durationSeconds`] = duration;
    updates[`${destinationCloud}/id`] = id;
    updates[`${destinationCloud}/url`] = videoUrl;
    updates[`${destinationCloud}/uploadedByUser`] = true;
    updates[`${destinationCloud}/members`] = {[userID]: true};
    updates[`${destinationCloud}/size`] = size;
    updates[`${destinationCloud}/thumbnail`] = thumbnailUrl;
    updates[`${destinationCloud}/startTimestamp`] = startTimestamp;

    updates[`users/${userID}/${destinationCloud}/id`] = id;
    updates[
      `users/${userID}/${destinationCloud}/startTimestamp`
    ] = startTimestamp;
    updates[`users/${userID}/${destinationCloud}/uploadedByUser`] = true;

    await database()
      .ref()
      .update(updates);
    console.log('videoUploaded');

    if (dismiss) dismiss(videoInfo);
    this.open(false);
  };

  render() {
    const {style, size} = this.props;
    const {progress, videoInfo, status} = this.state;
    console.log('videoInfo', videoInfo);
    return (
      <Animated.View
        style={[
          {transform: [{scale: this.scaleCard}]},
          styleApp.center,
          style,
        ]}>
        {size === 'sm' ? (
          <Row>
            <ButtonColor
              view={() => {
                return (
                  <AllIcons
                    name="close"
                    color={colors.title}
                    size={19}
                    type="mat"
                  />
                );
              }}
              click={() => this.open(false)}
              color={colors.off2}
              style={styles.buttonClose}
              onPressColor={colors.off}
            />
            <Col size={35} style={styleApp.center}>
              <Image
                style={styles.imgCard}
                source={{uri: videoInfo.thumbnail}}
              />
            </Col>
            <Col size={45} style={styleApp.center2}>
              <Text style={[styleApp.text, {fontSize: 16}]}>
                {videoInfo.duration.toFixed(0)}sec
              </Text>
              <Text style={[styleApp.text, {fontSize: 13}]}>
                {videoInfo.size && resolutionP(videoInfo.size)}
              </Text>
            </Col>

            <Col size={30} style={styleApp.center2}>
              {status !== 'uploading' ? (
                <ButtonColor
                  view={() => {
                    return status === 'loading' ? (
                      <Loader size={40} color={colors.primary} />
                    ) : (
                      <AllIcons
                        name="upload"
                        color={colors.title}
                        size={20}
                        type="font"
                      />
                    );
                  }}
                  click={() => this.uploadFile()}
                  color={colors.white}
                  style={styles.imgCard}
                  onPressColor={colors.off}
                />
              ) : progress === 1 ? (
                <AllIcons
                  name="check"
                  color={colors.greenClick}
                  size={20}
                  type="font"
                />
              ) : (
                <Progress.Circle
                  color={colors.primary}
                  size={40}
                  progress={progress}
                  borderWidth={1.5}
                  borderColor={colors.primary}
                  textStyle={styles.textProgress}
                  showsText={true}
                  formatText={() => `${Math.round(progress * 100)}%`}
                />
              )}
            </Col>
          </Row>
        ) : (
          <View style={styleApp.fullSize}>
            <View style={styles.voile}>
              <Progress.Circle
                color={colors.white}
                size={100}
                borderColor={colors.white}
                borderWidth={2}
                textStyle={[
                  styles.textProgress,
                  {fontSize: 19, color: colors.white},
                ]}
                progress={progress}
                showsText={true}
                formatText={() => `${Math.round(progress * 100)}%`}
              />
            </View>
            <Image
              style={styleApp.fullSize}
              source={{uri: videoInfo.thumbnail}}
            />
          </View>
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  textProgress: {
    ...styleApp.textBold,
    fontWeight: 'bold',
    color: colors.primary,
    fontSize: 13,
  },
  imgCard: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  voile: {
    ...styleApp.fullSize,
    ...styleApp.center,
    position: 'absolute',
    zIndex: 10,
    backgroundColor: colors.greyDark + '80',
  },
  buttonClose: {
    position: 'absolute',
    top: -15,
    left: -15,
    ...styleApp.center,
    height: 40,
    borderColor: colors.off,
    borderWidth: 1,
    borderRadius: 20,
    width: 40,
    zIndex: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(CardUploading);
