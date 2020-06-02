import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Switch,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import PropTypes from 'prop-types';
import Video from 'react-native-video';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {navigate} from '../../../../../../../../../NavigationService';

import AllIcons from '../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {displayTime, timeout} from '../../../../../../../functions/coach';
import {date} from '../../../../../../../layout/date/date';
import {resolutionP} from '../../../../../../../functions/pictures';
import Loader from '../../../../../../../layout/loaders/Loader';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

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
      doAnalytics: false,
    };
  }

  async componentDidMount() {
    const {archive: archiveData} = this.props;
    this.loadArchive(archiveData.id);
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
    console.log('url', url, this.state);
    const {openVideo} = this.props;
    if (openVideo) {
      openVideo(url, thumbnail);
    } else {
      this.setState({loader: true, displayVideoPlayer: true});
    }
  };
  openStatistics() {
    const {noUpdateStatusBar} = this.props;
    const {archive} = this.state;
    navigate('CourtCalibration', {
      screen: 'CameraAngle',
      params: {
        archive: archive,
        noUpdateStatusBar: noUpdateStatusBar,
        onGoBack: async () => {
          await this.setState({doAnalytics: true});
          return true;
        },
      },
    });
  }

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
    const {archive: archiveData, style, noUpdateStatusBar} = this.props;
    const {
      thumbnail,
      url,
      startTimestamp,
      size,
      durationSeconds,
      // doAnalytics,
    } = archive;
    const {doAnalytics, loader} = this.state;
    return (
      <View style={[styles.cardArchive, style]}>
        {archive ? (
          <View style={styleApp.fullSize}>
            <AsyncImage mainImage={thumbnail} style={styleApp.fullSize} />

            <View
              pointerEvents="none"
              style={{
                ...styles.viewText,
                ...styleApp.marginView,
                top: 10,
              }}>
              <Row>
                <Col size={80} style={styleApp.center2}>
                  <Text
                    style={[
                      styleApp.title,
                      {color: colors.white, fontSize: 15},
                    ]}>
                    {resolutionP(size)} • {displayTime(durationSeconds)}
                  </Text>
                </Col>
                <Col size={20} style={styleApp.center3}>
                  {loader ? (
                    <Loader size={25} color={colors.white} />
                  ) : (
                    <AllIcons
                      type={'font'}
                      color={colors.white}
                      size={25}
                      name={'play-circle'}
                    />
                  )}
                </Col>
              </Row>
            </View>
            {/* <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.openStatistics()}
              style={{
                ...styles.viewText,
                ...styleApp.marginView,
                top: 40,
                width: '100%',
              }}>
              <Row>
                <Col size={35} style={styleApp.center2}>
                  <Switch
                    trackColor={colors.title}
                    thumbColor={doAnalytics ? colors.white : colors.off}
                    ios_backgroundColor={colors.greyDark}
                    onValueChange={() => {
                      navigate('CourtCalibration', {
                        archive: archive,
                        noUpdateStatusBar: noUpdateStatusBar,
                      });
                      return this.setState({doAnalytics: !doAnalytics});
                    }}
                    value={doAnalytics}
                  />
                </Col>
                <Col size={45} style={styleApp.center2}>
                  <Text
                    style={[
                      styleApp.title,
                      {color: colors.white, fontSize: 13},
                    ]}>
                    Analytics
                  </Text>
                </Col>
                <Col size={20} style={styleApp.center3}>
                  <AllIcons
                    type={'mat'}
                    color={colors.white}
                    size={25}
                    name={'keyboard-arrow-right'}
                  />
                </Col>
              </Row>
            </TouchableOpacity> */}
            <View
              pointerEvents="none"
              style={{...styles.viewText, bottom: 5, left: 5}}>
              <Row />
              <Text
                style={[styleApp.text, {color: colors.white, fontSize: 12}]}>
                {date(
                  new Date(startTimestamp).toString(),
                  'ddd, MMM Do • h:mm a',
                )}
              </Text>
            </View>

            <ButtonColor
              view={() => {
                const {loader} = this.state;
                const styleRow = {
                  position: 'absolute',
                  bottom: 20,
                  width: '100%',
                };
                return <Row style={styleRow} />;
              }}
              click={() => this.openVideo(url, thumbnail)}
              color={colors.greyDark + '40'}
              onPressColor={colors.grey + '40'}
              style={[
                styleApp.fullSize,
                styleApp.center,
                styleApp.marginView,
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
