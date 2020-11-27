import React, {Component} from 'react';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import Button from '../../../layout/buttons/Button';
import colors from '../../../style/colors';
import {isSomeoneSharingScreen} from '../../../functions/coach';
import {
  playbackLinkedSelector,
  sessionSelector,
} from '../../../../store/selectors/sessions';

class ButtonShareVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkedPlayback: false,
    };
  }
  componentDidMount = () => {
    const {toggleLinkAllVideos, onRef, isPlaybackLinked} = this.props;
    if (onRef) {
      onRef(this);
    }
    if (toggleLinkAllVideos) {
      toggleLinkAllVideos(isPlaybackLinked);
    }
  };
  componentDidUpdate = (prevProps, prevState) => {
    const {toggleLinkAllVideos} = this.props;
    const {linkedPlayback} = this.state;
    if (linkedPlayback !== prevState.linkedPlayback) {
      toggleLinkAllVideos(linkedPlayback);
    }
  };
  static getDerivedStateFromProps(props, state) {
    if (
      props.isPlaybackLinked !== undefined &&
      props.isPlaybackLinked !== state.linkedPlayback
    ) {
      return {
        linkedPlayback: props.isPlaybackLinked,
      };
    } else {
      return {};
    }
  }
  toggleLinkAllVideos = async (link) => {
    const {session, toggleLinkAllVideos, coachSessionID} = this.props;
    this.setState({linkedPlayback: link});
    const personSharingScreen = isSomeoneSharingScreen(session);
    if (personSharingScreen) {
      const updates = {};
      updates[
        `coachSessions/${coachSessionID}/sharedVideos/isPlaybackLinked`
      ] = link;
      await database()
        .ref()
        .update(updates);
    }
    toggleLinkAllVideos(link);
  };
  styleButton = () => {
    return {
      height: 37,
      width: 160,
      marginTop: 10,
    };
  };
  buttonLink() {
    const style = this.styleButton();
    return (
      <Button
        backgroundColor="blur"
        onPressColor={colors.blue}
        styleButton={style}
        enabled={true}
        text="Link Playback"
        loader={false}
        textButton={{fontSize: 12, marginLeft: 25}}
        icon={{
          name: 'link',
          type: 'font',
          size: 16,
          color: 'white',
        }}
        click={() => this.toggleLinkAllVideos(true)}
      />
    );
  }

  buttonUnlink() {
    const style = this.styleButton();
    return (
      <Button
        backgroundColor="blur"
        onPressColor={colors.redLight}
        styleButton={style}
        enabled={true}
        textButton={{fontSize: 13, marginLeft: 25}}
        text="Unlink"
        loader={false}
        icon={{
          name: 'unlink',
          type: 'font',
          size: 16,
          color: 'white',
        }}
        click={() => this.toggleLinkAllVideos(false)}
      />
    );
  }
  button() {
    const {linkedPlayback} = this.state;
    if (linkedPlayback) {
      return this.buttonUnlink();
    } else {
      return this.buttonLink();
    }
  }

  render() {
    return this.button();
  }
}

const mapStateToProps = (state, props) => {
  return {
    session: sessionSelector(state, {id: props.coachSessionID}),
    isPlaybackLinked: playbackLinkedSelector(state, {id: props.coachSessionID}),
  };
};

export default connect(mapStateToProps)(ButtonShareVideo);
