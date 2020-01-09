import React from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';

import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';
// import Video from 'react-native-video';
import Video from 'react-native-af-video-player';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import ButtonColor from '../../../layout/Views/Button';
const {height, width} = Dimensions.get('screen');

import AsyncImage from '../../../layout/image/AsyncImage';
import Loader from '../../../layout/loaders/Loader';
import AllIcons from '../../../layout/icons/AllIcons';
import {
  uploadPictureFirebase,
  uploadVideoFirebase,
  resize,
  resizeVideo,
} from '../../../functions/pictures';
import FadeInView from 'react-native-fade-in-view';

export default class CardContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {
    console.log(
      'mount card img',
      !this.props.image.uploaded &&
        this.props.user._id === this.props.message.user._id,
    );
    if (
      !this.props.image.uploaded &&
      this.props.user._id === this.props.message.user._id
    )
      this.uploadPicture(
        this.props.image,
        this.props.discussionID,
        this.props.message._id,
      );
  }
  componentWillReceiveProps(nextProps) {
    if (
      !nextProps.image.uploaded &&
      nextProps.user._id === nextProps.message.user._id
    )
      this.uploadPicture(
        nextProps.image,
        nextProps.discussionID,
        nextProps.message._id,
      );
  }
  async uploadPicture(image, discussionID, messageID) {
    console.log('upload image');
    await this.setState({loader: true});
    const destinationImage =
      'discussions/' +
      discussionID +
      '/messages/' +
      messageID +
      '/images/' +
      image.id;
    var newImgUrl = '';

    if (image.type === 'image') {
      var uri = await resize(image.uri);
      newImgUrl = await uploadPictureFirebase(uri, destinationImage);
    } else if (image.type === 'video') {
      console.log('video uplaod');
      //var uri = await resizeVideo(image.uri);
      var uri = '';
      console.log('uri', image.uri);
      // if (uri) console.log('la');
      newImgUrl = await uploadVideoFirebase(
        {...image, uri: image.uri},
        destinationImage,
      );
    }

    if (newImgUrl && newImgUrl !== '')
      await firebase
        .database()
        .ref(destinationImage)
        .update({
          uploaded: true,
          uri: newImgUrl,
        });
    await this.setState({loader: false});
    return true;
  }
  viewTopVideo(duration, play) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          zIndex: 20,
          // backgroundColor: 'red',
        }}>
        <View
          style={{
            ...styleApp.center,
            position: 'absolute',
            height: '100%',
            backgroundColor: colors.title,
            opacity: 0.1,
            zIndex: 20,
            width: '100%',
          }}>
          <AllIcons name="play" type="font" color={colors.white} size={30} />
        </View>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 60,
            height: 20,
            // backgroundColor: 'blue',
          }}>
          <Row style={{height: 20, paddingLeft: 5, paddingRight: 5}}>
            <Col style={styleApp.center2}>
              <AllIcons
                name="video"
                type="font"
                color={colors.white}
                size={13}
              />
            </Col>
            <Col style={styleApp.center3}>
              <Text
                style={[
                  styleApp.input,
                  {color: colors.white, fontWeight: 'bold'},
                ]}>
                {/* {duration ? duration.toFixed(0) + ' sec' : '2sec'} */}
              </Text>
            </Col>
          </Row>
        </View>
      </View>
    );
  }
  usersContent() {
    if (this.props.user._id === this.props.message.user._id) return true;
    return false;
  }
  displayImg(uri, type, local) {
    if (local && type === 'image')
      return <Image source={{uri}} style={{height: '100%', width: '100%'}} />;
    if (local) return <View style={{height: '100%', width: '100%'}} />;
    if (type === 'video')
      return (
        <Video
          // rotateToFullScreen={true}
          url={uri}
          resizeMode={'contain'}
          style={{height: '100%', width: '100%', backgroundColor: colors.title}}
        />
      );
    // return <Video source={{uri: uri}}   // Can be a URL or a local file.
    // ref={(ref) => {
    //   this.player = ref
    // }}
    // muted={true}
    // paused={true}                                     // Store reference
    // // onBuffer={this.onBuffer}                // Callback when remote video is buffering
    // // onError={this.videoError}               // Callback when video cannot be loaded
    // style={{height: '100%', width: '100%',backgroundColor:colors.title}}
    // />
    if (local)
      return (
        <Image style={{height: '100%', width: '100%'}} source={{uri: uri}} />
      );
    return (
      <AsyncImage
        style={{height: '100%', width: '100%'}}
        mainImage={uri}
        imgInitial={uri}
      />
    );
  }
  cardContent(image) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              {/* {image.type === 'video' && this.viewTopVideo(image.duration)} */}

              {this.state.loader && (
                <View style={styles.loaderView}>
                  <Loader size={20} color={'green'} />
                </View>
              )}

              {this.usersContent() && !image.uploaded ? (
                this.displayImg(image.uri, image.type, true)
              ) : !image.uploaded ? (
                <View
                  style={{
                    height: 200,
                    width: 100,
                    backgroundColor: colors.green,
                  }}
                />
              ) : (
                this.displayImg(image.uri, image.type, false)
              )}
            </Row>
          );
        }}
        click={
          () => true
          //this.selectImage(image)
        }
        color={colors.off}
        style={styles.viewImg}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardContent(this.props.image);
  }
}

const styles = StyleSheet.create({
  viewImg: {
    borderRadius: 5,
    width: '100%',
    height: 200,
    marginTop: 15,
    overflow: 'hidden',
  },
  voile: {
    ...styleApp.center,
    backgroundColor: colors.title,
    height: '100%',
    width: '100%',
    //borderRadius: 15,
    opacity: 0.4,
    //right: 5,
    //top: 5,
    zIndex: 30,
    borderColor: colors.grey,
    position: 'absolute',
  },
  loaderView: {
    ...styleApp.center,
    height: '100%',
    opacity: 0.4,
    width: '100%',
    zIndex: 20,
    backgroundColor: colors.title,
    position: 'absolute',
  },
});
