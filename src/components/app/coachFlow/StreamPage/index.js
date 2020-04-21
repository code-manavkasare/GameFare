import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  Image,
} from 'react-native';
import {connect} from 'react-redux';

import coachAction from '../../../../actions/coachActions';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {
  marginTopApp,
  heightFooter,
  offsetBottomHeaderStream,
} from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

import LogoutView from './components/LogoutView';
import PermissionView from './components/PermissionView';

import ListStreams from './components/ListStreams';
import HeaderListStream from './components/HeaderListStream';

class StreamTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionsCamera: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  StreamTab = (currentHeight) => {
    const {permissionsCamera} = this.state;
    let {userConnected} = this.props;
    console.log('render StreamTab', this.state);
    return (
      <View style={[styles.containerTabPage, {minHeight: currentHeight - 100}]}>
        <View style={{height: offsetBottomHeaderStream / 2}} />
        <HeaderListStream
          userConnected={userConnected}
          hideButtonNewSession={!userConnected || !permissionsCamera}
        />
        <View style={{height: offsetBottomHeaderStream / 2}} />
        {!userConnected ? (
          <LogoutView />
        ) : !permissionsCamera ? (
          <PermissionView setState={this.setState.bind(this)} />
        ) : (
          <ListStreams AnimatedHeaderValue={this.AnimatedHeaderValue} />
        )}
      </View>
    );
  };

  render() {
    const {scrollDisabled, currentScreenSize} = this.props;

    const {currentHeight, currentWidth, portrait} = currentScreenSize;
    console.log('getCurrentScreenSize', {currentHeight, currentWidth});
    return (
      <View style={styleApp.stylePage}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.StreamTab(currentHeight)}
          marginBottomScrollView={0}
          marginTop={portrait ? -marginTopApp : 0}
          scrollDisabled={scrollDisabled}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTabPage: {
    ...styleApp.fullSize,
    paddingTop: marginTopApp,
  },
  titlePage: {
    ...styleApp.title,
    color: colors.title,
    marginBottom: 10,
    marginLeft: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    currentScreenSize: state.layout.currentScreenSize,
    scrollDisabled: state.coach.sessionInfo.scrollDisabled,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(StreamTab);
