import React, {Component} from 'react';
import {
  Dimensions,
  View,
  StyleSheet,
  ScrollView,
  Text,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import CardUserSelect from '../../../layout/cards/CardUserSelect';
import Loader from '../../../layout/loaders/Loader';
import {getBlockedUsers} from '../../../database/algolia';
import {blockUnblockUser} from '../../../database/firebase/users';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
const {height, width} = Dimensions.get('screen');

class BlockedUsersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      blockedUsers: [],
      selectedUsers: {},
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount = async () => {
    this.refreshUsersList();
  };

  selectUser(select, user, selectedUsers) {
    if (!select)
      selectedUsers = {
        ...selectedUsers,
        [user.objectID]: user,
      };
    else delete selectedUsers[user.objectID];
    this.setState({selectedUsers: selectedUsers});
  }

  unblockUser = async () => {
    const {selectedUsers} = this.state;
    for (const blockedUserID of Object.keys(selectedUsers)) {
      await blockUnblockUser(false, this.props.userID, blockedUserID);
    }
    this.refreshUsersList();
  };

  async refreshUsersList() {
    await this.setState({loader: true});
    const {blockedUsersID} = this.props;
    let blockedUsers = [];
    if (blockedUsersID) {
      blockedUsers = await getBlockedUsers(Object.keys(blockedUsersID));
    }

    this.setState({blockedUsers, loader: false});
  }

  cardUser(user, i, selectedUsers) {
    return (
      <CardUserSelect
        user={user}
        key={i}
        selectUser={this.selectUser.bind(this)}
        selectedUsers={selectedUsers}
      />
    );
  }

  render() {
    const {blockedUsers, selectedUsers, loader} = this.state;
    const {goBack} = this.props.navigation;

    return (
      <View
        style={{
          backgroundColor: 'white',
          flex: 1,
        }}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Blocked Users'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialBorderColorHeader={colors.grey}
          initialTitleOpacity={1}
          initialBorderWidth={0.3}
          loader={loader}
          typeIcon2={'font'}
          sizeIcon2={17}
          icon1={'arrow-left'}
          icon2={'user-check'}
          clickButton1={() => goBack()}
          clickButton2={() => this.unblockUser()}
        />
        <ScrollView style={styles.scrollViewUsers}>
          {loader && (
            <View style={[styleApp.center, {height: 200}]}>
              <Loader size={35} color={'green'} />
            </View>
          )}
          {!loader &&
            blockedUsers &&
            blockedUsers.map((user, i) =>
              this.cardUser(user, i, selectedUsers),
            )}
          {!loader && blockedUsers.length === 0 && (
            <Text style={[styleApp.text, {marginLeft: 20, marginTop: 20}]}>
              You have not blocked any user.
            </Text>
          )}
          <View style={{height: 300}} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewUsers: {
    paddingTop: sizes.heightHeaderHome,
    minHeight: height,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    blockedUsersID: state.user.infoUser.blockedUsers,
  };
};

export default connect(mapStateToProps, {})(BlockedUsersList);
