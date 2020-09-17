import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import Orientation from 'react-native-orientation-locker';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';
import PermissionView from './components/PermissionView';

import PeopleBody from './components/PeopleBody';
import Loader from '../../../layout/loaders/Loader';
import HeaderPeople from './components/HeaderPeople';
import {sessionOpening} from '../../../functions/coach';
import Search from './components/Search';
import InvitationManager from './components/InvitationManager';

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
    const loaderStyle = [{height: 120}, styleApp.center];
    return (
      <View style={loaderStyle}>
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
          invite={this.invitationManagerRef?.invite}
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
          invite={this.invitationManagerRef?.invite}
        />
        <InvitationManager
          onRef={(ref) => {
            this.invitationManagerRef = ref;
          }}
          resetInvites={() => {
            this.searchRef?.resetInvites();
            this.peopleBodyRef?.resetInvites();
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
