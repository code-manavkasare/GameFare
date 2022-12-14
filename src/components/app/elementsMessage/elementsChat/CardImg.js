import React from 'react';
import {View, Image, TouchableOpacity, StyleSheet} from 'react-native';

import {Col, Row, Grid} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';
// import Video from 'react-native-af-video-player';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import ButtonColor from '../../../layout/Views/Button';

import AsyncImage from '../../../layout/image/AsyncImage';
import Loader from '../../../layout/loaders/Loader';
import {
  uploadPictureFirebase,
  uploadVideoFirebase,
  resize,
} from '../../../functions/pictures';

export default class CardContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {
    // if (
    //   !this.props.image.uploaded &&
    //   this.props.user.id === this.props.message.user.id
    // )
    //   this.uploadPicture(
    //     this.props.image,
    //     this.props.discussionID,
    //     this.props.message.id,
    //   );
  }

  async uploadPicture(image, discussionID, messageID) {
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
      var uri = '';

      newImgUrl = await uploadVideoFirebase(
        {...image, uri: image.uri},
        destinationImage,
      );
    }

    if (newImgUrl && newImgUrl !== '')
      await database()
        .ref(destinationImage)
        .update({
          uploaded: true,
          uri: newImgUrl,
        });
    await this.setState({loader: false});
    return true;
  }
  // usersContent() {
  //   if (this.props.user.id === this.props.message.user.id) return true;
  //   return false;
  // }
  picture(uri, local) {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        style={{width: '100%', height: 130}}
        onPress={() => this.props.openImage()}>
        {local ? (
          <AsyncImage
            style={{width: '100%', height: 130}}
            mainImage={uri}
            imgInitial={uri}
          />
        ) : (
          <Image style={{width: '100%', height: 130}} source={{uri: uri}} />
        )}
      </TouchableOpacity>
    );
  }
  displayImg(uri, type, local, index) {
    if (local && type === 'image') return this.picture(uri, local);
    if (local) return <View style={{width: '100%', height: 130}} />;
    if (type === 'video')
      return (
        <View style={{height: '100%', width: '100%', backgroundColor: 'red'}} />
      );
    // return (
    //   <Video
    //     hideFullScreenControl={true}
    //     url={uri}
    //     style={[styleApp.fullSize]}
    //   />
    // );
    return this.picture(uri, local);
  }
  cardContent(image, index) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              {this.state.loader ? (
                <View style={styles.loaderView}>
                  <Loader size={20} color={'green'} />
                </View>
              ) : null}

              {!image.uploaded ? (
                this.displayImg(image.uri, image.type, true, index)
              ) : !image.uploaded ? (
                <View
                  style={{
                    ...styleApp.fullSize,
                    backgroundColor: colors.green,
                  }}
                />
              ) : (
                this.displayImg(image.uri, image.type, false, index)
              )}
            </Row>
          );
        }}
        click={() => true}
        color={colors.off}
        style={{flex: 1, marginTop: 10}}
        // style={styles.viewImg}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardContent(this.props.image, this.props.index);
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
