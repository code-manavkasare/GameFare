import React, {Component} from 'react';
import {View, StyleSheet, Animated, Share, Alert, Keyboard} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import Orientation from 'react-native-orientation-locker';
import isEqual from 'lodash.isequal';
import {dissoc} from 'ramda';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import sizes from '../../style/sizes';

import {generateID} from '../../functions/createEvent';
import {createInviteToSessionBranchUrl} from '../../database/branch';
import {getSelectionActionDecorations} from '../../functions/utility';
import {isUserPrivate} from '../../functions/users';

import Loader from '../../layout/loaders/Loader';
import SearchInput from '../../layout/textField/SearchInput';
import PermissionView from '../../layout/Views/PermissionView';
import InvitationManager from '../../utility/InvitationManager';

import HeaderCallTab from './components/HeaderCallTab';
import ListVideoCalls from './components/ListVideoCalls';
import UserSearchResults from '../userDirectory/components/UserSearchResults';

class CallTab extends Component {
  constructor(props) {
    super(props);
    const action = props.route?.params?.action ?? 'call';
    const {actionText, actionHeader} = getSelectionActionDecorations(action);
    this.state = {
      selectedSessions: {},
      selectedUsers: {},
      searchText: '',
      permissionsCamera: false,
      initialLoader: true,
      action,
      actionText,
      actionHeader,
      archivesToShare: props.route?.params?.archivesToShare,
      modal: props.route?.params?.modal ?? false,
      inlineSearch: props.route?.params?.inlineSearch ?? false,
      branchLink: props.route?.params?.branchLink ?? null,
    };
    this.focusUnsubscribe = null;
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount = () => {
    const {navigation} = this.props;
    this.setBranchLink();
    this.focusUnsubscribe = navigation.addListener('focus', () => {
      Orientation.lockToPortrait();
    });
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

  selectUser(user) {
    const {navigate} = this.props.navigation;
    if (isUserPrivate(user)) {
      Keyboard.dismiss();
      return navigate('RootAlert', {
        textButton: 'Allow',
        title: `${
          user.info.firstname
        } is private. Would you like to send a message request?`,
        displayList: true,
        listOptions: [
          {
            operation: () => null,
          },
          {
            operation: () => Alert.alert('How do I send a message request lol'),
          },
        ],
      });
    } else {
      const {selectedUsers} = this.state;
      if (selectedUsers[user.id]) {
        this.setState({selectedUsers: dissoc(user.id, selectedUsers)});
      } else {
        this.setState({
          selectedSessions: {},
          selectedUsers: {...selectedUsers, [user.id]: user},
        });
      }
    }
  }

  selectSession = (session) => {
    const {action, selectedSessions} = this.state;
    if (action === 'call' || action === 'message') {
      // only select one
      if (selectedSessions[session.objectID]) {
        this.setState({selectedSessions: {}});
      } else {
        this.setState({
          selectedUsers: {},
          selectedSessions: {[session.objectID]: session},
        });
      }
    } else {
      // select multiple
      if (selectedSessions[session.objectID]) {
        this.setState({
          selectedSessions: dissoc(session.objectID, selectedSessions),
        });
      } else {
        this.setState({
          selectedUsers: {},
          selectedSessions: {
            ...selectedSessions,
            [session.objectID]: session,
          },
        });
      }
    }
  };

  viewLoader() {
    return (
      <View style={styles.loaderStyle}>
        <Loader size={55} color={colors.primary} />
      </View>
    );
  }

  viewPermissions() {
    const {initialLoader} = this.props;
    return (
      <PermissionView
        initialLoader={initialLoader}
        setState={this.setState.bind(this)}
      />
    );
  }

  viewCallTab() {
    const {selectedSessions, action, selectedUsers, searchText} = this.state;
    return (
      <View>
        {searchText === '' ? (
          <ListVideoCalls
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            selectedSessions={selectedSessions}
            onClick={(session) => this.selectSession(session)}
            hideCallButton={action !== 'call'}
          />
        ) : (
          <UserSearchResults
            onSelect={(user) => this.selectUser(user)}
            selectedUsers={selectedUsers}
            searchText={searchText}
          />
        )}
      </View>
    );
  }

  render() {
    const {
      permissionsCamera,
      action,
      actionText,
      actionHeader,
      archivesToShare,
      modal,
      branchLink,
      selectedSessions,
      selectedUsers,
      inlineSearch,
    } = this.state;
    const {userConnected, navigation} = this.props;
    const {navigate, goBack} = navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderCallTab
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          userConnected={userConnected}
          headerTitle={actionHeader}
          openUserDirectoryIcon={inlineSearch ? 'share' : 'searchFooter'}
          typeIcon2={'moon'}
          searchBar={
            inlineSearch && (
              <SearchInput
                search={(text) => this.setState({searchText: text})}
              />
            )
          }
          openUserDirectory={
            inlineSearch
              ? async () => {
                  const result = await Share.share({url: branchLink});
                  if (result.action === Share.sharedAction) {
                    this.setBranchLink();
                  }
                }
              : () => {
                  this.setState({selectedUsers: {}, selectedSessions: {}});
                  navigate('UserDirectory', {
                    action,
                    actionText,
                    archivesToShare,
                    branchLink,
                  });
                }
          }
          openMessageHistoryIcon={modal ? 'close' : 'comment-alt'}
          typeIcon1={modal ? 'mat' : 'font'}
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
          {permissionsCamera ? this.viewPermissions() : this.viewCallTab()}
        </View>
        <InvitationManager
          selectedSessions={selectedSessions}
          selectedUsers={selectedUsers}
          onClearInvites={() =>
            this.setState({selectedUsers: {}, selectedSessions: {}})
          }
          onConfirmInvites={() =>
            this.setState({selectedUsers: {}, selectedSessions: {}})
          }
          action={action}
          actionText={actionText}
          archivesToShare={archivesToShare}
          bottomOffset={modal ? 0 : sizes.heightFooter}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodyContainer: {marginTop: sizes.marginTopApp + sizes.heightHeaderHome},
  loaderStyle: {...styleApp.center, height: 120},
  inlineSearchContainer: {paddingBottom: 0},
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
