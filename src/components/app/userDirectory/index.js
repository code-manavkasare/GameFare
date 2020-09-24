import React, {Component} from 'react';
import {View, StyleSheet, Animated, Share} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';
import Orientation from 'react-native-orientation-locker';
import {Row, Col} from 'react-native-easy-grid';
import {dissoc} from 'ramda';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import sizes from '../../style/sizes';

import ButtonColor from '../../layout/Views/Button';
import AllIcon from '../../layout/icons/AllIcons';

import HeaderUserDirectory from './components/HeaderUserDirectory';
import SearchInput from './components/Search';
import UserSearchResults from './components/UserSearchResults';
import InvitationManager from './components/UserInvitationManager';

export default class userDirectoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: {},
      action: props.route?.params?.action ?? 'call',
      actionText: props.route?.params?.actionText ?? 'Call',
      branchLink: props.route?.params?.branchLink ?? null,
    };
    this.searchResultsRef = null;
    this.invitationManagerRef = null;
  }

  selectUser(user) {
    const {selectedUsers} = this.state;
    if (selectedUsers[user.objectID]) {
      this.setState({selectedUsers: dissoc(user.objectID, selectedUsers)});
      return false;
    } else {
      this.setState({selectedUsers: {...selectedUsers, [user.objectID]: user}});
      return true;
    }
  }

  render() {
    const {selectedUsers, action, actionText, branchLink} = this.state;
    const {navigation} = this.props;
    const {goBack} = navigation;
    return (
      <View style={styles.container}>
        <HeaderUserDirectory branchLink={branchLink} goBack={() => goBack()} />
        <Col style={styles.body}>
          <Row size={10}>
            <SearchInput
              search={(text) => this.searchResultsRef?.searchUsers(text)}
            />
          </Row>
          <Row size={90} style={styles.smallTopPad}>
            <UserSearchResults
              onRef={(ref) => {
                this.searchResultsRef = ref;
              }}
              onSelect={(user) => this.selectUser(user)}
              selectedUsers={selectedUsers}
            />
          </Row>
        </Col>
        <InvitationManager
          invitedUsers={selectedUsers}
          onClearInvites={() => this.setState({selectedUsers: {}})}
          onConfirmInvites={() => null}
          action={action}
          actionText={actionText}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...styleApp.stylePage,
  },
  body: {
    marginTop: sizes.heightHeaderHome + sizes.marginTopApp,
    marginLeft: sizes.marginLeft,
  },
  smallTopPad: {
    paddingTop: 6,
  },
});
