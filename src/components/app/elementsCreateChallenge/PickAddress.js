import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {createChallengeAction} from '../../../actions/createChallengeActions';

const {height, width} = Dimensions.get('screen');
import {loadImageMap} from '../../functions/location';
import {Col, Row, Grid} from 'react-native-easy-grid';
import ButtonColor from '../../layout/Views/Button';
import Button from '../../layout/buttons/Button';

import ScrollView from '../../layout/scrollViews/ScrollView';
import AllIcons from '../../layout/icons/AllIcons';
import Loader from '../../layout/loaders/Loader';
import DateEvent from '../elementsEventCreate/DateEvent';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import AllIcon from '../../layout/icons/AllIcons';

class PickAddress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      image: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
  ligneButton(iconLeft, componentMiddle, iconRight, click, conditionCheck) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row style={{paddingTop: 23, paddingBottom: 23}}>
              <Col size={15} style={[styleApp.center]}>
                <AllIcons
                  name={iconLeft}
                  size={16}
                  color={colors.greyDark}
                  type="font"
                />
              </Col>
              <Col size={65} style={[styleApp.center2, {paddingLeft: 10}]}>
                {componentMiddle}
              </Col>
              <Col size={20} style={styleApp.center}>
                {iconRight == null ? null : conditionCheck ? (
                  <AllIcons
                    name={'check'}
                    type="font"
                    size={14}
                    color={colors.green}
                  />
                ) : (
                  <AllIcons
                    name={iconRight}
                    type="font"
                    size={14}
                    color={colors.title}
                  />
                )}
              </Col>
            </Row>
          );
        }}
        click={() => click()}
        color={'white'}
        style={[{flex: 1, borderBottomWidth: 1, borderColor: colors.off}]}
        onPressColor={colors.off}
      />
    );
  }
  inputName() {
    return (
      <TextInput
        style={styleApp.input}
        placeholder="Add challenge name"
        returnKeyType={'done'}
        ref={(input) => {
          this.nameInput = input;
        }}
        underlineColorAndroid="rgba(0,0,0,0)"
        autoCorrect={true}
        placeholderTextColor={colors.grey}
        onChangeText={(text) =>
          this.props.createChallengeAction('setInfo', {name: text})
        }
        value={this.props.createChallengeData.info.name}
      />
    );
  }
  inputInstruction() {
    return (
      <TextInput
        style={styleApp.input}
        placeholder="Parking instructions, court / pitch directions ... (optional)"
        returnKeyType={'done'}
        ref={(input) => {
          this.instructionInput = input;
        }}
        underlineColorAndroid="rgba(0,0,0,0)"
        autoCorrect={true}
        multiline={true}
        numberOfLines={6}
        blurOnSubmit={true}
        placeholderTextColor={colors.grey}
        onChangeText={(text) =>
          this.props.createChallengeAction('setInfo', {instructions: text})
        }
        value={this.props.createChallengeData.info.instructions}
      />
    );
  }
  locationText(location) {
    return (
      <Text
        style={
          !location.address
            ? {...styleApp.input, color: colors.grey}
            : styleApp.input
        }>
        {!location.address ? 'Add challenge address' : location.address}
      </Text>
    );
  }
  async setLocation(data) {
    await this.props.createChallengeAction('setLocation', data);
    await this.props.createChallengeAction('setInfo', {image: 'loading'});
    await this.props.navigation.navigate('PickAddress');
    return this.loadImage(data);
  }
  async loadImage(location) {
    var image = await loadImageMap(location);
    return this.props.createChallengeAction('setInfo', {image: image});
  }
  async setDate(data) {
    console.log('setDate', {
      end: data.endDate,
      start: data.startDate,
      recurrence: data.recurrence,
    });
    await this.props.createChallengeAction('setDate', {
      end: data.endDate,
      start: data.startDate,
      recurrence: data.recurrence,
    });
    return this.props.navigation.navigate('PickAddress');
  }
  dateTime(start, end, recurrence) {
    return (
      <View>
        <DateEvent start={start} end={end} />
        {recurrence !== '' ? (
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            {recurrence.charAt(0).toUpperCase() + recurrence.slice(1)}{' '}
            recurrence
          </Text>
        ) : null}
      </View>
    );
  }
  date() {
    const {date} = this.props.createChallengeData;
    if (date.start === '')
      return (
        <Text style={[styleApp.input, {color: colors.grey}]}>
          Add date and time
        </Text>
      );
    return this.dateTime(date.start, date.end, date.recurrence);
  }
  pickAddress() {
    const {info, location, date} = this.props.createChallengeData;
    return (
      <View style={{marginTop: 0, marginLeft: 0, width: width, paddingTop: 0}}>
        {info.image === 'loading' ? (
          <View style={[styleApp.center, styles.placeHolderImage]}>
            <Loader color={'green'} size={20} />
          </View>
        ) : info.image !== '' ? (
          <View style={[{height: 120}]}>
            <View style={[styleApp.center, styles.viewImage]}>
              <AllIcon
                name="map-marker-alt"
                color={colors.green}
                size={20}
                type={'font'}
                style={{position: 'absolute'}}
              />
            </View>

            <Image source={{uri: info.image}} style={styleApp.fullSize} />
          </View>
        ) : null}
        {this.ligneButton(
          'map-marker-alt',
          this.locationText(location),
          'plus',
          () =>
            this.props.navigation.navigate('Location', {
              location: location,
              pageFrom: 'PickAddress',
              onGoBack: (data) => this.setLocation(data),
            }),
          location.address,
        )}

        {this.ligneButton(
          'ribbon',
          this.inputName(),
          'plus',
          () => this.nameInput.focus(),
          info.name !== '',
        )}

        {this.ligneButton(
          'calendar-alt',
          this.date(),
          'plus',
          () =>
            this.props.navigation.navigate('Date', {
              startDate: date.start,
              endDate: date.end,
              recurrence: '',
              close: () => this.props.navigation.navigate('PickAddress'),
              onGoBack: (data) => this.setDate(data),
            }),
          date.start !== '',
        )}
        {this.ligneButton(
          'parking',
          this.inputInstruction(),
          'plus',
          () => this.instructionInput.focus(),
          info.instructions !== '',
        )}
      </View>
    );
  }
  conditionOn() {
    if (
      !this.props.createChallengeData.location.address ||
      this.props.createChallengeData.date.start === '' ||
      this.props.createChallengeData.info.name === ''
    )
      return false;
    return true;
  }
  async next() {
    const groups = Object.values(this.props.step1.groups).reduce(function(
      result,
      item,
    ) {
      result[item.objectID] = false;
      return result;
    },
    {});
    return this.props.navigation.navigate('CreateEvent3', {
      data: {
        date: {
          end: this.props.step2.endDate,
          start: this.props.step2.startDate,
          recurrence: this.props.step2.recurrence,
        },
        info: {
          commission: 0,
          displayInApp: true,
          sport: this.props.step0.sport,
          public: !this.props.step1.private,
          maxAttendance: this.props.step1.numberPlayers,
          name: this.props.step2.name,
          levelFilter: this.props.step1.level,
          levelOption: this.props.step1.levelOption,
          coachNeeded: this.props.step0.coachNeeded,
          gender: this.props.step1.gender,
          instructions: this.props.step2.instructions,
          league: this.props.step0.league,
          rules: this.props.step0.rule,
        },
        images: [this.props.step2.image],
        groups: groups,
        location: this.props.step2.location,
        price: {
          joiningFee: Number(this.props.step0.joiningFee),
        },
        subscribtionOpen: true,
      },
      groups: this.props.step1.groups,
      sport: this.props.navigation.getParam('sport'),
    });
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Challenge information'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.pickAddress.bind(this)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
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
              click={() => this.next()}
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

const styles = StyleSheet.create({
  placeHolderImage: {
    height: 120,
    backgroundColor: colors.off2,
    borderBottomWidth: 1,
    borderColor: colors.off,
  },
  viewImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    createChallengeData: state.createChallengeData,
  };
};

export default connect(mapStateToProps, {createChallengeAction})(PickAddress);
