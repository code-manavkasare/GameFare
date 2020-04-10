import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
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

  // componentWillUnmount = () => {
  //   this.state.uploadTask.cancel();
  // };

  dismiss = (videoInfo) => {
    this.props.dismiss(videoInfo);
  };

  uploadVideoFirebase = async (uri, destination, name) => {
    const that = this;
    const videoRef = firebase
      .storage()
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
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
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
    const {userID, videoInfo, indexVideoArray} = this.props;
    console.log('indexVideoArray: ', indexVideoArray);
    const {height, filename, width} = videoInfo;
    console.log('videoInfo: ', videoInfo);

    const regex = /.*-/;
    const cleanIdFile = regex.exec(videoInfo.localIdentifier);
    const idFile = `${userID}-${cleanIdFile}`;

    const destinationCloud = `archivedStreams/${idFile}`;
    const videoUrl = await this.uploadVideoFirebase(
      videoInfo.path,
      destinationCloud,
      'archive.mp4',
    );
    console.log('videoUrl: ', videoUrl);

    let updates = {};
    updates[destinationCloud] = {
      id: 'test',
      url: videoUrl,
      uploadedByUser: true,
      usersLinked: {[userID]: true},
      resolution: `${width}x${height}`,
    };
    updates[`users/${userID}/${destinationCloud}`] = {
      id: idFile,
      timestamp: Date.now(),
      uploadedByUser: true,
    };

    await firebase
      .database()
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
          size={100}
          progress={progress}
          showsText={true}
          formatText={() => `${Math.round(progress * 100)}%`}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(CardUploading);
