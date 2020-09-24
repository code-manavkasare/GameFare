import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import Orientation from 'react-native-orientation-locker';
import isEqual from 'lodash.isequal';
import {dissoc} from 'ramda';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import sizes from '../../style/sizes';

import {generateID} from '../../functions/createEvent';
import {sessionOpening} from '../../functions/coach';
import {createInviteToSessionBranchUrl} from '../../database/branch';

import Loader from '../../layout/loaders/Loader';

import HeaderCallTab from './components/HeaderCallTab';
import ListVideoCalls from './components/ListVideoCalls';
import PermissionView from './components/PermissionView';
import SessionInvitationManager from './components/SessionInvitationManager';

class CallTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedSessions: {},
      permissionsCamera: false,
      initialLoader: true,
      archivesToShare: props.route?.params?.archivesToShare,
      action: props.route?.params?.action ?? 'call',
      actionText: props.route?.params?.actionText ?? 'Call',
      modal: props.route?.params?.modal ?? false,
      branchLink: props.route?.params?.branchLink ?? null,
    };
    this.focusUnsubscribe = null;
  }

  componentDidMount = () => {
    const {navigation} = this.props;
    this.openSession();
    this.setBranchLink();
    this.focusUnsubscribe = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
  };

  shouldComponentUpdate(prevProps, prevState) {
    if (!isEqual(prevState, this.state)) {
      return true;
    }
    if (isEqual(this.props, prevProps)) {
      return false;
    }
    return true;
  }

  componentDidUpdate = (prevProps) => {
    const {params} = this.props.route;
    const {params: prevParams} = prevProps.route;
    if (params?.date && prevParams?.date !== params?.date) {
      this.openSession();
    }
  };

  componentWillUnmount = () => {
    if (this.focusUnsubscribe) {
      this.focusUnsubscribe();
    }
  };

  setBranchLink = async () => {
    const {params} = this.props.route;
    this.setState({
      branchLink:
        params?.branchLink ??
        (await createInviteToSessionBranchUrl(generateID())),
    });
  };

  selectSession = (session) => {
    const {action, selectedSessions} = this.state;
    if (action === 'call' || action === 'message') {
      // only select one
      if (selectedSessions[session.objectID]) {
        this.setState({selectedSessions: {}});
      } else {
        this.setState({selectedSessions: {[session.objectID]: session}});
      }
    } else {
      // select multiple
      if (selectedSessions[session.objectID]) {
        this.setState({
          selectedSessions: dissoc(session.objectID, selectedSessions),
        });
        return false;
      } else {
        this.setState({
          selectedSessions: {
            ...selectedSessions,
            [session.objectID]: session,
          },
        });
        return true;
      }
    }
  };

  openSession = async () => {
    const {params} = this.props.route;
    if (params?.objectID) {
      let session = await database()
        .ref(`coachSessions/${params.objectID}`)
        .once('value');
      session = session.val();
      sessionOpening(session);
    }
  };

  viewLoader = () => {
    return (
      <View style={styles.loaderStyle}>
        <Loader size={55} color={colors.primary} />
      </View>
    );
  };

  render() {
    const {
      selectedSessions,
      permissionsCamera,
      initialLoader,
      action,
      actionText,
      archivesToShare,
      modal,
      branchLink,
    } = this.state;
    const {userConnected, navigation} = this.props;
    const {navigate, goBack} = navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderCallTab
          userConnected={userConnected}
          headerTitle={
            !modal
              ? 'Video calls'
              : action === 'call'
              ? 'Call'
              : action === 'message'
              ? 'Message'
              : action === 'shareArchives'
              ? 'Share videos'
              : 'Video calls'
          }
          openUserDirectoryIcon={
            action === 'call'
              ? 'phone'
              : action === 'message'
              ? 'edit'
              : action === 'shareArchives'
              ? 'share'
              : 'call'
          }
          openUserDirectory={() => {
            this.setState({selectedSessions: {}});
            navigate('UserDirectory', {
              action,
              actionText,
              archivesToShare,
              branchLink,
            });
          }}
          openMessageHistoryIcon={modal ? 'times' : 'comment-alt'}
          openMessageHistory={
            modal
              ? () => goBack()
              : () => {
                  this.setState({selectedSessions: {}});
                  navigate('Groups');
                }
          }
          showNotificationCount={!modal}
        />
        <View style={styles.bodyContainer}>
          {initialLoader && this.viewLoader()}
          {!permissionsCamera ? (
            <PermissionView
              initialLoader={initialLoader}
              setState={this.setState.bind(this)}
            />
          ) : (
            <ListVideoCalls
              selectedSessions={selectedSessions}
              onClick={(session) => this.selectSession(session)}
              hideCallButton={action !== 'call'}
            />
          )}
          {!initialLoader && (
            <SessionInvitationManager
              selectedSessions={selectedSessions}
              onClearInvites={() => this.setState({selectedSessions: {}})}
              onConfirmInvites={() => this.setState({selectedSessions: {}})}
              action={action}
              actionText={actionText}
              archivesToShare={archivesToShare}
              accountForAppFooter={!modal}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodyContainer: {marginTop: sizes.marginTopApp + sizes.heightHeaderHome},
  loaderStyle: {...styleApp.center, height: 120},
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
)(CallTab);
