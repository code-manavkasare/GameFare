import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {connect} from 'react-redux';

import colors from '../../../style/colors';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {
  userIDSelector,
  userInfoSelector,
} from '../../../../store/selectors/user';

class ClubsHeader extends Component {
  static propTypes = {
    loader: PropTypes.bool,
    AnimatedHeaderValue: PropTypes.any,
    navigation: PropTypes.object,
    infoUser: PropTypes.object,
    text: PropTypes.string,
  };
  static defaultProps = {};

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
      component: 'ClubsHeader',
    });
  }
  render() {
    const {
      loader,
      AnimatedHeaderValue,
      navigation,
      infoUser,
      text,
    } = this.props;

    return (
      <View style={{zIndex: 11}}>
        <HeaderBackButton
          AnimatedHeaderValue={AnimatedHeaderValue}
          textHeader={text}
          inputRange={[250, 250]}
          loader={loader}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={0}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={infoUser?.picture ? infoUser?.picture : 'profileFooter'}
          sizeIcon1={infoUser.picture ? 40 : 23}
          clickButton1={() => navigation.navigate('VideoLibrary')}
          typeIcon1={infoUser.picture ? 'image' : 'moon'}
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

export default connect(mapStateToProps)(ClubsHeader);
