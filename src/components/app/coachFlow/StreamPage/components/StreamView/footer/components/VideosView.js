import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import PastSessions from './PastSessions';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';
import {coachAction} from '../../../../../../../../actions/coachActions';
import {native} from '../../../../../../../animations/animations';
import {
  timeout,
  isSomeoneSharingScreen,
} from '../../../../../../../functions/coach';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class VideoViews extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaderLiveReview: false,
    };
    this.animateView = new Animated.Value(0);
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  open(val) {
    if (val)
      return Animated.parallel([
        Animated.timing(this.animateView, native(1, 200)),
      ]).start();
    return Animated.parallel([
      Animated.timing(this.animateView, native(0, 200)),
    ]).start();
  }
  async startLiveReview() {}
  colInitialButtons() {
    const buttonVideoCurrentlyShared = () => {
      const {videoBeingShared, openVideo} = this.props;
      return (
        <Row style={{paddingBottom: 0}}>
          <AsyncImage
            style={[
              styleApp.fullSize,
              {position: 'absolute', zIndez: 6, borderRadius: 5},
            ]}
            mainImage={videoBeingShared.thumbnail}
          />
          <ButtonColor
            view={() => {
              return (
                <View style={styles.redViewVideoButton}>
                  <AllIcons
                    name="dot-circle"
                    color={colors.white}
                    size={20}
                    type="font"
                  />
                </View>
              );
            }}
            click={() => {
              openVideo({
                watchVideo: true,
                acrhiveID: videoBeingShared.id,
                ...videoBeingShared,
              });
            }}
            color={colors.grey + '60'}
            onPressColor={colors.greyDark + '60'}
            style={styles.buttonLiveSession}
          />
        </Row>
      );
    };
    const {personSharingScreen} = this.props;
    return (
      <Col style={{paddingLeft: 10}} key={0} size={15}>
        <View style={styles.colInitialButtons}>
          {personSharingScreen && buttonVideoCurrentlyShared()}
          {/* {displayButtonLiveSession && (
            <Row style={{paddingTop: !userSharingScreen ? 0 : 5}}>
              <ButtonColor
                view={() => {
                  return loaderLiveReview ? (
                    <Loader size={30} color={colors.white} />
                  ) : (
                    <View style={styleApp.center}>
                      <AllIcons
                        name="highlighter"
                        color={colors.white}
                        size={17}
                        type="font"
                      />
                      <Text
                        style={[
                          styleApp.text,
                          {color: colors.white, marginTop: 5, fontSize: 12},
                        ]}>
                        Live review
                      </Text>
                    </View>
                  );
                }}
                click={() => this.startLiveReview()}
                color={colors.primary + '60'}
                onPressColor={colors.primaryLight + '60'}
                style={styles.buttonLiveSession}
              />
            </Row>
          )} */}
        </View>
      </Col>
    );
  }
  sessions() {
    const {translateY} = this.animationView();
    const {openVideo,personSharingScreen} = this.props;

    const styleViewVideos = {
      transform: [{translateY}],
      height: 170,
      width: '100%',
    };
    return (
      <Animated.View style={styleViewVideos}>
        <Row>
          {personSharingScreen && this.colInitialButtons()}
          <Col size={85}>
            <PastSessions openVideo={(videoData) => openVideo(videoData)} />
          </Col>
        </Row>
      </Animated.View>
    );
  }
  animationView() {
    const translateY = this.animateView.interpolate({
      inputRange: [0, 1],
      extrapolate: 'clamp',
      outputRange: [170, 0],
    });
    return {translateY};
  }
  render() {
    return this.sessions();
  }
}

const styles = StyleSheet.create({
  colInitialButtons: {
    height: 130,
    width: '95%',
    marginRight: 20,
  },
  buttonLiveSession: {
    height: '100%',
    width: '100%',
    marginRight: 20,
    borderRadius: 4,
  },
  redViewVideoButton: {
    ...styleApp.center,
    backgroundColor: colors.red,
    height: 40,
    width: 40,
    //borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    archivedStreams: state.user.infoUser.archivedStreams,
    coach: state.coach,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(VideoViews);
