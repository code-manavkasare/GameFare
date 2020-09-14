import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';
import {includes} from 'ramda';

import {Col, Row} from 'react-native-easy-grid';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {
  bindArchive,
  unbindArchive,
} from '../../../../../../../functions/archive';
import {openVideoPlayer} from '../../../../../../../functions/videoManagement';

import AllIcons from '../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {FormatDate, formatDuration} from '../../../../../../../functions/date';
import Loader from '../../../../../../../layout/loaders/Loader';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class CardArchive extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    local: PropTypes.bool,
    openVideo: PropTypes.func,
    style: PropTypes.object,
    selectableMode: PropTypes.bool,
    isSelected: PropTypes.bool,
    selectVideo: PropTypes.func,
    allowPlay: PropTypes.bool,
    showUploadProgress: PropTypes.bool,
  };
  static defaultProps = {
    selectableMode: false,
    isSelected: false,
    allowPlay: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {
    const {id, remoteArchives} = this.props;
    if (includes(id, remoteArchives)) {
      bindArchive(id);
    }
  }
  componentWillUnmount() {
    const {id, remoteArchives} = this.props;
    if (includes(id, remoteArchives)) {
      unbindArchive(id);
    }
  }
  placeholder() {
    const {style} = this.props;
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={[colors.off, colors.off2]}
        style={[styles.cardArchive, style]}
      />
    );
  }
  selectVideo = async (id, isSelected) => {
    const {selectVideo} = this.props;
    selectVideo(id, isSelected);
  };
  openVideo = async () => {
    const {archive, coachSessionID, videosToOpen} = this.props;
    const {url, id} = archive;
    if (url && url !== '') {
      openVideoPlayer({
        archives: videosToOpen ? videosToOpen.map((x) => x.id) : [id],
        open: true,
        coachSessionID,
      });
    }
  };
  playButton(archive) {
    const {isSelected, selectableMode, hidePlayIcon} = this.props;
    const {id} = archive;
    const buttonStyle = [
      {position: 'absolute', opacity: 0.9, bottom: 15, right: 15},
    ];
    return (
      <ButtonColor
        view={() => {
          return (
            !selectableMode &&
            !hidePlayIcon && (
              <AllIcons
                name="play"
                type="font"
                color={colors.white}
                size={12}
              />
            )
          );
        }}
        click={() =>
          selectableMode ? this.selectVideo(id, !isSelected) : this.openVideo()
        }
        color={'transparent'}
        onPressColor={colors.grey + '20'}
        style={buttonStyle}
      />
    );
  }
  localIndicator() {
    const {archive, showUploadProgress} = this.props;
    const {local, progress} = archive;
    const indicatorStyle = {
      position: 'absolute',
      height: 30,
      width: 30,
      bottom: 0,
      right: -5,
      zIndex: 20,
    };
    if (showUploadProgress && progress) {
      return (
        <View style={indicatorStyle}>
          <Progress.Circle
            color={colors.white}
            progress={progress}
            borderWidth={0}
            fill={colors.white}
            size={18}
          />
        </View>
      );
    } else if (local) {
      return (
        <View style={indicatorStyle}>
          <AllIcons
            name={'mobile-alt'}
            type="font"
            color={colors.greyLight}
            size={18}
          />
        </View>
      );
    } else {
      return null;
    }
  }
  linearGradient() {
    const lgStyle = {
      width: '100%',
      height: 80,
      bottom: 0,
      position: 'absolute',
    };
    return (
      <LinearGradient
        style={lgStyle}
        colors={[colors.black + '00', colors.black + '70']}
      />
    );
  }
  cardArchive(archive) {
    const {isSelected, style, selectableMode, showUploadProgress} = this.props;
    const {
      id,
      thumbnail,
      startTimestamp,
      durationSeconds,
      local,
      progress,
    } = archive;
    const {loader} = this.state;
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          selectableMode ? this.selectVideo(id, !isSelected) : this.openVideo()
        }>
        <View style={[styles.cardArchive, style]}>
          {local ? (
            <Image style={styleApp.fullSize} source={{uri: thumbnail}} />
          ) : (
            <AsyncImage
              style={styleApp.fullSize}
              mainImage={thumbnail ? thumbnail : ''}
            />
          )}
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
                    color={colors.white}
                    solid={isSelected ? true : false}
                  />
                ) : null}
              </Col>
            </Row>
          </View>

          {this.linearGradient()}
          {this.localIndicator()}

          <View
            pointerEvents="none"
            style={{...styles.viewText, bottom: 5, left: 10}}>
            <Col>
              <Text
                style={[
                  styleApp.textBold,
                  {color: colors.white, fontSize: 13},
                ]}>
                {formatDuration(durationSeconds * 1000, true)}
              </Text>
              <Text
                style={[
                  styleApp.textBold,
                  {color: colors.white, fontSize: 11},
                ]}>
                {showUploadProgress && progress ? (
                  'Uploading...'
                ) : (
                  <FormatDate date={startTimestamp} short />
                )}
              </Text>
            </Col>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  render() {
    const {archive} = this.props;
    if (!archive) {
      return this.placeholder();
    }
    return this.cardArchive(archive);
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
    archive: props.nativeArchive
      ? props.nativeArchive
      : state.archives[props.id],
    remoteArchives: Object.keys(state.user.infoUser.archivedStreams),
  };
};

export default connect(mapStateToProps)(CardArchive);
