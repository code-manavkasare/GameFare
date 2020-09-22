import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Text, View, Share} from 'react-native';
import {navigate, goBack} from '../../../../../../NavigationService';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
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
    const {
      AnimatedHeaderValue,
      infoUser,
      modal,
      numberNotifications,
      branchLink,
    } = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={''}
        inputRange={[40, 50]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        loader={loader}
        initialBorderColorHeader={colors.white}
        initialTitleOpacity={1}
        initialBorderWidth={1}
        icon2={branchLink && 'share'}
        typeIcon2={'moon'}
        sizeIcon2={24}
        colorIcon2={colors.title}
        clickButton2={() => Share.share({url: branchLink})}
        icon1={'comment-alt'}
        sizeIcon1={23}
        colorIcon1={colors.title}
        badgeIcon1={
          numberNotifications !== 0 && (
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
        typeIcon1={'font'}
        clickButton1={() => navigate('Groups')}
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
)(HeaderListStream);
