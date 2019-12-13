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
import {eventsAction} from '../../../actions/eventsActions';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import {indexEvents} from '../../database/algolia';
import isEqual from 'lodash.isequal';

import ButtonColor from '../../layout/Views/Button';
import FadeInView from 'react-native-fade-in-view';
import LinearGradient from 'react-native-linear-gradient';
import PlaceHolder from '../../placeHolders/CardEvent';
import CardEvent from '../elementsHome/CardEventSM';
import ScrollViewX from '../../layout/scrollViews/ScrollViewX';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';

class EventsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      events: [],
    };
  }
  componentDidMount() {
    this.load();
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (
      !isEqual(nextState, this.state) ||
      !isEqual(this.props.data.events, nextProps.data.events)
    )
      return true;
    return false;
  }
  async componentWillReceiveProps(nextProps) {
    if (this.props.data.events != nextProps.data.events) {
      await this.setState({loader: true});
      this.load();
    }
  }
  async load() {
    console.log('events');
    console.log(this.props.data.events);
    console.log(this.props.data);
    var events = this.props.data.events;
    if (events == undefined) events = [];
    var {results} = await indexEvents.getObjects(events.reverse());
    return this.setState({events: results, loader: false});
  }
  rowEvent(event, i) {
    console.log('events!!!');
    console.log(event);
    return (
      <CardEvent
        userID={this.props.userID}
        key={i}
        size={'SM'}
        groupPage={true}
        marginTop={25}
        // navigate={(val, data) => this.props.navigate(val, data)}
        data={event}
        loadData={true}
      />
    );
  }
  async newEvent() {
    if (!this.props.userConnected)
      return this.props.navigate('SignIn', {pageFrom: 'Group'});
    if (this.props.userID != this.props.data.info.organizer)
      return this.props.navigate('Alert', {
        textButton: 'Got it!',
        close: true,
        title: 'You need to be admin of this groups in order to add events.',
      });
    await this.props.createEventAction('setStep1', {groups: [this.props.data]});
    await this.props.createEventAction('setStep0', {
      sport: this.props.data.info.sport,
    });
    return this.props.navigate('CreateEvent0', {
      pageFrom: 'Group',
      group: this.props.data,
      sport: this.props.sport,
    });
  }
  listEvents(events) {
    console.log('render la list event cest la');
    console.log(events);
    return Object.values(events)
      .reverse()
      .map((event, i) => this.rowEvent(event, i));
  }
  eventsView(data) {
    console.log('re render events');
    console.log(this.props.data.events);
    return (
      <View style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={styleApp.text}>Events</Text>
            </Col>
            <Col style={styleApp.center3} size={20}>
              <ButtonColor
                view={() => {
                  return <Text style={styleApp.title}>+</Text>;
                }}
                click={this.newEvent.bind(this)}
                color="white"
                style={[
                  styleApp.center,
                  {
                    borderColor: colors.off,
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                  },
                ]}
                onPressColor={colors.off}
              />
            </Col>
          </Row>
          <View style={styleApp.divider2} />
        </View>

        <View style={{height: 230}}>
          <ScrollViewX
            loader={this.state.loader}
            events={this.state.events}
            placeHolder={[
              styleApp.cardGroup,
              styleApp.shade,
              {paddingLeft: 10, paddingRight: 10, paddingTop: 10},
            ]}
            imageNoEvent="group"
            messageNoEvent={'No events has been created yet.'}
            content={() => this.listEvents(this.state.events)}
            // openEvent={(group) => this.openGroup(group)}
            onRef={ref => (this.scrollViewRef1 = ref)}
          />
        </View>
      </View>
    );
  }
  render() {
    return this.eventsView(this.props.data);
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = state => {
  return {
    allEvents: state.events.allEvents,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {eventsAction})(EventsView);
