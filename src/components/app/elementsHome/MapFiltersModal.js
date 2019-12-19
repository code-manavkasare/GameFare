import {StyleSheet, Keyboard, Dimensions, View, Animated} from 'react-native';
import {Calendar} from 'react-native-calendars';
import React, {Component} from 'react';
import moment from 'moment';
import equal from 'fast-deep-equal';

import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ScrollView from '../../layout/scrollViews/ScrollView';
import Button from '../../layout/buttons/Button';
import {Grid, Row, Col} from 'react-native-easy-grid';

const {height, width} = Dimensions.get('screen');

export default class MapFiltersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startingDay: {},
      markedDates: {},
      daySelectedStart: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    this.setState({
      daySelectedStart:
        this.props.navigation.getParam('startDate') === ''
          ? moment().format('YYYY-MM-DD')
          : moment(this.props.navigation.getParam('endDate')).format(
              'YYYY-MM-DD',
            ),
    });
  }
  selectDay(day, date, markedDates) {
    this.setState({
      [markedDates]: {
        [day.dateString]: {selected: true, selectedColor: colors.primary},
      },
      startingDay: day,
    });
    console.log(this.state.startingDay, this.state);
  }
  calendar(date, markedDates) {
    return (
      <Calendar
        minDate={new Date()}
        markedDates={this.state[markedDates]}
        onDayPress={(day) => this.selectDay(day, date, markedDates)}
        monthFormat={'MMMM'}
        hideExtraDays={true}
        firstDay={1}
        style={{height: 340, marginLeft: -5}}
        theme={{
          base: {width: 20, height: 10, justifyContent: 'center'},
          textMonthFontWeight: 'bold',
          textDayFontSize: 14,
          textMonthFontSize: 14,
          todayTextColor: colors.primary,
          arrowColor: colors.title,
          textDayHeaderFontSize: 14,
          week: {
            marginTop: 0,
            height: 10,
            flexDirection: 'row',
            justifyContent: 'space-around',
          },
          textDayFontFamily: 'OpenSans-Regular',
          textMonthFontFamily: 'OpenSans-Regular',
          textDayHeaderFontFamily: 'OpenSans-Regular',
          textTodayFontFamily: 'OpenSans-Regular',
        }}
      />
    );
  }
  async setPart(state, val) {
    await this.setState({[state]: val});
    return true;
  }

  styleTickFree(free) {
    if (free) return styles.tickBox;
    return styles.tickBoxOff;
  }

  dateFields() {
    return (
      <View style={{marginLeft: 0, width: width}}>
        <View style={styleApp.marginView}>
          {this.calendar('daySelectedStart')}
        </View>
      </View>
    );
  }
  async submit() {
    if (equal(this.state.startingDay, {})) {
      this.props.navigation.state.params.onGoBack({});
    } else {
      this.props.navigation.state.params.onGoBack({
        startingDay: this.state.startingDay,
      });
    }
    this.props.navigation.goBack();
  }
  render() {
    return (
      <View style={styles.content}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          close={() =>
            this.props.navigation.navigate(
              this.props.navigation.getParam('pageFrom'),
            )
          }
          textHeader={'Date'}
          inputRange={[5, 10]}
          loader={this.state.loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1={
            this.props.navigation.getParam('pageFrom') == 'LocationSelect'
              ? 'arrow-left'
              : 'times'
          }
          clickButton1={() =>
            this.props.navigation.navigate(
              this.props.navigation.getParam('pageFrom'),
            )
          }
        />

        <ScrollView
          style={{marginTop: sizes.heightHeaderHome}}
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.dateFields.bind(this)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={sizes.heightFooterBooking + 70}
          showsVerticalScrollIndicator={false}
        />

        <View style={styleApp.footerBooking}>
          <View
            style={{marginLeft: 20, width: width - 40, backgroundColor: 'red'}}>
            <Row style={{backgroundColor: 'red'}}>
              <Col size={45}>
                <Button
                  backgroundColor={'white'}
                  onPressColor={colors.off}
                  text={'Reset filters'}
                  textButton={{color: colors.green}}
                  click={() => this.submit()}
                />
              </Col>
              <Col size={5}></Col>
              <Col size={45}>
                <Button
                  backgroundColor={'primary'}
                  onPressColor={colors.primary2}
                  text={'Apply'}
                  click={() => this.submit()}
                />
              </Col>
            </Row>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.white,
    top: 0,
    flex: 1,
    borderTopWidth: 0,
    borderColor: colors.off,
    width: width,
  },
});
