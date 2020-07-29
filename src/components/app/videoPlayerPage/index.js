import React, {Component} from 'react';
import {View, Text, Button, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import VideoPlayer from '../coachFlow/VideoPlayer/index';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {openVideoPlayer} from '../../functions/videoManagement';

class VideoPlayerPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      archive: this.props.route.params.archive,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.route.params.archive, state.archive))
      return {
        archive: props.route.params.archive,
      };
    return {};
  }
  watchVideoView() {
    const {userID, navigation} = this.props;
    const {goBack} = navigation;
    const {archive} = this.state;
    const {url, id, thumbnail} = archive;
    return (
      <View style={[styleApp.stylePage, {backgroundColor: colors.title}]}>
        <HeaderBackButton
          inputRange={[5, 10]}
          colorLoader={'white'}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          colorIcon1={colors.white}
          sizeLoader={40}
          sizeIcon1={16}
          onPressColorIcon1={colors.greyDark + '70'}
          nobackgroundColorIcon1={false}
          backgroundColorIcon1={colors.title + '70'}
          initialBorderColorIcon={'transparent'}
          icon1="arrow-left"
          typeIcon1="font"
          // icon2={'gesture'}
          backgroundColorIcon2={colors.title + '70'}
          backgroundColorIconOffset={colors.title + '70'}
          clickButton2={() => this.setState({drawingOpen: true})}
          sizeIcon2={24}
          typeIcon2="mat"
          colorIcon2={colors.white}
          colorIconOffset={colors.white}
          initialTitleOpacity={1}
          clickButton1={async () => {
            await this.videoPlayerRef.togglePlayPause(true);
            openVideoPlayer({}, false, () => goBack());
          }}
          // iconOffset="open-with"
          // colorIconOffset={colors.title}
          typeIconOffset="mat"
          sizeIconOffset={25}
          clickButtonOffset={() => this.setState({drawingOpen: false})}
        />

        <VideoPlayer
          source={url}
          // paused={video.paused}
          // playRate={video.playRate}
          index={id}
          resizeMode="contain"
          userID={userID}
          // currentTime={video.currentTime}
          // userIDLastUpdate={video.userIDLastUpdate}
          setSizeVideo={(sizeVideo) => {
            this.setState({sizeVideo: sizeVideo});
          }}
          noUpdateInCloud={true}
          hideFullScreenButton={true}
          placeHolderImg={thumbnail}
          // propsComponentOnTop={videoBeingShared.drawings}
          setScale={(val) => true}
          styleContainerVideo={{...styleApp.center, ...styleApp.fullSize}}
          styleVideo={styleApp.fullSize}
          // updateOnProgress={userID === personSharingScreen}

          onRef={(ref) => (this.videoPlayerRef = ref)}
        />
      </View>
    );
  }
  render() {
    return this.watchVideoView();
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(VideoPlayerPage);
