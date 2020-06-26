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
  heightHeaderHome,
  offsetBottomHeaderStream,
} from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

import LogoutView from './components/LogoutView';
import PermissionView from './components/PermissionView';

import ListStreams from './components/ListStreams';
import Loader from '../../../layout/loaders/Loader';
import {timeout} from '../../../functions/coach';
import HeaderListStream from './components/HeaderListStream';
import ButtonNotification from '../../elementsUser/elementsProfile/ButtonNotification';

class StreamTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionsCamera: false,
      initialLoader: true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.openSession = this.openSession.bind(this);
  }
  componentDidMount = () => {
    const {params} = this.props.route;
    if (params?.objectID) this.openSession(params.objectID);
  };
  componentDidUpdate = (prevProps, prevState) => {
    const {params} = this.props.route;
    if (prevProps.route.params?.date !== params?.date && params?.date)
      this.openSession(params.objectID);
  };
  openSession = async (objectID) => {
    this.listStreamRef.openSession(objectID);
  };
  viewLoader = () => {
    return (
      <View style={[{height: 120}, styleApp.center]}>
        <Loader size={55} color={colors.primary} />
      </View>
    );
  };
  StreamTab = (currentHeight) => {
    const {permissionsCamera, initialLoader} = this.state;
    const {userConnected} = this.props;
    return (
      <View style={[styles.containerTabPage, {minHeight: currentHeight - 100}]}>
        {userConnected && <ButtonNotification displayBeforeLoader={true} />}
        {userConnected && initialLoader && this.viewLoader()}

        {!userConnected ? (
          <LogoutView />
        ) : !permissionsCamera ? (
          <PermissionView
            initialLoader={initialLoader}
            setState={this.setState.bind(this)}
          />
        ) : null}
        <ListStreams
          permissionsCamera={permissionsCamera}
          onRef={(ref) => (this.listStreamRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
        />
      </View>
    );
  };

  render() {
    const {permissionsCamera} = this.state;
    const {sessionInfo, currentScreenSize, userConnected} = this.props;
    const {scrollDisabled} = sessionInfo;
    const {currentHeight, portrait} = currentScreenSize;
    return (
      <View style={styleApp.stylePage}>
        <HeaderListStream
          userConnected={userConnected}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          hideButtonNewSession={!userConnected || !permissionsCamera}
          closeSession={async (currentSessionID) => {
            return this.listStreamRef.closeSession(currentSessionID);
          }}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.StreamTab(currentHeight)}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
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
    paddingTop: 10,
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
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(StreamTab);
