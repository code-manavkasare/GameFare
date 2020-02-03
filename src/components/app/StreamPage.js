import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');

import {historicSearchAction} from '../../actions/historicSearchActions';
import {getMyEvents} from '../database/algolia';

import styleApp from '../style/style';
import colors from '../style/colors';
import sizes from '../style/sizes';

import ScrollView2 from '../layout/scrollViews/ScrollView';
import CardEvent from './elementsStreaming/CardEvent';

import PlaceHolder from '../placeHolders/CardConversation';
import Button from '../layout/buttons/Button';
import HeaderBackButton from '../layout/headers/HeaderBackButton';

class StreamPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: true,
      wasLoggedOut: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    if (this.props.userConnected) {
      this.loadEvents();
    }
  }
  async loadEvents() {
    console.log('StreamPage loadEvents');
    if (!this.props.userConnected) {
      return false;
    }
    const events = await getMyEvents(this.props.userID);
    //await this.props.eventsAction('setMyEvents', events); something like this?
    this.setState({events: events, loader: false, wasLoggedOut: false});
    return true;
  }
  logoutView() {
    console.log('StreamPage logoutView');
    return (
      <View style={[styleApp.marginView, {marginTop: 30}]}>
        <View style={styleApp.center}>
          <Image
            style={{height: 85, width: 85, marginBottom: 30}}
            source={require('../../img/images/smartphone.png')}
          />
          <Text style={[styleApp.text, {marginBottom: 30}]}>
            Sign in to stream events.
          </Text>
        </View>

        <Button
          text="Sign in"
          click={() =>
            this.props.navigation.navigate('Phone', {pageFrom: 'StreamPage'})
          }
          backgroundColor={'green'}
          onPressColor={colors.greenClick}
        />
      </View>
    );
  }
  placeHolder() {
    return (
      <View style={{flex: 1}}>
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
      </View>
    );
  }
  streamPageView(events) {
    console.log('StreamPage streamPageView');
    if (!this.props.userConnected) {
      if (!this.state.wasLoggedOut) {
        this.setState({wasLoggedOut: true, events: []});
      }
      return this.logoutView();
    }
    return (
      <View style={{paddingTop: 5, height: '100%'}}>
        <View style={[styleApp.marginView, {marginBottom: 15}]}>
          <Text style={[styleApp.title, {fontSize: 27}]}>Events</Text>
        </View>
        <View
          style={[
            styleApp.divider2,
            {paddingLeft: 20, width: width - 40, marginTop: 0},
          ]}
        />
        {this.state.loader
          ? this.placeHolder()
          : Object.values(events).map((event, i) => (
              <CardEvent
                index={i}
                eventTitle={event.info.name}
                start={event.date.start}
                click={(index) => {
                  this.props.navigation.navigate('LiveStream');
                }}
              />
            ))}
      </View>
    );
  }

  render() {
    console.log('StreamPage render');
    console.log('userConnected ' + this.props.userConnected);
    console.log('wasLoggedOut ' + this.state.wasLoggedOut);
    const {events} = this.state;
    if (this.props.userConnected && this.state.wasLoggedOut) {
      this.loadEvents();
    }
    return (
      <View>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Select an event to stream'}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.white}
          initialBackgroundColor={'white'}
          initialTitleOpacity={0}
        />

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.streamPageView(events)}
          keyboardAvoidDisable={true}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={false}
          offsetBottom={10}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {historicSearchAction})(StreamPage);
