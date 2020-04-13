import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {marginTopApp, heightFooter} from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import Button from '../../../layout/buttons/Button';
import LogoutView from './components/LogoutView';
import PermissionView from './components/PermissionView';

import {timeout, createCoachSession} from '../../../functions/coach';
import {heightCardSession} from '../../../style/sizes';

import StreamView from './components/StreamView/index';

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      permissionsCamera: false,
    };
    this.itemsRef = [];
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    const {route, userConnected} = this.props;
    if (!route.params) return;
    if (route.params.openSession) {
      if (!userConnected) return this.resetOpenSession();
      await this.openSession(route.params.objectID, route.key);
    }
    return this.resetOpenSession();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState !== this.state) return true;
    if (nextProps.route.params !== this.props.route.params) return true;
    if (nextProps.userConnected !== this.props.userConnected) return true;
    if (nextProps.coachSessions !== this.props.coachSessions) return true;
    return false;
  }
  async componentDidUpdate(prevProps, prevState) {
    const {route, userConnected} = this.props;

    if (!route.params) return;
    if (
      route.params.openSession &&
      prevProps.route.params.openSession !== route.params.openSession
    ) {
      if (!userConnected) return this.resetOpenSession();
      await this.openSession(route.params.objectID, route.key);
    }
  }
  async openSession(objectID) {
    this.itemsRef[objectID].open(true);
  }

  async resetOpenSession() {
    const {navigation} = this.props;
    await timeout(300);
    navigation.setParams({openSession: false, objectID: false});
  }
  listStreams(arraySessions) {
    const {navigation, route} = this.props;
    let objectID = false;
    if (route.params) objectID = route.params.objectID;

    return (
      <View style={styles.rowButtons}>
        {arraySessions.map((coachSession, i) => {
          const coachSessionID = coachSession.id;
          const zIndexViewStream = objectID === coachSessionID ? 2 : 1;
          return (
            <View
              style={[
                styles.colButtons,
                styleApp.center2,
                {zIndex: zIndexViewStream},
              ]}>
              <StreamView
                key={i}
                index={i}
                offsetScrollView={marginTopApp + 80 + 70}
                heightCardSession={heightCardSession}
                navigation={navigation}
                route={route}
                coachSessionID={coachSessionID}
                getScrollY={() => {
                  return this.AnimatedHeaderValue._value;
                }}
                closeCurrentSession={async (currentSessionID) => {
                  return this.itemsRef[currentSessionID].endCoachSession();
                }}
                setState={this.setState.bind(this)}
                onRef={(ref) => (this.itemsRef[coachSessionID] = ref)}
              />
            </View>
          );
        })}
      </View>
    );
  }
  buttonNewSession() {
    const {userConnected, navigation} = this.props;
    const {loader} = this.state;
    return (
      <View style={styles.viewButtonNewSession}>
        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          text="New session"
          loader={loader}
          click={async () => {
            if (!userConnected) return navigation.navigate('SignIn');
            const {userID, infoUser} = this.props;
            await this.setState({loader: true});
            await createCoachSession({
              id: userID,
              info: infoUser,
            });
            this.setState({loader: false});
          }}
        />
      </View>
    );
  }

  StreamTab() {
    const {permissionsCamera} = this.state;
    let {coachSessions, userConnected} = this.props;
    if (!coachSessions) coachSessions = {};

    console.log('coachSessionscoachSessionscoachSessions', coachSessions);
    coachSessions = Object.values(coachSessions)
      .sort(function(a, b) {
        return a.timestamp - b.timestamp;
      })
      .reverse();
    return (
      <View style={styles.containerTabPage}>
        <Text style={styles.titlePage}>Stream your performance</Text>
        {userConnected && permissionsCamera && this.buttonNewSession()}
        {!userConnected ? (
          <LogoutView />
        ) : !permissionsCamera ? (
          <PermissionView setState={this.setState.bind(this)} />
        ) : (
          this.listStreams(coachSessions)
        )}
      </View>
    );
  }
  render() {
    const {route} = this.props;
    let openSession = false;
    if (route.params) openSession = route.params.openSession;
    return (
      <View style={[styleApp.page, {backgroundColor: colors.title}]}>
        {/* <View
          style={{
            height: marginTopApp,
            position: 'absolute',
            zIndex: 1,
            top: 0,
            width: width,
           //  backgroundColor: colors.red,
          }}
        /> */}
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.StreamTab()}
          marginBottomScrollView={0}
          marginTop={0}
          scrollDisabled={openSession}
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
    paddingTop: marginTopApp + 20,
    minHeight: height - 100,
  },
  titlePage: {
    ...styleApp.title,
    color: colors.white,
    marginBottom: 10,
    marginLeft: 20,
  },
  viewButtonNewSession: {
    position: 'relative',
    zIndex: -1,
    marginTop: 10,
    ...styleApp.marginView,
  },
  buttonNewSession: {
    position: 'relative',
    zIndex: -1,
    marginTop: 20,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    width: width,
  },
  colButtons: {
    height: heightCardSession,
    marginBottom: 20,
    width: width / 2,
    flexDirection: 'column',
    position: 'relative',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
    coach: state.coach,
  };
};

export default connect(
  mapStateToProps,
  {},
)(StreamPage);
