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
      toggleSelectable,
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
          initialBorderColorHeader={colors.white}
          icon1={
            selectOnly
              ? 'chevron-left'
              : infoUser.picture
              ? infoUser.picture
              : 'profileFooter'
          }
          sizeIcon1={selectOnly ? 21 : infoUser.picture ? 40 : 23}
          clickButton1={() =>
            selectOnly ? navigation.goBack() : navigation.navigate('MorePage')
          }
          typeIcon1={selectOnly ? 'font' : infoUser.picture ? 'image' : 'moon'}
          icon2={selectOnly ? null : !selectableMode ? 'text' : 'text'}
          text2={!selectableMode ? 'Select' : 'Cancel'}
          typeIcon2="font"
          sizeIcon2={22}
          colorIcon2={colors.title}
          clickButton2={() => toggleSelectable()}
          clickButtonOffset={() => addFromCameraRoll({})}
          iconOffset={!selectableMode && 'plus'}
          typeIconOffset={'font'}
          sizeIconOffset={22}
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
