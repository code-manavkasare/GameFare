import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';

import * as Progress from 'react-native-progress';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class CardUploading extends Component {
  static propTypes = {
    videoInfo: PropTypes.object.isRequired,
    style: PropTypes.object,
    dismiss: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      status: 'pause',
      uploadTask: '',
    };
  }
  componentDidMount = async () => {
    this.uploadFile();
    console.log('videoInfo: ', this.props.videoInfo);
  };

  dismiss = (videoInfo) => {
    this.props.dismiss(videoInfo);
  };

  uploadVideoFirebase = async (uri, destination, name) => {
    const that = this;
    const videoRef = storage()
      .ref(destination)
      .child(name);
    const uploadTask = videoRef.put(uri, {contentType: 'video'});
    this.setState({uploadTask});

    return new Promise((resolve, reject) =>
      uploadTask.on(
        'state_changed',
        async function(snapshot) {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          await that.setState({progress: progress.toFixed(0) / 100});
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
          console.log('Upload complete');
          var url = await videoRef.getDownloadURL();
          console.log('url: ', url);
          resolve(url);
        },
      ),
    );
  };

  uploadFile = async () => {
    const {userID, videoInfo} = this.props;
    const {duration, height, width, size} = videoInfo;

    const id = videoInfo.localIdentifier.split('/')[0];

    const destinationCloud = `archivedStreams/${id}`;
    const videoUrl = await this.uploadVideoFirebase(
      videoInfo.path,
      destinationCloud,
      'archive.mp4',
    );
    console.log('videoUrl: ', videoUrl);

    let updates = {};
    const startTimestamp = Date.now();
    updates[destinationCloud] = {
      durationSeconds: duration,
      id,
      url: videoUrl,
      uploadedByUser: true,
      members: {[userID]: true},
      sizeOctets: size,
      resolution: `${width}x${height}`,
      startTimestamp,
    };
    updates[`users/${userID}/${destinationCloud}`] = {
      id,
      startTimestamp,
      uploadedByUser: true,
    };

    await database()
      .ref()
      .update(updates);
    console.log('videoUploaded');
    this.dismiss(videoInfo);
  };

  render() {
    const {progress} = this.state;
    return (
      <View style={[styleApp.center, this.props.style]}>
        <Progress.Circle
          color={colors.primary}
          size={100}
          progress={progress}
          showsText={true}
          formatText={() => `${Math.round(progress * 100)}%`}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(CardUploading);
