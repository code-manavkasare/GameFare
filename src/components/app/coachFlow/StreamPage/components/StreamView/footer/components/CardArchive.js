import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import Video from 'react-native-video';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {navigate} from '../../../../../../../../../NavigationService';

import AllIcons from '../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {displayTime, timeout} from '../../../../../../../functions/coach';
import {FormatDate, formatDuration} from '../../../../../../../functions/date';
import {
  removeVideo,
  uploadVideoAlert,
  openVideoPlayer,
} from '../../../../../../../functions/videoManagement';
import {resolutionP} from '../../../../../../../functions/pictures';
import Loader from '../../../../../../../layout/loaders/Loader';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class CardArchive extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    local: PropTypes.bool,
    parent: PropTypes.string,
    openVideo: PropTypes.func,
    style: PropTypes.object,
    selectableMode: PropTypes.bool,
    isSelected: PropTypes.bool,
    selectVideo: PropTypes.func,
  };
  static defaultProps = {
    local: false,
    parent: null,
    selectableMode: false,
    isSelected: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      videoFullscren: false,
      paused: true,
      displayVideoPlayer: false,
      loader: false,
      doAnalytics: false,
    };
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

  openVideo = async () => {
    const {openVideo} = this.props;
    const {archive} = this.props;
    if (openVideo) {
      openVideo(archive.id);
    } else {
      openVideoPlayer(archive, true);
    }
  };

  videoFullscreen = () => {
    const {archive} = this.props;
    const {videoFullscren, displayVideoPlayer, paused} = this.state;
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
  buttonClose() {
    const {archive: archiveData} = this.props;
    if (archiveData.local)
      return (
        <ButtonColor
          view={() => (
            <AllIcons name="times" type="font" color={colors.white} size={15} />
          )}
          click={() => removeVideo(archiveData)}
          color={colors.greyDark + '40'}
          onPressColor={colors.grey + '40'}
          style={[
            {
              position: 'absolute',
              height: 30,
              width: 30,
              top: 5,
              left: 5,
              zIndex: 20,
            },
          ]}
        />
      );
    return null;
  }
  buttonUpload() {
    const {archive: archiveData} = this.props;
    if (archiveData.local)
      return (
        <ButtonColor
          view={() => (
            <AllIcons name="cloud" type="font" color={colors.white} size={15} />
          )}
          click={() => uploadVideoAlert(archiveData)}
          color={colors.greyDark + '40'}
          onPressColor={colors.grey + '40'}
          style={[
            {
              position: 'absolute',
              height: 30,
              width: 30,
              top: 5,
              left: 40,
              zIndex: 20,
            },
          ]}
        />
      );
    return null;
  }
  snippetIndicator() {
    const {archive} = this.props;
    if (archive.snippets && Object.values(archive.snippets).length > 0) {
      return (
        <View
          style={{
            position: 'absolute',
            height: 30,
            width: 30,
            bottom: 0,
            right: 5,
            zIndex: 20,
          }}>
          <AllIcons name="flag" type="font" color={colors.white} size={15} />
        </View>
      );
    } else {
      return null;
    }
  }
  cardArchive(archive) {
    const {isSelected, style, selectableMode, selectVideo} = this.props;
    const {
      id,
      thumbnail,
      url,
      startTimestamp,
      size,
      durationSeconds,
      snippets,
    } = archive;
    const {loader} = this.state;
    return (
      <View style={[styles.cardArchive, style]}>
        {archive ? (
          <View style={styleApp.fullSize}>
            {this.buttonClose()}
            {this.buttonUpload()}
            {this.snippetIndicator()}
            <AsyncImage
              mainImage={thumbnail ? thumbnail : ''}
              style={styleApp.fullSize}
            />
            <View style={styles.resolution}>
              <Text
                style={[styleApp.title, {color: colors.white, fontSize: 12}]}>
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
                  {formatDuration(durationSeconds * 1000, true)}
                </Text>
                <Text
                  style={[
                    styleApp.textBold,
                    {color: colors.white, fontSize: 13},
                  ]}>
                  <FormatDate date={startTimestamp} />
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
                selectableMode ? selectVideo(id, !isSelected) : this.openVideo()
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
    const {archive, id, local} = this.props;
    return archive ? (
      <View>
        {this.cardArchive(archive)}
        {this.videoFullscreen()}
      </View>
    ) : (
      <View />
    );
  }
}

const styles = StyleSheet.create({
  viewText: {
    position: 'absolute',
    zIndex: 5,
  },
  resolution: {
    zIndex: 5,
    position: 'absolute',
    padding: 7,
    top: 0,
    right: 0,
    backgroundColor: colors.greenLight,
    opacity: 0.8,
    borderBottomLeftRadius: 5,
  },
});

const mapStateToProps = (state, props) => {
  return {
    archive: props.local
      ? props.parent
        ? state.localVideoLibrary.videoLibrary[props.parent].snippets[props.id]
        : state.localVideoLibrary.videoLibrary[props.id]
      : state.archives[props.id],
  };
};

export default connect(mapStateToProps)(CardArchive);
