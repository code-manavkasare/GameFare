import React, {Component} from 'react';
import {View, Text, Animated} from 'react-native';
import {connect} from 'react-redux';

import CardSelect from '../../layout/cards/CardSelect';

import ScrollView from '../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import Button from '../../layout/buttons/Button';
import AllIcons from '../../layout/icons/AllIcons';
import {coachAction} from '../../../actions/coachActions';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

class SaveCoachSession extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  saveCoachSession() {
    const {navigate} = this.props.navigation;
    const {coachSession} = this.props.coach;
    const {coachAction} = this.props;

    return (
      <View>
        <View style={styleApp.marginView}>
          <View style={styleApp.center}>
            <AllIcons name="image" type="font" color={colors.title} size={50} />
            <Text style={[styleApp.title, {marginTop: 10, marginBottom: 20}]}>
              Save session
            </Text>
          </View>
        </View>

        <CardSelect
          marginOnScrollView={false}
          option={{
            label: 'Share your session',
            icon: {name: 'share', type: 'font'},
          }}
          iconRight={{type: 'mat', name: 'keyboard-arrow-right'}}
          click={(value) => true}
        />
      </View>
    );
  }

  render() {
    const {goBack, dismiss} = this.props.navigation;
    const {loader} = this.state;
    const {navigate} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          // icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={'text'}
          text2={'Skip'}
          icon1='times'
          clickButton1={() => goBack()}
          clickButton2={() => navigate('Stream')}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.saveCoachSession()}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />

        <View style={styleApp.footerBooking}>
          <Button
            backgroundColor="green"
            onPressColor={colors.greenClick}
            styleButton={styleApp.marginView}
            enabled={true}
            text="Save"
            loader={false}
            click={() => navigate('Stream')}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {coachAction})(SaveCoachSession);
