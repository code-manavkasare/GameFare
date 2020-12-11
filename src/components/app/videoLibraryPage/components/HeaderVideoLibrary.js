import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {connect} from 'react-redux';

import {selectVideosFromCameraRoll} from '../../../functions/videoManagement.js';
import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import UploadHeader from './UploadHeader';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {
  userIDSelector,
  userInfoSelector,
} from '../../../../store/selectors/user';

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
      selectVideosFromCameraRoll,
      userID,
    } = this.props;

    return (
      <View style={{zIndex: 11}}>
        <HeaderBackButton
          AnimatedHeaderValue={AnimatedHeaderValue}
          textHeader={text}
          inputRange={[200, 280]}
          loader={loader}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={0}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'times'}
          sizeIcon1={17}
          clickButton1={() => navigation.goBack()}
          typeIcon1={'font'}
          backgroundColorIcon1={'transparent'}
          icon2={selectOnly ? null : !selectableMode ? 'text' : 'text'}
          text2={!selectableMode ? 'Select' : 'Cancel'}
          animateIcon2
          animateIconOffset
          typeIcon2="font"
          sizeIcon2={22}
          marginTop={5}
          colorIcon2={colors.title}
          clickButton2={toggleSelectable}
          clickButtonOffset={selectVideosFromCameraRoll}
          iconOffset={!selectableMode && 'plus'}
          typeIconOffset={'font'}
          sizeIconOffset={17}
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
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(HeaderVideoLibrary);
