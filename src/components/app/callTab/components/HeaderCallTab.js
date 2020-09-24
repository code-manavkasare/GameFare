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
    this.AnimatedHeaderValue = new Animated.Value(0);
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
    } = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={headerTitle}
        inputRange={[40, 50]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon2={openUserDirectoryIcon}
        sizeIcon2={24}
        colorIcon2={colors.title}
        clickButton2={() => openUserDirectory()}
        icon1={openMessageHistoryIcon}
        sizeIcon1={23}
        colorIcon1={colors.title}
        badgeIcon1={
          numberNotifications !== 0 && showNotificationCount && (
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
        clickButton1={() => openMessageHistory()}
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
