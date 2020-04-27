import React, {Component} from 'react';
import {Dimensions, View, StyleSheet, Text, Animated} from 'react-native';
import {connect} from 'react-redux';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import CardUserSelect from '../../../layout/cards/CardUserSelect';
import Loader from '../../../layout/loaders/Loader';
import {getBlockedUsers} from '../../../database/algolia';
import {blockUnblockUser} from '../../../database/firebase/users';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

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
  blockUsers() {
    const {blockedUsers, selectedUsers, loader} = this.state;
    if (loader)
      return (
        <View style={[styleApp.center, {minHeight: '100%'}]}>
          <Loader size={35} color={'green'} />
        </View>
      );
    if (blockedUsers.length === 0)
      return (
        <Text style={[styleApp.text, {marginLeft: 20, marginTop: 20}]}>
          You have not blocked any user.
        </Text>
      );
    if (blockedUsers)
      return blockedUsers.map((user, i) =>
        this.cardUser(user, i, selectedUsers),
      );
    return null;
  }

  render() {
    const {loader} = this.state;
    const {goBack} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
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

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.blockUsers.bind(this)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          refreshControl={false}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooter + 40}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    blockedUsersID: state.user.infoUser.blockedUsers,
  };
};

export default connect(
  mapStateToProps,
  {},
)(BlockedUsersList);
