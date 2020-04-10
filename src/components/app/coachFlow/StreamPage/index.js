import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import FadeInView from 'react-native-fade-in-view';
import firebase from 'react-native-firebase';
const {height, width} = Dimensions.get('screen');

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {marginTopApp, heightFooter} from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import Button from '../../../layout/buttons/Button';
import PermissionView from './components/PermissionView';

import {setParams, navigate} from '../../../../../NavigationService';
import {timeout, createCoachSession} from '../../../functions/coach';
import {audioVideoPermission} from '../../../functions/streaming';

import StreamView from './components/StreamView';

const heightCardSession = 170;

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraAccess: false,
      microAccess: false,
      loader: false,
      open: false,
      permissionsCamera: false,
    };
    this.itemsRef = [];
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    console.log('componentDidMount', this.props.route);

    ///// Permission to camera / micro
    const permissionsCamera = await audioVideoPermission();
    await this.setState({permissionsCamera: permissionsCamera});
    if (!permissionsCamera) return;

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
    console.log('resetOpenSession');
    navigation.setParams({openSession: false, objectID: false});
  }
  listStreams(arrayIDSessions) {
    const {navigation, route} = this.props;
    let objectID = false;
    if (route.params) objectID = route.params.objectID;

    return (
      <View style={styles.rowButtons}>
        {arrayIDSessions.map((coachSessionID, i) => {
          return (
            <View
              style={[
                styles.colButtons,
                styleApp.center,
                {zIndex: objectID === coachSessionID ? 40 : 1},
              ]}>
              <StreamView
                key={i}
                index={i}
                offsetScrollView={marginTopApp + 80}
                heightCardSession={heightCardSession}
                navigation={navigation}
                route={route}
                coachSessionID={coachSessionID}
                getScrollY={() => {
                  return this.AnimatedHeaderValue._value;
                }}
                closeCurrentSession={async () => {
                  return this.itemsRef[coachSessionID].endCoachSession();
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
      <Button
        backgroundColor="primary"
        onPressColor={colors.primaryLight}
        enabled={true}
        text="New session"
        styleButton={styles.buttonNewSession}
        loader={loader}
        click={async () => {
          if (!userConnected) return navigation.navigate('SignIn');
          const {userID, infoUser} = this.props;
          await this.setState({loader: true});
          const coachSessionID = await createCoachSession({
            id: userID,
            info: infoUser,
          });
          // await firebase
          //   .database()
          //   .ref(`users/${userID}/coachSessions/${coachSessionID}`)
          //   .set(true);
          this.setState({loader: false});
        }}
      />
    );
  }
  StreamTab() {
    const {permissionsCamera} = this.state;
    let {coachSessions, userConnected} = this.props;
    if (!coachSessions) coachSessions = {};

    return (
      <View style={styles.containerTabPage}>
        <Text style={styles.titlePage}>Stream your performance</Text>

        {!userConnected ? (
          <Button
            backgroundColor="green"
            onPressColor={colors.greenLight}
            enabled={true}
            text="Sign in to start"
            styleButton={styles.buttonNewSession}
            loader={false}
            click={async () => navigate('SignIn')}
          />
        ) : !permissionsCamera ? (
          <PermissionView />
        ) : (
          this.listStreams(Object.keys(coachSessions))
        )}
        {this.buttonNewSession()}
      </View>
    );
  }
  render() {
    const {route} = this.props;
    let openSession = false;
    if (route.params) openSession = route.params.openSession;
    return (
      <View style={[styleApp.page, {backgroundColor: colors.title}]}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.StreamTab()}
          marginBottomScrollView={0}
          marginTop={0}
          scrollDisabled={openSession}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTabPage: {
    ...styleApp.fullSize,
    paddingTop: marginTopApp + 20,
    minHeight: height,
  },
  titlePage: {
    ...styleApp.title,
    color: colors.white,
    marginBottom: 10,
    marginLeft: 20,
  },
  buttonNewSession: {
    position: 'relative',
    zIndex: -1,
    marginTop: 20,
    ...styleApp.marginView,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    width: width,
  },
  colButtons: {
    height: heightCardSession,
    borderColor: colors.title,
    width: width / 2,
    flexDirection: 'column',
    position: 'relative',
    zIndex: 30,
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
