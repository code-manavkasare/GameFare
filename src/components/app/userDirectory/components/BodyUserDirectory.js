import React, {Component} from 'react';
import {View, StyleSheet, Animated, Share} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';
import {dissoc} from 'ramda';
import PropTypes from 'prop-types';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';

import SearchInput from '../../../layout/textField/SearchInput';
import InvitationManager from '../../../utility/InvitationManager';

import UserSearchResults from './UserSearchResults';

export default class userDirectoryPage extends Component {
  static propTypes = {
    action: PropTypes.string,
    actionText: PropTypes.string,
    archivesToShare: PropTypes.array,
  }
  static defaultProps = {
    action: 'call',
    actionText: 'Call',
  }
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: {},
      searchText: '',
      branchLink: props.route?.params?.branchLink ?? null,
    };
    this.searchResultsRef = null;
    this.invitationManagerRef = null;
  }
  componentDidMount() {
    this.props.onRef(this);
  }

  selectUser(user) {
    const {selectedUsers} = this.state;
    if (selectedUsers[user.id]) {
      this.setState({selectedUsers: dissoc(user.id, selectedUsers)});
    } else {
      this.setState({selectedUsers: {...selectedUsers, [user.id]: user}});
    }
  }

  render() {
    const {selectedUsers, searchText} = this.state;
    const {action, actionText, archivesToShare} = this.props;
    return (
        <Col style={styles.body}>
        
          <Row size={90} style={styles.smallTopPad}>
            <UserSearchResults
              onSelect={(user) => this.selectUser(user)}
              selectedUsers={selectedUsers}
              searchText={searchText}
            />
          </Row>
          <InvitationManager
            selectedUsers={selectedUsers}
            onClearInvites={() => this.setState({selectedUsers: {}})}
            onConfirmInvites={() => this.setState({selectedUsers: {}})}
            action={action}
            actionText={actionText}
            archivesToShare={archivesToShare}
            bottomOffset={0}
          />
        </Col>
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
