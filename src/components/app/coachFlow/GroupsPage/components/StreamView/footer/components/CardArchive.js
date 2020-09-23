import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

import {Col, Row} from 'react-native-easy-grid';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import * as Progress from 'react-native-progress';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {openVideoPlayer} from '../../../../../../../functions/videoManagement';

import AllIcons from '../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {FormatDate, formatDuration} from '../../../../../../../functions/date';
import Loader from '../../../../../../../layout/loaders/Loader';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

import {archivesAction} from '../../../../../../../../actions/archivesActions';

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
      bound: false,
    };
  }

  componentDidMount() {
    const {archive} = this.props;
    if (!archive || !archive.local) {
      this.bindArchive();
    }
  }

  componentDidUpdate() {
    const {archive} = this.props;
    const {bound} = this.state;
    if ((!archive || !archive.local) && !bound) {
      this.bindArchive();
    }
  }

  componentWillUnmount() {
    this.unbindArchive();
  }

  bindArchive() {
    const {id, archivesAction} = this.props;
    this.setState({bound: true});
    archivesAction('bindArchive', id);
  }

  unbindArchive() {
    const {id, archivesAction} = this.props;
    archivesAction('unbindArchive', id);
    this.setState({bound: false});
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
  buttonDismiss = () => {
    const {clickButtonDismiss} = this.props;
    if (!clickButtonDismiss) return null;
    const styleButton = {
      position: 'absolute',
      top: -10,
      right: 5,
      zIndex: 40,
      ...styleApp.shade,
      // backgroundColor: colors.red + '0',
      ...styleApp.center,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.grey,
      height: 25,
      width: 25,
    };
    return (
      <ButtonColor
        view={() => {
          return (
            <AllIcons name={'minus'} type="font" size={12} color={colors.red} />
          );
        }}
        style={[styleButton, styleApp.shadowWhite]}
        click={() => clickButtonDismiss()}
        color={colors.white}
        onPressColor={colors.off}
      />
    );
  };
  cardArchive(archive) {
    const {
      isSelected,
      hideInformation,
      style,
      selectableMode,
      showUploadProgress,
      unclickable,
    } = this.props;
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
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          unclickable
            ? true
            : selectableMode
            ? this.selectVideo(id, !isSelected)
            : this.openVideo()
        }>
        {this.buttonDismiss()}
        <View style={[styles.cardArchive, style]}>
          {local ? (
            <Image style={styleApp.fullSize} source={{uri: thumbnail}} />
          ) : (
            <AsyncImage
              style={{...styleApp.fullSize}}
              mainImage={thumbnail ? thumbnail : ''}
            />
          )}
          {selectableMode && (
            <View
              pointerEvents="none"
              style={{
                ...styles.viewText,
                ...styleApp.fullSize,
                backgroundColor: isSelected
                  ? colors.grey + '30'
                  : 'transparent',
              }}>
              <Row>
                <Col style={styleApp.center}>
                  {loader ? (
                    <Loader size={25} color={colors.white} />
                  ) : isSelected ? (
                    <AllIcons
                      name={'check'}
                      type="font"
                      size={23}
                      color={colors.white}
                      solid={isSelected ? true : false}
                    />
                  ) : selectableMode ? (
                    <AllIcons
                      name={'circle'}
                      type="font"
                      size={23}
                      color={colors.white}
                      solid={isSelected ? true : false}
                    />
                  ) : null}
                </Col>
              </Row>
            </View>
          )}

          {!hideInformation && this.linearGradient()}
          {this.localIndicator()}

          {!hideInformation && (
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
          )}
        </View>
      </TouchableOpacity>
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
    remoteArchives: state.user?.infoUser?.archivedStreams
      ? Object.keys(state.user.infoUser.archivedStreams)
      : [],
  };
};

export default connect(
  mapStateToProps,
  {archivesAction},
)(CardArchive);
