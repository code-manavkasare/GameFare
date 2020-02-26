import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {createChallengeAction} from '../../../actions/createChallengeActions';
import Slider from '@react-native-community/slider';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';

import Switch from '../../layout/switch/Switch';
import Button from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import RowPlusMinus from '../../layout/rows/RowPlusMinus';

import ScrollView from '../../layout/scrollViews/ScrollView';
import ExpandableCard from '../../layout/cards/ExpandableCard';
import AllIcons from '../../layout/icons/AllIcons';
import Communications from 'react-native-communications';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import isEqual from 'lodash.isequal';

class PickInfos extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    if (this.props.info.sport === '') {
      console.log('le setsport ', this.props.sports);
      this.setSport(this.props.sports[0]);
    }
  }
  async setSport(data) {
    console.log('setSport la', data);
    await this.props.createChallengeAction('setInfo', {
      sport: data.value,
      format: data.formats[0].value,
    });
    return true;
  }

  async setFormat(data) {
    await this.props.createEventAction('setInfo', {
      format: data.value,
    });
    return true;
  }

  sports() {
    return (
      <View style={{borderColor: colors.off, borderBottomWidth: 1}}>
        <ExpandableCard
          list={this.props.sports}
          valueSelected={this.props.info.sport}
          image={true}
          tickFilter={(value) => this.setSport(value)}
        />
      </View>
    );
  }
  formats(sport) {
    return (
      <View style={{borderColor: colors.off, borderBottomWidth: 1}}>
        <ExpandableCard
          list={sport.formats}
          valueSelected={this.props.info.format}
          tickFilter={(value) => this.setFormat(value)}
        />
      </View>
    );
  }
  openAlertInfo(title, info) {
    this.props.navigation.navigate('Alert', {
      close: true,
      textButton: 'Got it!',
      title: title,
      subtitle: info,
      icon: (
        <AllIcons
          type={'font'}
          name={'info-circle'}
          color={colors.secondary}
          size={17}
        />
      ),
    });
  }
  switch(textOn, textOff, state, click) {
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        translateXTo={width / 2 - 20}
        height={50}
        state={this.props.step0[state]}
        setState={(val) => click(val)}
      />
    );
  }
  amountPicker(price, sport) {
    return (
      <RowPlusMinus
        title="Amount"
        alert={sport.challenge.amount.alert}
        add={(value) =>
          this.props.createChallengeAction('setPrice', {
            amount: Number(value),
          })
        }
        value={price.amount}
        textValue={'$' + price.amount}
        increment={sport.challenge.amount.increment}
      />
    );
  }
  amountOdds(price, sport) {
    return (
      <RowPlusMinus
        title="Money multiple"
        alert={sport.challenge.odds.alert}
        add={(value) =>
          this.props.createChallengeAction('setPrice', {
            odds: Number(value.toFixed(1)),
          })
        }
        value={price.odds}
        textValue={price.odds}
        increment={sport.challenge.odds.increment}
      />
    );
  }
  pickInfos(sport, format, price) {
    return (
      <View>
        {this.sports()}
        {this.formats(sport)}

        <View style={[styleApp.marginView, {marginTop: 30}]}>
          <Text style={styleApp.title}>Challenge</Text>

          {this.amountPicker(price, sport)}
          {this.amountOdds(price, sport)}

          <Text style={[styleApp.title, {marginTop: 20}]}>Payout</Text>
          <Text style={[styleApp.text, {marginTop: 10}]}>
            You will receive{' '}
            <Text style={{color: colors.green, fontSize: 20}}>
              {' '}
              ${(price.amount * price.odds).toFixed(1)}{' '}
            </Text>{' '}
            if you win the challenge. Your oponent will pay{' '}
            <Text style={{color: colors.primary, fontSize: 20}}>
              {' '}
              ${price.amount * Math.max(0, price.odds - 1).toFixed(1)}{' '}
            </Text>{' '}
            to accept the challenge.
          </Text>
        </View>
      </View>
    );
  }
  conditionOn() {
    return true;
  }
  render() {
    const {info, price} = this.props;
    console.log('render pickinfo', info);
    if (info.sport === '') return null;
    var sport = this.props.sports.filter(
      (sport) => sport.value === info.sport,
    )[0];

    const format = Object.values(sport.formats).filter(
      (format) => format.value === info.format,
    )[0];

    const {dismiss, goBack} = this.props.navigation;

    return (
      <View style={[styleApp.stylePage]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Create your challenge'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.pickInfos(sport, format, price)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={180}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styleApp.footerBooking, styleApp.marginView]}>
          {this.conditionOn() ? (
            <Button
              text="Next"
              backgroundColor={'green'}
              onPressColor={colors.greenLight}
              enabled={this.conditionOn()}
              loader={this.state.loader}
              click={() =>
                this.props.navigation.navigate('PickAddress', {
                  sport: sport,
                })
              }
            />
          ) : (
            <Button
              icon={'Next'}
              text="Next"
              backgroundColor={'green'}
              styleButton={{borderWidth: 1, borderColor: colors.grey}}
              disabled={true}
              onPressColor={colors.greenLight}
              loader={false}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    infoUser: state.user.infoUser.userInfo,
    info: state.createChallengeData.info,
    price: state.createChallengeData.price,
  };
};

export default connect(mapStateToProps, {createChallengeAction})(PickInfos);
