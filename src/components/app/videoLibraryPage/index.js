import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
import ImagePicker from 'react-native-image-crop-picker';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CardArchive from '../coachFlow/StreamPage/footer/components/CardArchive';

import ScrollView from '../../layout/scrollViews/ScrollView2';
import PlaceHolder from '../../placeHolders/CardConversation';

import {uploadVideoFirebase, sortVideos} from '../../functions/pictures';
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
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.getUserVideos();
  }

  getUserVideos = async () => {
    const videosArray = sortVideos(this.props.archivedStreams);
    await this.setState({videosArray});
  };

  listVideos() {
    const {loader, videosArray} = this.state;
    console.log('videosArray: ', videosArray);

    return (
      <View style={{marginTop: 10, minHeight: height}}>
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
                archive={video}
                key={i}
                openVideo={(source, thumbnail) => {
                  alert('not working yet');
                }}
              />
            );
          })
        )}
      </View>
    );
  }

  uploadVideo = async () => {
    console.log('upload');
    const videos = await ImagePicker.openPicker({
      multiple: true,
      mediaType: 'video',
    });
    console.log('videos', videos);

    const {userID} = this.props;
    const videoUri = videos[0].path;
    console.log('videoUri: ', videoUri);
    const destinationImage = `archivedStreams/test/`;
    const videoUrl = await uploadVideoFirebase(
      {uri: videoUri},
      destinationImage,
      'archive.mp4',
    );
    console.log('videoUrl: ', videoUrl);

    let updates = {};
    updates[`archivedStreams/test`] = {
      id: 'test',
      url: videoUrl,
      source: 'personal',
      usersLinked: {[userID]: true},
    };
    updates[`users/${userID}/archivedStreams/test`] = true;

    await firebase.database().ref().update(updates);
    console.log('videoUploaded');
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
          initialBorderColorHeader={colors.grey}
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
          refreshControl={true}
          refresh={() => this.refresh()}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooter + 40}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  console.log('state: ', state);
  return {
    archivedStreams: state.user.infoUser.archivedStreams,
    userID: state.user.userID,
    wallet: state.user.infoUser.wallet,
  };
};

export default connect(mapStateToProps, {})(VideoLibraryPage);
