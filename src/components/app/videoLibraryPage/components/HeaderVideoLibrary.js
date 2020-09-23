import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View, StyleSheet, Animated, Text, Image} from 'react-native';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import UploadHeader from './UploadHeader';
import styleApp from '../../../style/style';

class HeaderVideoLibrary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const {
      loader,
      isListEmpty,
      selectableMode,
      toggleSelect,
      add,
      addFromCameraRoll,
      numberNotifications,
      AnimatedHeaderValue,
      selectOnly,
      navigation,
      infoUser,
      text,
    } = this.props;
    return (
      <View style={{zIndex: 11}}>
        <HeaderBackButton
          AnimatedHeaderValue={AnimatedHeaderValue}
          textHeader={text}
          inputRange={[20, 25]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={colors.off}
          icon1={
            selectOnly
              ? 'chevron-left'
              : infoUser.picture
              ? infoUser.picture
              : 'profileFooter'
          }
          sizeIcon1={selectOnly ? 23 : infoUser.picture ? 40 : 23}
          clickButton1={() =>
            selectOnly ? navigation.goBack() : navigation.navigate('MorePage')
          }
          typeIcon1={selectOnly ? 'font' : infoUser.picture ? 'image' : 'moon'}
          // iconOffset={selectableMode && !selectOnly && 'user-plus'}
          //  typeIconOffset="font"
          //   sizeIconOffset={16}
          //   colorIconOffset={colors.title}
          //  clickButtonOffset={() => share()}

          clickButton2={() => addFromCameraRoll({})}
          icon2={'plus'}
          typeIcon2={'font'}
          sizeIcon2={24}
        />

        <UploadHeader />
      </View>
    );
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
)(HeaderVideoLibrary);
