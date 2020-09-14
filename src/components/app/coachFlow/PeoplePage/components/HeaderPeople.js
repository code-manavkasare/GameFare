import React, {Component} from 'react';
import {connect} from 'react-redux';
import {navigate} from '../../../../../../NavigationService';

import colors from '../../../../style/colors';
import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';

class HeaderListStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  header = () => {
    const {AnimatedHeaderValue, infoUser} = this.props;

    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={'People'}
        inputRange={[40, 50]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={0}
        initialBorderWidth={1}
        icon2={'comment-alt'}
        typeIcon2="font"
        sizeIcon2={24}
        colorIcon2={colors.title}
        clickButton2={() => navigate('Groups')}
        icon1={infoUser.picture ? infoUser.picture : 'profileFooter'}
        sizeIcon1={infoUser.picture ? 31 : 23}
        colorIcon1={colors.title}
        typeIcon1={infoUser.picture ? 'image' : 'moon'}
        clickButton1={() => navigate('MorePage')}
      />
    );
  };

  render() {
    return this.header();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderListStream);
