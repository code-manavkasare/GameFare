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
import InviteButton from './components/InvitationManager';
import LogoutView from './components/LogoutView';
import PermissionView from './components/PermissionView';

import PeopleBody from './components/PeopleBody';
import Loader from '../../../layout/loaders/Loader';
import HeaderPeople from './components/HeaderPeople';
import {sessionOpening} from '../../../functions/coach';
import Search from './components/Search';
import InvitationManager from './components/InvitationManager';

const {height} = Dimensions.get('screen');

class StreamTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permissionsCamera: false,
      initialLoader: true,
      sharingVideos: props?.route?.params?.sharingVideos,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.openSession = this.openSession.bind(this);
    this.focusUnsubscribe = null;
  }
  componentDidMount = () => {
    const {navigation} = this.props;
    const {params} = this.props.route;
    if (params?.objectID) {
      this.openSession(params.objectID);
    }
    this.focusUnsubscribe = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
  };
  componentWillUnmount = () => {
    if (this.focusUnsubscribe) {
      this.focusUnsubscribe();
    }
  };
  componentDidUpdate = (prevProps) => {
    const {params} = this.props.route;
    const {params: prevParams} = prevProps.route;
    if (prevParams?.date !== params?.date && params?.date) {
      this.openSession(params.objectID);
    }
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
    const {permissionsCamera, initialLoader, sharingVideos} = this.state;

    return (
      <View style={styleApp.fullSize}>
        {initialLoader && this.viewLoader()}

        {!permissionsCamera ? (
          <PermissionView
            initialLoader={initialLoader}
            setState={this.setState.bind(this)}
          />
        ) : null}
        <PeopleBody
          onRef={(ref) => {
            this.peopleBodyRef = ref;
          }}
          permissionsCamera={permissionsCamera}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          mostRecent={true}
          sharingVideos={sharingVideos}
          openSearch={(y) => {
            this.searchRef?.animate(1, y);
          }}
        />
      </View>
    );
  };

  render() {
    const {permissionsCamera, sharingVideos} = this.state;
    const {userConnected} = this.props;

    return (
      <View style={styleApp.stylePage}>
        <HeaderPeople
          userConnected={userConnected}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          hideButtonNewSession={!userConnected || !permissionsCamera}
          sharingVideos={sharingVideos}
          onRef={(ref) => (this.HeaderRef = ref)}
        />

        <View style={{marginTop: sizes.marginTopApp + sizes.heightHeaderHome}}>
          {this.StreamTab()}
        </View>
        <Search
          onRef={(ref) => {
            this.searchRef = ref;
          }}
          onClose={() => {
            this.peopleBodyRef?.displaySearchBar(1);
          }}
          invite={async (user, init) => {
            return await this.invitationManagerRef?.invite(user, init);
          }}
        />
        <InvitationManager
          onRef={(ref) => {
            this.invitationManagerRef = ref;
          }}
          resetInvites={() => {
            this.searchRef?.resetInvites();
          }}
          dismiss={() => {
            this.searchRef?.animate(0);
          }}
          sharingVideos={sharingVideos}
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
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(StreamTab);
