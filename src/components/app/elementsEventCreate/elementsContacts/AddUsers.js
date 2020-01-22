import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import Toast from 'react-native-easy-toast';
import firebase from 'react-native-firebase';
import PropTypes from 'prop-types';
import {keys} from 'ramda';

import Button from '../../../layout/buttons/Button';
import SearchBarContact from './SearchBarContact';
import {
  createDiscussion,
  searchDiscussion,
  sendNewMessage,
} from '../../../functions/message';
import {autocompleteSearchUsers} from '../../../functions/users';
import UsersSelectableList from '../../elementsMessage/UsersSelectableList';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {initialState} from '../../../../reducers/messageReducer';

const {height, width} = Dimensions.get('screen');

class AddUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      usersList: [],
      selectedUsersWithId: {},
      searchInputGameFareUsers: this.props.searchString,
      loaderSearchCall: true,
      loaderDatabaseUpdate: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.searchGameFareUsers(this.state.searchInputGameFareUsers);
  }

  searchGameFareUsers = async (search) => {
    this.setState({loader: true, searchInputGameFareUsers: search});
    this.props.changeSearchGameFareUsers(search);

    const gamefareUsersResults = await autocompleteSearchUsers(search);

    this.setState({loader: false, usersList: gamefareUsersResults});
  };

  getSelectedUsers = async (selectedUsers) => {
    let selectedUsersWithId = selectedUsers;
    for await (let [key, value] of Object.entries(selectedUsers)) {
      selectedUsersWithId[key].id = value.objectID;
    }
    await this.setState({selectedUsersWithId});
  };

  sendInvitationGamefareUsers = async () => {
    const {user, userID} = this.props;
    const {selectedUsersWithId} = this.state;

    let usersIDArray = keys(selectedUsersWithId);
    usersIDArray.push(userID);

    const selectedUsersWithIdAndHost = {
      ...selectedUsersWithId,
      [userID]: {...user, id: userID},
    };

    let discussion = await searchDiscussion(usersIDArray, usersIDArray.length);
    if (!discussion) {
      discussion = await createDiscussion(
        selectedUsersWithIdAndHost,
        'General',
      );
    }

    const {url, description} = await this.props.createBranchMessage();

    await sendNewMessage(
      discussion.objectID,
      this.props.user,
      `${description} ${url}`,
    );

    await firebase
      .database()
      .ref('discussions/' + discussion.objectID)
      .update({firstMessageExists: true});

    this.showToast('Invitations sent !');
  };

  showToast(text) {
    this.refs.toast.show(
      <View>
        <Text>{text}</Text>
      </View>,
    );
  }

  render() {
    const {searchInputGameFareUsers, usersList, loader} = this.state;

    return (
      <View style={styles.mainView}>
        <Toast
          ref="toast"
          style={styles.toast}
          position="center"
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
          textStyle={{color: 'white'}}
        />
        <SearchBarContact
          placeHolderMessage={'Search for GameFare users...'}
          updateSearch={this.searchGameFareUsers}
          searchString={searchInputGameFareUsers}
        />

        <UsersSelectableList
          usersList={usersList}
          loader={loader}
          getSelectedUsers={this.getSelectedUsers}
        />

        <View style={styleApp.footerBooking}>
          <View style={{marginLeft: 20, width: width - 40}}>
            <Button
              backgroundColor={'green'}
              onPressColor={colors.greenClick}
              text={'Send invitation'}
              click={() => this.sendInvitationGamefareUsers()}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    height: '94%',
  },
  rowGroup: {
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.3,
    borderColor: colors.borderColor,
  },
  toast: {
    backgroundColor: colors.green,
  },
});

AddUsers.PropTypes = {
  searchString: PropTypes.string.isRequired,
  eventID: PropTypes.string.isRequired,
  changeSearchGameFareUsers: PropTypes.func.isRequired,
  createBranchMessage: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    user: state.user,
  };
};

export default connect(mapStateToProps)(AddUsers);