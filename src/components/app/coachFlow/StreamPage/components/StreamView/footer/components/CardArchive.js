import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
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
import {formatDate, formatDuration} from '../../../../../../../functions/date';
import {resolutionP} from '../../../../../../../functions/pictures';
import Loader from '../../../../../../../layout/loaders/Loader';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

export default class CardArchive extends Component {
  static propTypes = {
    archive: PropTypes.object.isRequired,
    openVideo: PropTypes.func,
    style: PropTypes.object,
    selectableMode: PropTypes.bool,
    isSelected: PropTypes.bool,
    selectVideo: PropTypes.func,
  };
  static defaultProps = {
    selectableMode: false,
    isSelected: false,
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
            this.setState({
              videoFullscren: false,
              paused: true,
              displayVideoPlayer: false,
            });
          }}
        />
      );
    }
  };
  cardArchive(archive) {
    const {isSelected, style, selectableMode, selectVideo} = this.props;
    const {id, thumbnail, url, startTimestamp, size, durationSeconds} = archive;
    const {loader} = this.state;

    return (
      <View style={[styles.cardArchive, style]}>
        {archive ? (
          <View style={styleApp.fullSize}>
            <AsyncImage
              mainImage={thumbnail ? thumbnail : ''}
              style={styleApp.fullSize}
            />
            <View style={styles.resolution}>
              <Text
                style={[
                  styleApp.title,
                  {color: colors.white, fontSize: 12},
                ]}>
                {resolutionP(size)}
              </Text>
            </View>
            <View
              pointerEvents="none"
              style={{
                ...styles.viewText,
                ...styleApp.fullSize,
                ...styleApp.marginView,
              }}>
              <Row>
                <Col style={styleApp.center}>
                  {loader ? (
                    <Loader size={25} color={colors.white} />
                  ) : selectableMode ? (
                    <AllIcons
                      name={isSelected ? 'check-circle' : 'circle'}
                      type="font"
                      size={25}
                      color={colors.green}
                      solid={isSelected ? true : false}
                    />
                  ) : (
                    <AllIcons
                      type={'font'}
                      color={colors.grey + '99'}
                      size={25}
                      name={'play'}
                    />
                  )}
                </Col>
              </Row>
            </View>
            <View
              pointerEvents="none"
              style={{...styles.viewText, bottom: 5, left: 5}}>
              <Col>
                <Text
                  style={[styleApp.text, {color: colors.white, fontSize: 13}]}>
                  {formatDuration(durationSeconds*1000, true)}
                </Text>
                <Text
                  style={[styleApp.textBold, {color: colors.white, fontSize: 13}]}>
                    {formatDate(startTimestamp)}
                </Text>
              </Col>
            </View>

            <ButtonColor
              view={() => {
                const styleRow = {
                  position: 'absolute',
                  bottom: 20,
                  width: '100%',
                };
                return <Row style={styleRow} />;
              }}
              click={() =>
                selectableMode
                  ? selectVideo(id, !isSelected)
                  : this.openVideo(url, thumbnail)
              }
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
  resolution: {
    zIndex:5,
    position:'absolute',
    padding:7,
    top:0,
    right:0,
    backgroundColor: colors.greenLight,
    opacity: 0.8,
    borderBottomLeftRadius: 5
  }
});
