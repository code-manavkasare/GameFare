import React, {Component} from 'react';
import {connect} from 'react-redux';
import {navigate, goBack} from '../../../../../../NavigationService';

import colors from '../../../../style/colors';
import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';

import {createInviteToAppBranchUrl} from '../../../../database/branch';

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
    const {AnimatedHeaderValue, navigation} = this.props;

    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={'Chat'}
        inputRange={[0, 0]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={0}
        initialBorderWidth={1}
        iconOffset={'bell'}
        typeIconOffset="font"
        sizeIconOffset={24}
        colorIconOffset={colors.title}
        clickButtonOffset={() => navigate('NotificationPage')}
        icon2={'edit'}
        typeIcon2="font"
        sizeIcon2={21}
        colorIcon2={colors.title}
        clickButton2={async () => {
          const branchLink = await createInviteToAppBranchUrl();
          navigate('UserDirectory', {
            action: 'message',
            branchLink,
          });
        }

        }
        icon1={'chevron-left'}
        sizeIcon1={21}
        colorIcon1={colors.title}
        typeIcon1={'font'}
        clickButton1={() => navigation.goBack()}
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
