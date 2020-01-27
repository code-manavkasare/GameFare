import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {eventsAction} from '../../../actions/eventsActions';
import {groupsAction} from '../../../actions/groupsActions';
import {createEventAction} from '../../../actions/createEventActions';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import union from 'lodash/union';

import {createEvent} from '../../functions/createEvent';
const {height, width} = Dimensions.get('screen');
import ScrollView from '../../layout/scrollViews/ScrollView';
import TextField from '../../layout/textField/TextField';

import Button from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';
import DateEvent from './DateEvent';
import firebase from 'react-native-firebase';
import {Col, Row, Grid} from 'react-native-easy-grid';
import AsyncImage from '../../layout/image/AsyncImage';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import AllIcons from '../../layout/icons/AllIcons';

import styleApp from '../../style/style';
import sizes from '../../style/sizes';
import colors from '../../style/colors';

class Page3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.translateYFooter = new Animated.Value(0);
    this.translateXFooter = new Animated.Value(0);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.futureEvents != nextProps.futureEvents) return false;
    return true;
  }
  async componentDidMount() {}
  dateTime(data) {
    return (
      <View>
        <DateEvent start={data.date.start} end={data.date.end} />
      </View>
    );
  }
  sport(sport) {
    return (
      <TextField
        state={sport.text}
        placeHolder={''}
        heightField={50}
        multiline={false}
        editable={false}
        keyboardType={'default'}
        icon={sport.icon}
        typeIcon={sport.typeIcon}
      />
    );
  }
  rowIcon(icon, component, typeIcon, img) {
    return (
      <Row style={{paddingTop: 6, paddingBottom: 6}}>
        <Col size={10} style={styleApp.center}>
          {img ? (
            <AsyncImage
              style={{width: 30, height: 30, borderRadius: 15}}
              mainImage={icon}
              imgInitial={icon}
            />
          ) : (
            <AllIcons
              name={icon}
              size={18}
              type={typeIcon}
              color={colors.grey}
            />
          )}
        </Col>

        <Col size={85} style={[styleApp.center2, {paddingLeft: 23}]}>
          {component}
        </Col>
      </Row>
    );
  }
  title(text) {
    return <Text style={[styleApp.input]}>{text}</Text>;
  }
  rowGroup(group, i) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                <AsyncImage
                  style={{width: '100%', height: 40, borderRadius: 6}}
                  mainImage={group.pictures[0]}
                  imgInitial={group.pictures[0]}
                />
              </Col>
              <Col size={85} style={[styleApp.center2, {paddingLeft: 15}]}>
                <Text style={styleApp.text}>{group.info.name}</Text>
                <Text style={[styleApp.smallText, {fontSize: 12}]}>
                  {group.info.sport.charAt(0).toUpperCase() +
                    group.info.sport.slice(1)}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                {/* <AllIcons name='check' type='mat' size={20} color={colors.green} /> */}
              </Col>
            </Row>
          );
        }}
        click={() => true}
        color="white"
        style={[styles.rowGroup, {marginTop: 10, flex: 1}]}
        onPressColor="white"
      />
    );
  }
  listGroups(groups) {
    if (Object.values(groups).length == 0) return null;
    return (
      <View>
        <View style={[styleApp.divider2, {marginBottom: 10}]} />
        {Object.values(groups).map((group, i) => this.rowGroup(group, i))}
      </View>
    );
  }

  page2(data, sport) {
    var league = Object.values(sport.typeEvent).filter(
      (item) => item.value == data.info.league,
    )[0];
    var level = Object.values(sport.level.list).filter(
      (level) => level.value == data.info.levelFilter,
    )[0];
    var rule = Object.values(league.rules).filter(
      (rule) => rule.value == data.info.rules,
    )[0];
    var levelOption =
      data.info.levelOption == 'equal'
        ? 'only'
        : data.info.levelOption == 'min'
        ? 'and above'
        : 'and below';
    return (
      <View style={[styleApp.marginView, {paddingTop: 15}]}>
        <Row style={{marginBottom: 10}}>
          <Col size={10} style={styleApp.center2}>
            <AllIcons
              name={data.info.public ? 'lock-open' : 'lock'}
              size={18}
              type={'font'}
              color={colors.blue}
            />
          </Col>
          <Col size={65} style={styleApp.center3}>
            <Text
              style={[
                styleApp.text,
                {
                  color: colors.primary,
                  marginTop: 10,
                  fontFamily: 'OpenSans-Bold',
                  fontSize: 18,
                },
              ]}>
              {Number(data.price.joiningFee) == 0
                ? 'Free entry'
                : '$' + data.price.joiningFee}
            </Text>
          </Col>
        </Row>
        <Text style={[styleApp.title, {fontSize: 20}]}>{data.info.name}</Text>
        <View style={[styleApp.divider2, {marginBottom: 10}]} />

        {this.rowIcon(sport.icon, this.title(sport.text), 'font', true)}
        {this.rowIcon(league.icon, this.title(league.text), 'font', true)}
        {this.rowIcon('extension', this.title(rule.text), 'mat')}

        <View style={[styleApp.divider2, {marginBottom: 10}]} />

        {this.rowIcon('calendar-alt', this.dateTime(data), 'font')}
        {data.date.recurrence != ''
          ? this.rowIcon(
              'stopwatch',
              this.title(
                data.date.recurrence.charAt(0).toUpperCase() +
                  data.date.recurrence.slice(1) +
                  ' recurrence',
              ),
              'font',
            )
          : null}
        {this.rowIcon(
          'map-marker-alt',
          this.title(data.location.address),
          'font',
        )}
        <View style={{height: 5}} />
        {data.info.instructions != ''
          ? this.rowIcon('parking', this.title(data.info.instructions), 'font')
          : null}

        <View style={{height: 25}} />
        {this.rowIcon(
          'user-plus',
          this.title(
            Number(data.info.maxAttendance) == 1
              ? data.info.maxAttendance + ' player'
              : data.info.maxAttendance + ' players',
          ),
          'font',
        )}
        <View style={{height: 5}} />
        {this.rowIcon(
          'balance-scale',
          this.title(
            level.value == '0' ? level.text : level.text + ' ' + levelOption,
          ),
          'font',
        )}
        <View style={{height: 5}} />

        {this.rowIcon(
          data.info.gender == 'mixed'
            ? 'venus-mars'
            : data.info.gender == 'female'
            ? 'venus'
            : 'mars',
          this.title(
            data.info.gender.charAt(0).toUpperCase() +
              data.info.gender.slice(1),
          ),
          'font',
        )}

        {this.listGroups(this.props.navigation.getParam('groups'))}

        <View style={[styleApp.divider2, {marginBottom: 10}]} />

        {data.info.player ? (
          <Text style={[styleApp.title, {fontSize: 13}]}>
            Reminder •{' '}
            <Text style={{fontFamily: 'OpenSans-Regular'}}>
              As a host you will get to play for free!
            </Text>
          </Text>
        ) : Number(data.price.joiningFee) !== 0 ? (
          <Text style={[styleApp.title, {fontSize: 13}]}>
            Reminder •{' '}
            <Text style={{fontFamily: 'OpenSans-Regular'}}>
              Players will be charged when they register for the event. You’ll
              get paid once the session is over.
            </Text>
          </Text>
        ) : null}
      </View>
    );
  }
  async submit(data) {
    this.setState({loader: true});
    const {dismiss} = this.props.navigation;
    var event = await createEvent(
      data,
      this.props.userID,
      this.props.infoUser,
      this.props.level,
      this.props.navigation.getParam('groups'),
    );
    if (!event) {
      await this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        title: 'An error has occured.',
        subtitle: 'Please try again.',
        textButton: 'Got it!',
      });
    }

    if (data.groups.length !== 0) {
      var groups = this.props.navigation.getParam('groups');
      for (var i in groups) {
        await this.props.groupsAction('editGroup', {
          objectID: groups[i].objectID,
          events: union([event.objectID], groups[i].events),
        });
      }
    }

    await this.props.eventsAction('setAllEvents', {[event.objectID]: event});
    await this.props.eventsAction('addFutureEvent', event.objectID);

    await this.props.historicSearchAction('setSport', {
      value: event.info.sport,
      league: event.info.league,
    });

    await this.props.createEventAction('reset');
    await this.setState({loader: false});

    await dismiss();

    return this.props.navigation.navigate('Contacts', {
      data: event,
      pageFrom: 'Event',
      openPageLink: 'openEventPage',
      objectID: event.objectID,
    });
  }
  render() {
    return (
      <View style={[styleApp.stylePage, {borderLeftWidth: 1}]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
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
            this.page2(
              this.props.navigation.getParam('data'),
              this.props.navigation.getParam('sport'),
            )
          }
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />

        <View style={styleApp.footerBooking}>
          {this.props.userConnected ? (
            <Button
              icon={'next'}
              backgroundColor="green"
              onPressColor={colors.greenLight}
              styleButton={{marginLeft: 20, width: width - 40}}
              enabled={true}
              disabled={false}
              text={'Create event'}
              loader={this.state.loader}
              click={() => this.submit(this.props.navigation.getParam('data'))}
            />
          ) : (
            <Button
              backgroundColor="green"
              onPressColor={colors.greenLight}
              styleButton={{marginLeft: 20, width: width - 40}}
              enabled={true}
              text="Sign in to proceed"
              loader={false}
              click={() =>
                this.props.navigation.navigate('SignIn', {
                  pageFrom: 'CreateEvent3',
                })
              }
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
    userConnected: state.user.userConnected,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    level: state.user.infoUser.level,

    futureEvents: state.events.futureUserEvents,
  };
};

export default connect(mapStateToProps, {
  eventsAction,
  createEventAction,
  historicSearchAction,
  groupsAction,
})(Page3);
