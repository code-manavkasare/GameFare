import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {connect} from 'react-redux';

import {selectVideosFromCameraRoll} from '../../../functions/videoManagement.js';
import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import UploadHeader from './UploadHeader';
import {boolShouldComponentUpdate} from '../../../functions/redux';

class HeaderVideoLibrary extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'HeaderVideoLibrary',
    });
  }
  render() {
    const {
      loader,
      selectableMode,
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
          inputRange={[15, 20]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={0}
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
          clickButtonOffset={() => selectVideosFromCameraRoll()}
          iconOffset={!selectableMode && 'plus'}
          typeIconOffset={'font'}
          sizeIconOffset={22}
        />

        <UploadHeader
          openQueue={() => {
            navigation.navigate('UploadQueueList');
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderVideoLibrary);
