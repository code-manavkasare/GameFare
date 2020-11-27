import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

import {Col, Row} from 'react-native-easy-grid';
import * as Progress from 'react-native-progress';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {navigate} from '../../../../../../../../../NavigationService';
import {openVideoPlayer} from '../../../../../../../functions/videoManagement';

import AllIcons from '../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {FormatDate, formatDuration} from '../../../../../../../functions/date';
import Loader from '../../../../../../../layout/loaders/Loader';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';
import {logMixpanel} from '../../../../../../../functions/logs';
import {bindArchive} from '../../../../../../../database/firebase/bindings';

import {userIDSelector} from '../../../../../../../../store/selectors/user';
import {archiveSelector} from '../../../../../../../../store/selectors/archives';
import {boolShouldComponentUpdate} from '../../../../../../../functions/redux';

class CardArchive extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    local: PropTypes.bool,
    openVideo: PropTypes.func,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    selectableMode: PropTypes.bool,
    isSelected: PropTypes.bool,
    selectVideo: PropTypes.func,
    allowPlay: PropTypes.bool,
  };
  static defaultProps = {
    selectableMode: false,
    allowPlay: true,
  };
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      isSelected: false,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      const {id, archive} = this.props;
      if (!archive || !archive?.local) {
        bindArchive(id);
      }
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardArchive',
    });
  }

  static getDerivedStateFromProps(props, state) {
    let {archive, isSelected} = props;

    const {archiveFromCameraroll, userID} = props;

    if (archiveFromCameraroll) {
      archive = archiveFromCameraroll;
    }
    if (!archive) {
      return {};
    }

    const {progress, isBinded, url, sourceUser} = archive;
    const videoUnavailable =
      isBinded && !url && !progress && !archiveFromCameraroll;
    const currentlyUploading =
      (!url || url === '') &&
      sourceUser !== userID &&
      progress &&
      !archiveFromCameraroll;
    if (isSelected === undefined) {
      isSelected = state.isSelected;
    }
    return {
      archive,
      videoUnavailable,
      currentlyUploading,
      isSelected,
    };
  }

  componentDidUpdate(prevProps) {
    const {id, archive} = this.props;
    const {archive: prevArchive} = prevProps;
    if ((prevArchive?.local && !archive?.local) || (prevArchive && !archive)) {
      bindArchive(id);
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
  openVideo = async () => {
    const {coachSessionID, videosToOpen, disableClick, archive} = this.props;
    const {url, id} = archive;
    if (url && url !== '' && !disableClick) {
      logMixpanel({
        label: 'Click video ' + coachSessionID,
        params: {videos: videosToOpen ? videosToOpen.map((x) => x.id) : [id]},
      });
      openVideoPlayer({
        archives: videosToOpen ? videosToOpen.map((x) => x.id) : [id],
        open: true,
        coachSessionID,
      });
    }
  };

  labelIndicator() {
    const {archive, currentlyUploading} = this.state;
    const {local, progress} = archive;

    if (currentlyUploading) {
      return <Loader size={25} color={colors.white} />;
    } else if (progress) {
      return (
        <Progress.Circle
          color={colors.white}
          progress={progress ? progress : 0}
          borderWidth={0}
          size={18}
        />
      );
    } else if (local) {
      return (
        <AllIcons
          name={'mobile-alt'}
          type="font"
          color={colors.white}
          size={18}
          style={styleApp.shadowIcon}
        />
      );
    } else {
      return null;
    }
  }
  linearGradient() {
    return (
      <LinearGradient
        style={styles.linearGradient}
        colors={[colors.black + '00', colors.black + '70']}
      />
    );
  }

  buttonDismiss = () => {
    const {clickButtonDismiss} = this.props;
    return clickButtonDismiss ? (
      <ButtonColor
        view={() => {
          return (
            <AllIcons name={'minus'} type="font" size={12} color={colors.red} />
          );
        }}
        style={styles.buttonDismiss}
        click={() => clickButtonDismiss()}
        color={colors.white}
        onPressColor={colors.off}
      />
    ) : null;
  };

  rowIcons = () => {
    let {archive} = this.state;
    const {recordedActions, url} = archive;
    return (
      <View style={styles.rowIcons}>
        <Row>
          <Col size={15} style={styleApp.center}>
            {recordedActions ? (
              <AllIcons
                name={'microphone-alt'}
                type="font"
                size={17}
                color={colors.white}
                style={styleApp.shadowIcon}
              />
            ) : url ? (
              <AllIcons
                name={'play'}
                type="font"
                size={10}
                color={colors.white}
                style={styleApp.shadowIcon}
              />
            ) : null}
          </Col>
          <Col size={70} />
          <Col size={15} style={styleApp.center3}>
            {this.labelIndicator()}
          </Col>
        </Row>
      </View>
    );
  };

  cardArchiveImage = () => {
    const {archive} = this.state;
    const {archiveFromCameraroll} = this.props;

    if (archiveFromCameraroll) {
      const {url} = archiveFromCameraroll;
      return <Image style={styleApp.fullSize} source={{uri: url}} />;
    }

    const {thumbnail, local} = archive;
    if (local && thumbnail) {
      return <AsyncImage style={styleApp.fullSize} mainImage={thumbnail} />;
    }

    return (
      <AsyncImage
        style={{...styleApp.fullSize}}
        mainImage={thumbnail ? thumbnail : ''}
      />
    );
  };

  infoRow = () => {
    const {archive, videoUnavailable} = this.state;
    const {startTimestamp, durationSeconds, progress} = archive;
    return (
      <View pointerEvents="none" style={styles.infoRow}>
        <Col>
          <Text style={styles.durationText}>
            {videoUnavailable
              ? null
              : formatDuration(durationSeconds * 1000, true)}
          </Text>
          <Text style={styles.dateText}>
            {videoUnavailable ? null : progress ? (
              'Uploading...'
            ) : (
              <FormatDate date={startTimestamp} short />
            )}
          </Text>
        </Col>
      </View>
    );
  };

  viewNoVideo = () => {
    return (
      <View style={styles.viewNoVideo}>
        <Row>
          <Col size={15} style={styleApp.center}>
            <AllIcons
              name={'campground'}
              type="font"
              size={16}
              color={colors.white}
            />
            <Text style={styles.unavailableText}>Unavailable</Text>
          </Col>
        </Row>
      </View>
    );
  };

  onPress = () => {
    const {
      archive,
      videoUnavailable,
      currentlyUploading,
      isSelected,
    } = this.state;
    const {id, localIdentifier} = archive;
    const {selectableMode, unclickable, selectVideo} = this.props;
    if (unclickable) {
      return;
    } else if (selectableMode) {
      this.setState({isSelected: !isSelected});
      selectVideo({
        id,
        isSelected: !isSelected,
        localIdentifier,
        playable: !videoUnavailable && !currentlyUploading,
      });
    } else if (videoUnavailable) {
      navigate('Alert', {
        title: 'This video is unavailable.',
        subtitle: 'There was an issue accessing this video.',
        textButton: 'Got it!',
        close: true,
      });
    } else if (currentlyUploading) {
      navigate('Alert', {
        title: 'This video is currently being uploaded.',
        subtitle: "We'll notify you when it's ready!",
        textButton: 'Got it!',
        close: true,
      });
    } else {
      this.openVideo(archive);
    }
  };

  selectionOverlay() {
    const {loader, isSelected} = this.state;
    const selectionOverlayStyle = {
      ...styles.selectionOverlay,
      backgroundColor: isSelected ? colors.grey + '30' : 'transparent',
    };
    return (
      <View pointerEvents="none" style={selectionOverlayStyle}>
        <Row>
          <Col style={styleApp.center6}>
            {loader ? (
              <Loader size={25} color={colors.white} />
            ) : isSelected ? (
              <View style={styles.isSelected}>
                <AllIcons
                  name={'check'}
                  type="font"
                  size={14}
                  color={colors.white}
                />
              </View>
            ) : (
              <AllIcons
                name={'circle'}
                type="font"
                size={23}
                color={colors.white}
                solid={isSelected ? true : false}
              />
            )}
          </Col>
        </Row>
      </View>
    );
  }

  cardArchive() {
    let {archive, videoUnavailable} = this.state;
    const {hideInformation, style, selectableMode, disableClick} = this.props;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        pointerEvents={disableClick ? 'none' : 'auto'}
        onPress={this.onPress}>
        {this.buttonDismiss()}
        <View style={[styles.cardArchive, style]}>
          {this.cardArchiveImage()}
          {videoUnavailable ? this.viewNoVideo() : null}
          {!hideInformation ? this.rowIcons(archive) : null}
          {!hideInformation ? this.linearGradient() : null}
          {!hideInformation ? this.infoRow() : null}
          {selectableMode ? this.selectionOverlay() : null}
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    const {archive} = this.state;
    if (!archive) {
      return this.placeholder();
    }
    return this.cardArchive();
  }
}

const styles = StyleSheet.create({
  cardArchive: {
    backgroundColor: colors.greyDarker,
  },
  linearGradient: {
    width: '100%',
    height: 80,
    bottom: 0,
    position: 'absolute',
  },
  infoRow: {
    position: 'absolute',
    zIndex: 5,
    bottom: 5,
    left: 10,
  },
  durationText: {
    ...styleApp.textBold,
    color: colors.white,
    fontSize: 13,
  },
  dateText: {
    ...styleApp.textBold,
    color: colors.white,
    fontSize: 11,
  },
  viewNoVideo: {
    position: 'absolute',
    padding: 15,
    height: '100%',
    zIndex: 230,
    width: '100%',
  },
  unavailableText: {
    ...styleApp.textBold,
    marginTop: 10,
    color: colors.white,
    fontSize: 14,
  },
  selectionOverlay: {
    ...styleApp.fullSize,
    position: 'absolute',
    zIndex: 5,
    padding: 10,
  },
  isSelected: {
    ...styleApp.center,
    height: 30,
    width: 30,
    backgroundColor: colors.primary,
    borderRadius: 15,
  },
  rowIcons: {
    position: 'absolute',
    padding: 15,
    height: 50,
    zIndex: 200,
    width: '100%',
  },
  buttonDismiss: {
    position: 'absolute',
    top: -5,
    right: 5,
    zIndex: 40,
    ...styleApp.shade,
    ...styleApp.center,
    ...styleApp.shadowWhite,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    height: 30,
    width: 30,
  },
});

const mapStateToProps = (state, props) => {
  return {
    userID: userIDSelector(state),
    archive: archiveSelector(state, props),
  };
};

export default connect(
  mapStateToProps,
  {},
)(CardArchive);
