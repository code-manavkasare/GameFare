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
      filters: {
        startingDay: {},
      },
      markedDates: {},
      daySelectedStart: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {route} = this.props;
    const {filters, endDate, startDate} = route.params;
    const markedDates = filters.startingDay
      ? {
          [filters.startingDay.dateString]: {
            selected: true,
            selectedColor: colors.primary,
          },
        }
      : {};

    this.setState({
      daySelectedStart:
        startDate === ''
          ? moment().format('YYYY-MM-DD')
          : moment(endDate).format('YYYY-MM-DD'),
      filters,
      markedDates,
    });
  }
  selectDay(day) {
    this.setState({
      markedDates: {
        [day.dateString]: {selected: true, selectedColor: colors.primary},
      },
      filters: {startingDay: day},
    });
  }
  calendar() {
    const daySelected = this.state.filters.startingDay
      ? this.state.filters.startingDay.dateString
      : false;
    return (
      <Calendar
        current={daySelected}
        minDate={new Date()}
        markedDates={this.state.markedDates}
        onDayPress={(day) => this.selectDay(day)}
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

  resetFilters = () => {
    this.setState({filters: {}, markedDates: {}});
  };

  dateFields() {
    return (
      <View style={{marginLeft: 0, width: width}}>
        <View style={styleApp.marginView}>
          {this.calendar('daySelectedStart', this.state.startingDay)}
        </View>
      </View>
    );
  }
  async submit() {
    const {filters} = this.state;
    if (equal(filters, {})) {
      this.props.navigation.state.params.onGoBack({});
    } else {
      this.props.navigation.state.params.onGoBack({
        startingDay: filters.startingDay,
      });
    }
    this.props.navigation.goBack();
  }
  render() {
    const {route} = this.props;
    const {pageFrom} = route.params;
    return (
      <View style={styles.content}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          close={() => this.props.navigation.navigate(pageFrom)}
          textHeader={'Date'}
          inputRange={[5, 10]}
          loader={this.state.loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1={pageFrom === 'LocationSelect' ? 'arrow-left' : 'times'}
          clickButton1={() => this.props.navigation.navigate(pageFrom)}
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
                  click={() => this.resetFilters()}
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
