import React, {Component} from 'react';
import {bool, any, object, string} from 'prop-types';
import {View} from 'react-native';
import {connect} from 'react-redux';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userInfoSelector} from '../../../../store/selectors/user';

class ClubsHeader extends Component {
  static propTypes = {
    loader: bool,
    AnimatedHeaderValue: any,
    navigation: object,
    infoUser: object,
    text: string,
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
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(ClubsHeader);
