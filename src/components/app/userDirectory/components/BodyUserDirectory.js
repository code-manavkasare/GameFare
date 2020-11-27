import React, {Component} from 'react';
import {View, StyleSheet, Keyboard} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';
import {dissoc} from 'ramda';
import PropTypes from 'prop-types';
import {navigate} from '../../../../../NavigationService';

import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';

import {isUserPrivate, userObject} from '../../../functions/users';
import {openSession} from '../../../functions/coach';

import InvitationManager from '../../../utility/InvitationManager';
import UserSearchResults from './UserSearchResults';
import {
  userIDSelector,
  userInfoSelector,
} from '../../../../store/selectors/user';

class BodyUserDirectory extends Component {
  static propTypes = {
    action: PropTypes.string,
    archivesToShare: PropTypes.array,
    sessionToInvite: PropTypes.string,
  };
  static defaultProps = {
    action: 'call',
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: {},
      searchText: '',
    };
    this.searchResultsRef = null;
    this.invitationManagerRef = null;
  }
  componentDidMount() {
    this.props.onRef(this);
  }

  selectUser(user) {
    const {userID} = this.props;
    if (isUserPrivate(user)) {
      Keyboard.dismiss();
      return navigate('Alert', {
        textButton: 'Allow',
        title: `${
          user?.info?.firstname
        } is private. Would you like to send a message request?`,
        displayList: true,
        listOptions: [
          {
            operation: () => null,
          },
          {
            forceNavigation: true,
            operation: async () => {
              const session = await openSession(userObject(userID), {
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
        this.setState({selectedUsers: {...selectedUsers, [user.id]: user}});
      }
    }
  }

  render() {
    const {selectedUsers, searchText} = this.state;
    const {
      action,
      archivesToShare,
      sessionToInvite,
      AnimatedHeaderValue,
    } = this.props;
    return (
      <Col style={styles.body}>
        <Row size={90} style={styles.smallTopPad}>
          <UserSearchResults
            onSelect={(user) => this.selectUser(user)}
            selectedUsers={selectedUsers}
            searchText={searchText}
            AnimatedHeaderValue={AnimatedHeaderValue}
          />
        </Row>
        <InvitationManager
          selectedUsers={selectedUsers}
          onClearInvites={() => this.setState({selectedUsers: {}})}
          onConfirmInvites={() => this.setState({selectedUsers: {}})}
          action={action}
          archivesToShare={archivesToShare}
          sessionToInvite={sessionToInvite}
          session
          bottomOffset={55}
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

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(BodyUserDirectory);
