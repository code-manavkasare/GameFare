import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';

import CardSelect from '../../layout/cards/CardSelect';

import ScrollView from '../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import {coachAction} from '../../../actions/coachActions';

import sizes from '../../style/sizes';
import colors from '../../style/colors'
import styleApp from '../../style/style';

class CoachingType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      options: [
        {
          value: 'live',
          label: 'Live session',
          action: 'StreamPageCoaching',
          icon: {name: 'play', type: 'font'},
        },
        {
          value: 'post',
          label: 'Post game review',
          action: 'StreamPageCoaching',
          icon: {name: 'undo-alt', type: 'font'},
        },
      ],
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  recordType() {
    const {navigate} = this.props.navigation;
    const {coachSession} = this.props.coach;
    const {options} = this.state;
    const {coachAction} = this.props;
    const {typeCoaching} = coachSession;

    return (
      <View>
        <View style={styleApp.marginView}>
          <Text style={[styleApp.title, {marginBottom: 15}]}>
            What kind of coaching session would you like?
          </Text>
        </View>
        {options.map((option, i) => (
          <CardSelect
            key={i}
            marginOnScrollView={false}
            selected={typeCoaching === option.value}
            option={option}
            iconRight={{type: 'mat', name: 'keyboard-arrow-right'}}
            click={async (option) => {
              await coachAction('setCoachSession', {
                typeCoaching: option.value,
              });
              return navigate(option.action);
            }}
          />
        ))}
      </View>
    );
  }

  render() {
    const {goBack,dismiss} = this.props.navigation;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => dismiss()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.recordType()}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />
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

export default connect(mapStateToProps, {coachAction})(CoachingType);
