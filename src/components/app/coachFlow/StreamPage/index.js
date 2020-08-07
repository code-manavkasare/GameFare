import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import Orientation from 'react-native-orientation-locker';
import {Row, Col} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes, {
  heightFooter,
  heightHeaderHome,
  marginBottomApp,
} from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import ButtonColor from '../../../layout/Views/Button';

import LogoutView from './components/LogoutView';
import PermissionView from './components/PermissionView';

import ListStreams from './components/ListStreams';
import Loader from '../../../layout/loaders/Loader';
import HeaderListStream from './components/HeaderListStream';
import {sessionOpening} from '../../../functions/coach';

const {height} = Dimensions.get('screen');

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
    const {navigation} = this.props;
    const {params} = this.props.route;
    if (params?.objectID) this.openSession(params.objectID);
    this.focusListener = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
  };
  componentDidUpdate = (prevProps) => {
    const {params} = this.props.route;
    if (prevProps.route.params?.date !== params?.date && params?.date)
      this.openSession(params.objectID);
  };
  openSession = async (objectID) => {
    let session = await database()
      .ref(`coachSessions/${objectID}`)
      .once('value');
    session = session.val();
    sessionOpening(session);
  };
  viewLoader = () => {
    return (
      <View style={[{height: 120}, styleApp.center]}>
        <Loader size={55} color={colors.primary} />
      </View>
    );
  };
  StreamTab = () => {
    const {permissionsCamera, initialLoader} = this.state;

    return (
      <View>
        {initialLoader && this.viewLoader()}

        {!permissionsCamera ? (
          <PermissionView
            initialLoader={initialLoader}
            setState={this.setState.bind(this)}
          />
        ) : null}
        <ListStreams
          permissionsCamera={permissionsCamera}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          newSession={() => this.HeaderRef.newSession()}
        />
      </View>
    );
  };

  render() {
    const {permissionsCamera} = this.state;
    const {userConnected} = this.props;
    if (!userConnected) return <LogoutView />;
    return (
      <View style={styleApp.stylePage}>
        <HeaderListStream
          userConnected={userConnected}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          hideButtonNewSession={!userConnected || !permissionsCamera}
          onRef={(ref) => (this.HeaderRef = ref)}
        />

        <View
          style={{
            marginTop: sizes.heightHeaderHome + sizes.marginTopApp,
            
          }}>
          {this.StreamTab()}
        </View>
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
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(StreamTab);
