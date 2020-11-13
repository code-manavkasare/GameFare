import React, {Component} from 'react';
import {StyleSheet, Animated, View} from 'react-native';

import BottomButtons from './components/BottomButtons';
import styleApp from '../../../../../../style/style';

export default class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  footer() {
    const {
      setState,
      coachSessionID,
      otPublisherRef,
      members,
      publishVideo,
      publishAudio,
      getCameraPosition,
    } = this.props;
    return (
      <Animated.View style={[styles.footer]}>
        <BottomButtons
          setState={setState}
          onRef={(ref) => (this.bottomButtonsRef = ref)}
          otPublisherRef={otPublisherRef}
          members={members}
          publishVideo={publishVideo}
          publishAudio={publishAudio}
          coachSessionID={coachSessionID}
          getCameraPosition={getCameraPosition}
        />
      </Animated.View>
    );
  }
  render() {
    return this.footer();
  }
}

const styles = StyleSheet.create({
  footer: {
    ...styleApp.center,
    bottom: 90,
    width: '100%',
    position: 'absolute',
    flex: 1,
    zIndex: 11,
  },
});
