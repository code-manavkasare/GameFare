import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import PropTypes from 'prop-types';
import Video from 'react-native-video';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {displayTime} from '../../../../../../../functions/coach';
import {date, time} from '../../../../../../../layout/date/date';
import Loader from '../../../../../../../layout/loaders/Loader';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';
import {timeout} from '../../../../../../../functions/coach';

export default class CardArchive extends Component {
  static propTypes = {
    archive: PropTypes.object.isRequired,
    openVideo: PropTypes.func,
    style: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      archive: false,
      videoFullscren: false,
      paused: true,
      displayVideoPlayer: false,
      loader: false,
    };
  }

  async componentDidMount() {
    const {archive: archiveData} = this.props;
    if (archiveData.available) this.loadArchive(archiveData.id);
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.archive.available !== this.props.archive.available &&
      this.props.archive.available
    )
      this.loadArchive(this.props.archive.id);
    if (
      prevProps.archive.available !== this.props.archive.available &&
      !this.props.archive.available
    )
      this.setState({archive: false});
  }
  async loadArchive(archiveID) {
    let archive = await database()
      .ref('archivedStreams/' + archiveID)
      .once('value');
    archive = archive.val();
    if (archive) await this.setState({archive: archive});
  }
  placeholder() {
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={[colors.off, colors.off2]}
        style={styleApp.fullSize}
      />
    );
  }

  openVideo = async (url, thumbnail) => {
    const {openVideo} = this.props;
    if (openVideo) {
      openVideo(url, thumbnail);
    } else {
      this.setState({loader: true, displayVideoPlayer: true});
    }
  };

  videoFullscreen = () => {
    const {archive, videoFullscren, displayVideoPlayer, paused} = this.state;
    if (displayVideoPlayer) {
      return (
        <Video
          source={{uri: archive.url}}
          fullscreen={videoFullscren}
          paused={paused}
          style={{position: 'absolute', width: 0, height: 0}}
          onLoad={async (callback) => {
            await timeout(1000);
            this.setState({videoFullscren: true, loader: false, paused: false});
          }}
          onFullscreenPlayerDidDismiss={(event) => {
            this.setState({videoFullscren: false, paused: true});
          }}
        />
      );
    }
  };

  cardArchive(archive) {
    const {archive: archiveData} = this.props;
    const {localUrl} = archiveData;
    const {
      thumbnail,
      url,
      startTimestamp,
      resolution,

      durationSeconds,
    } = archive;
    console.log('localUrl', localUrl);
    return (
      <View style={[styles.cardArchive, this.props.style]}>
        {!archiveData.available ? (
          <View style={[styleApp.fullSize]}>
            <View
              style={[
                styleApp.fullSize,
                styleApp.center,
                {position: 'absolute', zIndex: 20},
                {backgroundColor: colors.grey + '30'},
              ]}>
              <Text style={[styleApp.text, {color: colors.white}]}>
                Processing video...
              </Text>
            </View>
            <Image
              source={{uri: 'ph://' + localUrl}}
              style={styleApp.fullSize}
            />
          </View>
        ) : archive ? (
          <View style={styleApp.fullSize}>
            <AsyncImage mainImage={thumbnail} style={styleApp.fullSize} />
            <View style={{...styles.viewText, bottom: 5, left: 5}}>
              <Text
                style={[styleApp.text, {color: colors.white, fontSize: 12}]}>
                {date(
                  new Date(startTimestamp).toString(),
                  'ddd, MMM Do • h:mm a',
                )}
              </Text>
            </View>
            <View style={{...styles.viewText, top: 5, right: 5}}>
              <Text
                style={[styleApp.text, {color: colors.white, fontSize: 15}]}>
                {resolution}p • {displayTime(durationSeconds)}
              </Text>
            </View>
            <ButtonColor
              view={() => {
                const {loader} = this.state;
                if (loader) return <Loader size={50} color={colors.white} />;
                return (
                  <AllIcons
                    type={'font'}
                    color={colors.white}
                    size={45}
                    name={'play-circle'}
                  />
                );
              }}
              click={() => this.openVideo(url, thumbnail)}
              color={colors.greyDark + '40'}
              onPressColor={colors.grey + '40'}
              style={[
                styleApp.fullSize,
                styleApp.center,
                {position: 'absolute'},
              ]}
            />
          </View>
        ) : (
          this.placeholder()
        )}
      </View>
    );
  }
  render() {
    const {archive} = this.state;

    return (
      <View>
        {this.cardArchive(archive)}
        {this.videoFullscreen()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewText: {
    position: 'absolute',
    zIndex: 5,
  },
});
