import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';
import Loader from '../../../../../../../layout/loaders/Loader';

import CardArchive from './CardArchive';
import PastSessions from './PastSessions';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';
import {coachAction} from '../../../../../../../../actions/coachActions';
import {timing} from '../../../../../../../animations/animations';
import {
  timeout,
  isSomeoneSharingScreen,
  stopRecording,
} from '../../../../../../../functions/coach';

import {width} from '../../../../../../../style/sizes';
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
        Animated.timing(this.animateView, timing(1, 200)),
      ]).start();
    return Animated.parallel([
      Animated.timing(this.animateView, timing(0, 200)),
    ]).start();
  }
  async startLiveReview() {
    const {objectID} = this.props.session;
    await this.setState({loaderLiveReview: true});
    await stopRecording(objectID);
    await timeout(1000);

    this.setState({loaderLiveReview: false});
  }
  colInitialButtons() {
    const {loaderLiveReview} = this.state;
    const {openVideo, session} = this.props;
    const {sharedVideos} = session;

    const userSharingScreen = isSomeoneSharingScreen(session);
    const {archiving, recordingArchiveInfo} = session.tokbox;
    const displayButtonLiveSession = archiving && recordingArchiveInfo;

    const buttonVideoCurrentlyShared = (session, userSharingScreen) => {
      const {videoIDSharing} = session.members[userSharingScreen];
      const video = sharedVideos[videoIDSharing];
      return (
        <Row style={{paddingBottom: displayButtonLiveSession ? 5 : 0}}>
          <AsyncImage
            style={[
              styleApp.fullSize,
              {position: 'absolute', zIndez: 6, borderRadius: 5},
            ]}
            mainImage={video.thumbnail}
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
              console.log('onclick sur open live sharing video', {
                watchVideo: true,
                acrhiveID: videoIDSharing,
                ...video,
              });
              openVideo({
                watchVideo: true,
                acrhiveID: videoIDSharing,
                ...video,
              });
            }}
            color={colors.grey + '60'}
            onPressColor={colors.greyDark + '60'}
            style={styles.buttonLiveSession}
          />
        </Row>
      );
    };

    return (
      <Col style={{paddingLeft: 10}} key={0} size={15}>
        <View style={styles.colInitialButtons}>
          {userSharingScreen &&
            buttonVideoCurrentlyShared(session, userSharingScreen)}
          {displayButtonLiveSession && (
            <Row style={{paddingTop: !userSharingScreen ? 0 : 5}}>
              <ButtonColor
                view={() => {
                  return loaderLiveReview ? (
                    <Loader size={30} color="white" />
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
          )}
        </View>
      </Col>
    );
  }
  sessions() {
    const {heightView} = this.animationView();
    const {session, openVideo} = this.props;

    const {archiving, recordingArchiveInfo} = session.tokbox;
    const userSharingScreen = isSomeoneSharingScreen(session);

    const displayInitialButtons =
      userSharingScreen || (archiving && recordingArchiveInfo);

    let sessions = [];

    return (
      <Animated.View
        style={{
          height: heightView,
          width: '100%',
        }}>
        <Row>
          {displayInitialButtons && this.colInitialButtons()}
          <Col size={85}>
            <PastSessions openVideo={(videoData) => openVideo(videoData)} />
          </Col>
        </Row>
      </Animated.View>
    );
  }
  animationView() {
    const heightView = this.animateView.interpolate({
      inputRange: [0, 1],
      extrapolate: 'clamp',
      outputRange: [0, 170],
    });
    return {heightView};
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
