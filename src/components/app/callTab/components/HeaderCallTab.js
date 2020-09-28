import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Text, View, Share, Animated} from 'react-native';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

class HeaderCallTab extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }

  header = () => {
    const {
      numberNotifications,
      showNotificationCount,
      headerTitle,
      openUserDirectory,
      openUserDirectoryIcon,
      openMessageHistory,
      openMessageHistoryIcon,
      AnimatedHeaderValue,
      searchBar,
      typeIcon1,
      typeIcon2,
    } = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={headerTitle}
        inputRange={[5, 20]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        searchBar={searchBar}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon1={openUserDirectoryIcon}
        typeIcon1={typeIcon2}
        sizeIcon1={24}
        colorIcon1={colors.title}
        clickButton1={() => openUserDirectory()}
        typeIcon2={typeIcon1}
        icon2={openMessageHistoryIcon}
        sizeIcon2={23}
        colorIcon2={colors.title}
        badgeIcon2={
          numberNotifications !== 0 &&
          showNotificationCount && (
            <View style={[styleApp.viewBadge, {marginLeft: 30}]}>
              <Text
                style={[
                  styleApp.textBold,
                  {color: colors.white, fontSize: 10},
                ]}>
                {numberNotifications}
              </Text>
            </View>
          )
        }
        clickButton2={() => openMessageHistory()}
      />
    );
  };

  render() {
    return this.header();
  }
}

const mapStateToProps = (state) => {
  const notifications = state.user.infoUser.notifications;
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    numberNotifications: notifications
      ? Object.values(notifications).length
      : 0,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderCallTab);
