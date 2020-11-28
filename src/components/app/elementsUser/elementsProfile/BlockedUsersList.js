import React, {Component} from 'react';
import {View, Text, Animated} from 'react-native';
import {connect} from 'react-redux';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import CardUserSelect from '../../../layout/cards/CardUserSelect';
import Loader from '../../../layout/loaders/Loader';
import {getBlockedUsers} from '../../../database/algolia';
import {blockUnblockUser} from '../../../database/firebase/users';
import ScrollView from '../../../layout/scrollViews/ScrollView2';

import Button from '../../../layout/buttons/Button';
import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {userIDSelector} from '../../../../store/selectors/user';
import {blockedUsersSelector} from '../../../../store/selectors/blockedUsers';

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

  selectUser(user) {
    let {selectedUsers} = this.state;
    if (!selectedUsers[user.objectID]) selectedUsers[user.objectID] = user;
    else delete selectedUsers[user.objectID];

    this.setState({selectedUsers});
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

  cardUser(user) {
    const {selectedUsers} = this.state;
    return (
      <CardUserSelect
        user={user}
        key={user.info.objectID}
        onClick={this.selectUser.bind(this)}
        isUserSelected={selectedUsers[user.objectID]}
      />
    );
  }
  blockUsers() {
    const {blockedUsers, selectedUsers, loader} = this.state;
    if (loader)
      return (
        <View style={[styleApp.center, {minHeight: '100%'}]}>
          <Loader size={35} color={colors.green} />
        </View>
      );
    if (blockedUsers.length === 0)
      return (
        <Text style={[styleApp.text, {marginLeft: 20, marginTop: 20}]}>
          You have not blocked any user.
        </Text>
      );
    if (blockedUsers)
      return (
        <View style={{marginTop: 15}}>
          {blockedUsers.map((user, i) => this.cardUser(user, i, selectedUsers))}
        </View>
      );
    return null;
  }

  render() {
    const {blockedUsers, selectedUsers} = this.state;
    const {goBack} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Blocked Users'}
          inputRange={[0, 50]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          sizeIcon1={17}
          initialBorderColorHeader={colors.grey}
          initialTitleOpacity={1}
          initialBorderWidth={0.3}
          typeIcon2={'font'}
          sizeIcon2={17}
          icon1={'chevron-left'}
          clickButton1={() => goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.blockUsers.bind(this)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          refreshControl={false}
          marginTop={sizes.heightHeaderModal}
          offsetBottom={sizes.heightFooter + 40}
          showsVerticalScrollIndicator={true}
        />

        {blockedUsers.length !== 0 ? (
          <View
            style={[
              styleApp.footerBooking,
              styleApp.marginView,
              {bottom: sizes.heightFooter + 20},
            ]}>
            <Button
              text="Unblock users"
              backgroundColor={'green'}
              disabled={Object.values(selectedUsers).length === 0}
              onPressColor={colors.greenLight}
              styleButton={{height: 55}}
              click={() => this.unblockUser()}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    blockedUsersID: blockedUsersSelector(state),
  };
};

export default connect(mapStateToProps)(BlockedUsersList);
