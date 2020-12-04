import React, {Component} from 'react';
import {View, StyleSheet, Animated, Keyboard, Text} from 'react-native';
import {connect} from 'react-redux';
import {BlurView} from '@react-native-community/blur';
import {dissoc} from 'ramda';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import {heightHeaderHome, marginTopApp, heightFooter} from '../../style/sizes';

import {getSelectionActionDecorations} from '../../functions/utility';
import {isUserPrivate, userObject} from '../../functions/users';
import {openSession} from '../../functions/coach';

import Loader from '../../layout/loaders/Loader';
import {boolShouldComponentUpdate} from '../../functions/redux';
import SearchInput from '../../layout/textField/SearchInput';
import PermissionView from '../../layout/Views/PermissionView';
import InvitationManager from '../../utility/InvitationManager';

import ListVideoCalls from './components/ListVideoCalls';
import UserSearchResults from '../userDirectory/components/UserSearchResults';
import HeaderCallTab from './components/HeaderCallTab';
import {
  userConnectedSelector,
  userIDSelector,
  userInfoSelector,
} from '../../../store/selectors/user';

class CallTab extends Component {
  constructor(props) {
    super(props);
    const action = props.route?.params?.action ?? 'call';
    const {actionHeader} = getSelectionActionDecorations(action);
    this.state = {
      selectedSessions: {},
      selectedUsers: {},
      searchText: '',
      searchActive: false,
      permissionsCamera: false,
      initialLoader: true,
      action,
      actionHeader,
      archivesToShare: props.route?.params?.archivesToShare,
      modal: props.route?.params?.modal ?? false,
      inlineSearch: props.route?.params?.inlineSearch ?? false,
      branchLink: props.route?.params?.branchLink ?? null,
    };
    this.focusUnsubscribe = null;
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CallTab',
    });
  }
  componentWillUnmount = () => {
    if (this.focusUnsubscribe) {
      this.focusUnsubscribe();
    }
  };

  selectUser(user) {
    const {navigate} = this.props.navigation;
    const {userID, infoUser} = this.props;
    if (isUserPrivate(user)) {
      Keyboard.dismiss();
      return navigate('Alert', {
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
            forceNavigation: true,
            operation: async () => {
              const session = await openSession(userObject(infoUser, userID), {
                [user.id]: user,
              });
              navigate('Conversation', {
                coachSessionID: session.objectID,
              });
            },
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
    const {userID} = this.props;
    const {
      selectedSessions,
      action,
      selectedUsers,
      searchText,
      searchActive,
      inlineSearch,
      modal,
    } = this.state;
    return (
      <View>
        {searchText === '' ? (
          <ListVideoCalls
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            selectedSessions={selectedSessions}
            inlineSearch={inlineSearch}
            onClick={(session) => this.selectSession(session)}
            openUserDirectory={() => this.openUserDirectory()}
            hideCallButton={action !== 'call'}
            liveSessionHeader={action === 'call'}
            headerTitle={modal ? 'Recent' : userID ? 'Video Calls' : ''}
          />
        ) : null}
        {searchActive && searchText === '' ? (
          <BlurView
            style={styles.listVideoCallsBlur}
            blurType={'regular'}
            blurAmount={10}
          />
        ) : null}
        {searchText !== '' ? (
          <UserSearchResults
            onSelect={(user) => this.selectUser(user)}
            selectedUsers={selectedUsers}
            searchText={searchText}
          />
        ) : null}
      </View>
    );
  }
  openUserDirectory = async () => {
    const {navigation} = this.props;
    const {goBack, navigate} = navigation;
    const {inlineSearch, branchLink, archivesToShare, action} = this.state;

    if (inlineSearch) {
      goBack();
    } else {
      await this.setState({selectedUsers: {}, selectedSessions: {}});
      navigate('UserDirectory', {
        action,
        archivesToShare,
        branchLink,
      });
    }
  };

  header() {
    const {actionHeader, modal, inlineSearch} = this.state;
    const {navigation, userConnected, route} = this.props;
    const {navigate, goBack} = navigation;
    return (
      <HeaderCallTab
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={actionHeader}
        inputRange={[5, 20]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={0}
        initialBorderWidth={1}
        loader={false}
        icon1={!userConnected ? null : inlineSearch ? 'times' : 'search'}
        sizeIcon1={19}
        colorIcon1={colors.greyDarker}
        clickButton1={
          inlineSearch ? () => goBack() : () => this.openUserDirectory()
        }
        archivesToShare={route?.params?.archivesToShare}
        modal={modal}
        icon2={!userConnected ? null : modal ? 'share' : 'comment-alt'}
        typeIcon2={modal ? 'moon' : 'font'}
        sizeIcon2={21}
        colorIcon2={colors.greyDarker}
        clickButton2={() => navigate('Groups')}
        searchBar={
          inlineSearch ? (
            <SearchInput
              search={(text) => this.setState({searchText: text})}
              onFocus={() => {
                this.setState({searchActive: true});
              }}
              onBlur={() => {
                this.setState({searchActive: false});
              }}
            />
          ) : null
        }
      />
    );
  }

  render() {
    const {
      permissionsCamera,
      action,
      archivesToShare,
      modal,
      selectedSessions,
      selectedUsers,
    } = this.state;
    return (
      <View style={styleApp.stylePage}>
        {this.header()}
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
          archivesToShare={archivesToShare}
          bottomOffset={modal ? 55 : heightFooter}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bodyContainer: {marginTop: marginTopApp + heightHeaderHome},
  loaderStyle: {...styleApp.center, height: 120},
  inlineSearchContainer: {paddingBottom: 0},
  listVideoCallsBlur: {
    position: 'absolute',
    ...styleApp.fullSize,
    top: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
    userConnected: userConnectedSelector(state),
  };
};

export default connect(mapStateToProps)(CallTab);
