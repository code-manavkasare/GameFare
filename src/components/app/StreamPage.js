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
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    if (this.props.userConnected) {
      this.loadEvents(this.props.userID);
    }
  }

  async loadEvents(userID) {
    console.log('LOAD EVENTS');
    const events = await getMyEvents(userID);
    console.log(events);
    //await this.props.eventsAction('setMyEvents', events);
    this.setState({events: events, loader: false});
  }
  logoutView() {
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
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
        <PlaceHolder />
      </View>
    );
  }
  streamPageView(events) {
    if (!this.props.userConnected) return this.logoutView();
    return (
      <View style={{paddingTop: 5}}>
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
              />
            ))}
      </View>
    );
  }

  render() {
    const {navigate} = this.props.navigation;
    const {events} = this.state;
    const {userConnected} = this.props;
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
