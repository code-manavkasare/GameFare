import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import {createEventAction} from '../../../actions/createEventActions';

const {height, width} = Dimensions.get('screen');
import {Col, Row} from 'react-native-easy-grid';
import Button from '../../layout/buttons/Button';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import ButtonColor from '../../layout/Views/Button';
import ScrollView from '../../layout/scrollViews/ScrollView';
import ExpandableCard from '../../layout/cards/ExpandableCard';
import Switch from '../../layout/switch/Switch';
import AllIcons from '../../layout/icons/AllIcons';
import AsyncImage from '../../layout/image/AsyncImage';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';

class Page1 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.translateYFooter = new Animated.Value(0);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.translateXFooter = new Animated.Value(0);
  }
  componentDidMount() {
    if (this.props.step1.level == -1) {
      this.props.createEventAction('setStep1', {
        level: this.props.navigation.getParam('sport').level.list[0].value,
      });
    }
  }
  async setStateSwitch(state, val) {
    await this.props.createEventAction('setStep1', {[state]: val});
    return true;
  }
  switch(textOn, textOff, state, translateXComponent0, translateXComponent1) {
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        translateXTo={width / 2 - 20}
        height={50}
        translateXComponent0={translateXComponent0}
        translateXComponent1={translateXComponent1}
        state={this.props.step1[state]}
        setState={(val) => this.setStateSwitch(state, val)}
      />
    );
  }
  levelFilter(sport) {
    return (
      <View style={{borderBottomWidth: 1, borderColor: colors.off}}>
        <ExpandableCard
          list={sport.level.list}
          valueSelected={this.props.step1.level}
          tickFilter={(data) =>
            this.props.createEventAction('setStep1', {level: data.value})
          }
        />
      </View>
    );
  }
  levelOption() {
    return (
      <View style={{borderBottomWidth: 1, borderColor: colors.off}}>
        <ExpandableCard
          list={this.props.listLevelOption}
          valueSelected={this.props.step1.levelOption}
          tickFilter={(data) =>
            this.props.createEventAction('setStep1', {levelOption: data.value})
          }
        />
      </View>
    );
  }
  gender() {
    return (
      <View style={{borderBottomWidth: 1, borderColor: colors.off}}>
        <ExpandableCard
          list={this.props.listGender}
          valueSelected={this.props.step1.gender}
          tickFilter={(data) =>
            this.props.createEventAction('setStep1', {gender: data.value})
          }
        />
      </View>
    );
  }
  plusMinus(state, maxValue, increment, minValue, icon) {
    var text = state;
    if (this.props.step1[state] == 1) text = state + 's';
    return (
      <Row
        style={{
          paddingLeft: 20,
          paddingRight: 20,
          height: 60,
          borderBottomWidth: 1,
          borderColor: colors.off,
        }}>
        <Col size={15} style={styleApp.center}>
          <AllIcons name={icon} color={colors.greyDark} size={15} type="font" />
        </Col>
        <Col size={60} style={[styleApp.center2, {paddingLeft: 10}]}>
          <Text style={styleApp.input}>
            {this.props.step1[state]}{' '}
            {this.props.step1[state] == 1 ? 'player' : 'players'}{' '}
            <Text style={styleApp.regularText}>(total)</Text>
          </Text>
        </Col>
        <Col
          size={15}
          style={styleApp.center}
          activeOpacity={0.7}
          onPress={() => {
            if (this.props.step1[state] != minValue) {
              this.props.createEventAction('setStep1', {
                [state]: this.props.step1[state] - increment,
              });
            }
          }}>
          <AllIcons name={'minus'} color={colors.title} size={15} type="font" />
        </Col>

        <Col
          size={10}
          style={styleApp.center}
          activeOpacity={0.7}
          onPress={() => {
            if (this.props.step1[state] != maxValue) {
              this.props.createEventAction('setStep1', {
                [state]: this.props.step1[state] + increment,
              });
            }
          }}>
          <AllIcons name={'plus'} color={colors.title} size={15} type="font" />
        </Col>
      </Row>
    );
  }

  async setGroups(groups) {
    await this.props.createEventAction('setStep1', {groups: groups});
    this.props.navigation.navigate('CreateEvent1');
  }

  rowGroup(group, i) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{padddingBottom: 10}}>
              <Col size={15} style={styleApp.center2}>
                <AsyncImage
                  style={{width: '100%', height: 40, borderRadius: 3}}
                  mainImage={group.pictures[0]}
                  imgInitial={group.pictures[0]}
                />
              </Col>
              <Col size={75} style={[styleApp.center2, {paddingLeft: 15}]}>
                <Text style={styleApp.text}>{group.info.name}</Text>
                <Text style={[styleApp.smallText, {fontSize: 12}]}>
                  {group.info.sport.charAt(0).toUpperCase() +
                    group.info.sport.slice(1)}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                <AllIcons
                  name="check"
                  type="mat"
                  size={20}
                  color={colors.green}
                />
              </Col>
            </Row>
          );
        }}
        click={() => true}
        color="white"
        style={[
          {
            marginTop: 10,
            flex: 1,
            paddingLeft: 20,
            paddingRight: 20,
            height: 60,
          },
        ]}
        onPressColor="white"
      />
    );
  }
  page1(sport) {
    return (
      <View style={{marginTop: 10, marginLeft: 0, width: width}}>
        <View style={[styleApp.marginView, {marginBottom: 15}]}>
          {this.switch('Open access', 'Invite only', 'private')}
        </View>

        {this.levelFilter(sport)}
        {this.props.step1.level != 0 ? this.levelOption() : null}

        {this.plusMinus('numberPlayers', 200, 1, 1, 'user-check')}
        {this.gender()}

        {Object.values(this.props.step1.groups).length != 0
          ? Object.values(this.props.step1.groups).map((group, i) =>
              this.rowGroup(group, i),
            )
          : null}
      </View>
    );
  }
  next(sport) {
    return this.props.navigation.navigate('CreateEvent2', {sport: sport});
  }
  render() {
    if (this.props.step1.level == -1) return null;

    return (
      <View style={[styleApp.stylePage, {borderLeftWidth: 1}]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Access settings'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() =>
            this.page1(this.props.navigation.getParam('sport'))
          }
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styleApp.footerBooking, styleApp.marginView]}>
          <Button
            text="Next"
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            enabled={true}
            loader={this.state.loader}
            click={() => this.next(this.props.navigation.getParam('sport'))}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    userConnected: state.user.userConnected,
    userID: state.user.userID,
    step1: state.createEventData.step1,
    listGender: state.createEventData.listGender,
    listLevelOption: state.createEventData.listLevelOption,
  };
};

export default connect(mapStateToProps, {createEventAction})(Page1);
