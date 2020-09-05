import React, {Component} from 'react';
import {StyleSheet, Animated, View} from 'react-native';

import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import BottomButtons from './components/BottomButtons';
import VideosView from './components/VideosView';
import {native} from '../../../../../../animations/animations';
import styleApp from '../../../../../../style/style';

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  footer() {
    const {
      setState,
      coachSessionID,
      otPublisherRef,
      members,
      publishVideo,
      publishAudio,
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

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(Footer);
