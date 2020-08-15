import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {navigate} from '../../../../../../../../../NavigationService';
import {
  bindArchive,
  unbindArchive,
} from '../../../../../../../functions/archive';

import AllIcons from '../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {FormatDate, formatDuration} from '../../../../../../../functions/date';
import {openVideoPlayer} from '../../../../../../../functions/videoManagement';
import {resolutionP} from '../../../../../../../functions/pictures';
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
    const {local, id} = this.props;
    if (!local) bindArchive(id);
  }
  componentWillUnmount() {
    const {id, local} = this.props;
    if (!local) unbindArchive(id);
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
    const {openVideo, allowPlay} = this.props;
    const {archive} = this.props;
    const {url, id, thumbnail} = archive;
    console.log('open video page', archive);
    if (!openVideo) return navigate('VideoPlayerPage', {archive});
    if (url !== '') openVideo({url, thumbnail});
  };
  cloudIndicator() {
    const {local, url} = this.props.archive;
    if (!local) {
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
          <AllIcons
            name={url === '' ? 'upload' : 'cloud'}
            type="font"
            color={colors.white}
            size={15}
          />
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
      startTimestamp,
      size,
      durationSeconds,
      local,
    } = archive;
    const {loader} = this.state;
    return (
      <View style={[styles.cardArchive, style]}>
        {local ? (
          <Image style={styleApp.fullSize} source={{uri: thumbnail}} />
        ) : (
          <AsyncImage
            style={styleApp.fullSize}
            mainImage={thumbnail ? thumbnail : ''}
          />
        )}
        {this.cloudIndicator()}
        {/* <View style={styles.resolution}>
          <Text style={[styleApp.title, {color: colors.white, fontSize: 12}]}>
            {resolutionP(size)}
          </Text>
        </View> */}
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

        <View
          pointerEvents="none"
          style={{...styles.viewText, bottom: 5, left: 10}}>
          <Col>
            <Text
              style={[styleApp.textBold, {color: colors.white, fontSize: 14}]}>
              {formatDuration(durationSeconds * 1000, true)}
            </Text>
            {/* <Text
              style={[styleApp.textBold, {color: colors.white, fontSize: 13}]}>
              <FormatDate date={startTimestamp} />
            </Text> */}
          </Col>
        </View>

        <ButtonColor
          view={() => {
            return (
              !selectableMode && (
                <AllIcons
                  name="play"
                  type="font"
                  color={colors.white}
                  size={18}
                />
              )
            );
          }}
          click={() =>
            selectableMode
              ? selectVideo(id, !isSelected, local)
              : this.openVideo()
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
    );
  }
  render() {
    const {archive} = this.props;

    if (!archive) return this.placeholder();

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
      : props.local
      ? state.localVideoLibrary.videoLibrary[props.id]
      : state.archives[props.id],
  };
};

export default connect(mapStateToProps)(CardArchive);
