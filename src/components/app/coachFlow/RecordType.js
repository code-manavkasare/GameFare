import React, {Component} from 'react';
import {View, Text, Animated} from 'react-native';
import {connect} from 'react-redux';

import CardSelect from '../../layout/cards/CardSelect';

import ScrollView from '../../layout/scrollViews/ScrollView';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import {coachAction} from '../../../actions/coachActions';
import {createCoachSession} from '../../functions/coach'

import sizes from '../../style/sizes';
import styleApp from '../../style/style';

class RecordType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      options: {
        'me':{
          value: 'me',
          label: 'Film for my own review',
          action: 'StreamPageCoaching',
          loader:false,
          // click:async (coachSession) => createCoachSession(coachSession),
          icon: {name: 'video', type: 'font'},
        },
        'coach':{
          value: 'coach',
          label: 'Get help from a coach',
          action: 'CoachingType',
          loader:false,
          icon: {name: 'bullhorn', type: 'font'},
        },
      },
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  recordType() {
    const {navigate} = this.props.navigation;
    const {coachSession} = this.props.coach;
    const {options} = this.state;
    const {coachAction} = this.props;
    const {typeRecord} = coachSession;

    return (
      <View>
        <View style={styleApp.marginView}>
          <Text style={[styleApp.title, {marginBottom: 15}]}>
            What are you looking for with the recording?
          </Text>
        </View>
        {Object.values(options).map((option, i) => (
          <CardSelect
            key={i}
            marginOnScrollView={false}
            dataPromise={coachSession}
            selected={typeRecord === option.value}
            option={option}
            iconRight={{name:'keyboard-arrow-right',type:'mat'}}
            click={async () => {
              if (option.click) {
                await this.setState((prevState) => {
                  return {
                    options:{
                      ...prevState.options,
                      [option.value]:{
                        ...prevState.options[option.value],
                        loader:true,
                      },
                    },
                  };
                });
              }
              return coachAction('setCoachSession', {
                typeRecord: option.value,
              });
            }}
            next={async () => { 
              if (option.click) {
                await this.setState((prevState) => {
                  return {
                    options:{
                      ...prevState.options,
                      [option.value]:{
                        ...prevState.options[option.value],
                        loader:false,
                      },
                    },
                  };
                });
              }
              return navigate(option.action);
            }}
          />
        ))}
      </View>
    );
  }

  render() {
    const {dismiss} = this.props.navigation;
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

export default connect(mapStateToProps, {coachAction})(RecordType);
