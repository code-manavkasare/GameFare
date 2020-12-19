import React, {Component} from 'react';
import {StyleSheet, Keyboard} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';
import {dissoc} from 'ramda';
import {string, array, bool} from 'prop-types';
import {navigate} from '../../../../../NavigationService';

import styleApp from '../../../style/style';
import {heightHeaderHome, marginTopApp, marginLeft} from '../../../style/sizes';

import {isUserPrivate, userObject} from '../../../functions/users';
import {openSession} from '../../../functions/coach';

import InvitationManager from '../../../utility/InvitationManager';
import SearchResults from './SearchResults';
import {
  userIDSelector,
  userInfoSelector,
} from '../../../../store/selectors/user';

class SearchBody extends Component {
  static propTypes = {
    action: string,
    archivesToShare: array,
    sessionToInvite: string,
    searchFor: string,
    selectOne: bool,
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

  selectUser = (user) => {
    const {userID, selectOne} = this.props;
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
                id: session.objectID,
              });
            },
          },
        ],
      });
    } else {
      const {selectedUsers} = this.state;
      if (selectedUsers[user.id]) {
        this.setState({selectedUsers: dissoc(user.id, selectedUsers)});
      } else if (selectOne) {
        this.setState({selectedUsers: {[user.id]: user}});
      } else {
        this.setState({selectedUsers: {...selectedUsers, [user.id]: user}});
      }
    }
  };

  onConfirm = ({users}) => {
    const {onConfirm} = this.props;
    onConfirm && onConfirm({results: users});
    this.setState({selectedUsers: {}});
  };

  render() {
    const {selectedUsers, searchText} = this.state;
    const {
      action,
      archivesToShare,
      sessionToInvite,
      AnimatedHeaderValue,
      searchFor,
    } = this.props;
    return (
      <Col style={styles.body}>
        <Row size={90} style={styles.smallTopPad}>
          <SearchResults
            searchFor={searchFor}
            onSelect={this.selectUser}
            selectedUsers={selectedUsers}
            searchText={searchText}
            AnimatedHeaderValue={AnimatedHeaderValue}
          />
        </Row>
        <InvitationManager
          selectedUsers={selectedUsers}
          onClearInvites={() => this.setState({selectedUsers: {}})}
          onConfirmInvites={this.onConfirm}
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
    marginTop: heightHeaderHome + marginTopApp,
    marginLeft: marginLeft,
  },
  smallTopPad: {
    paddingTop: 6,
    marginTop: -20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(SearchBody);
