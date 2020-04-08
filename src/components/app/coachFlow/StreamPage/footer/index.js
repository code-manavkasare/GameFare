import React, {Component} from 'react';
import {StyleSheet, Animated} from 'react-native';

import {connect} from 'react-redux';

import {width} from '../../../../style/sizes';
import {isUserAlone} from '../../../../functions/coach';

import BottomButtons from './components/BottomButtons';
import VideosView from './components/VideosView';
import {heightFooter, marginBottomApp} from '../../../../style/sizes';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  footer(session) {
    const {
      setState,
      translateYFooter,
      state,
      displayFooter,
      watchVideoRef,
      endCoachSession,
    } = this.props;
    if (!displayFooter) return null;
    const userIsAlone = isUserAlone(session);

    return (
      <Animated.View
        style={[styles.footer, {transform: [{translateY: translateYFooter}]}]}>
        {/* <CameraView
          styleCamera={{
            position: 'absolute',
            height: 200,
            width: 200,
            top: -200,
            zIndex: 200,
          }}
          onRef={(ref) => (this.cameraRef = ref)}
          cameraFront={true}
        /> */}
        <BottomButtons
          session={session}
          state={state}
          setState={setState}
          endCoachSession={endCoachSession}
          clickReview={(val) => this.pastSessionsRef.open(val)}
        />

        <VideosView
          session={session}
          setState={setState}
          onRef={(ref) => (this.pastSessionsRef = ref)}
          openVideo={(data) => watchVideoRef.open(data)}
        />
      </Animated.View>
    );
  }
  render() {
    const {session} = this.props;
    if (!session) return null;
    return this.footer(session);
  }
}

const styles = StyleSheet.create({
  footer: {
    bottom: 0,
    width: width,
    position: 'absolute',
    flex: 1,
    zIndex: 5,
  },
  cameraView: {
    height: 120,
    width: 90,
    borderRadius: 6,
    backgroundColor: 'red',
    position: 'absolute',
    overflow: 'hidden',
    top: -140,
    left: 20,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(Footer);
