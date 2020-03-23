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
import {Grid, Row, Col} from 'react-native-easy-grid';

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
import ButtonColor from '../layout/Views/Button';
import AllIcons from '../layout/icons/AllIcons';

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
    if (!this.props.userConnected) {
      return false;
    }
    let events = await getMyEvents(this.props.userID);
    events = Object.values(events);
    const now = new Date();
    events = events.filter((event) => {
      const end = new Date(event.date.end);
      return now < end;
    });
    this.setState({events: events, loader: false, wasLoggedOut: false});
    return true;
  }
  logoutView() {
    return (
      <View style={[styleApp.marginView, {marginTop: 30}]}>
        <View style={styleApp.center}>
          <Image
            style={{height: 85, width: 85, marginBottom: 30}}
            source={require('../../img/images/list.png')}
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
  clickEvent(index) {
    const {events} = this.state;
    this.props.navigation.navigate('LiveStream', {
      eventID: events[index].objectID,
    });
  }
  streamPageView(events) {
    if (!this.props.userConnected) {
      if (!this.state.wasLoggedOut) {
        this.setState({wasLoggedOut: true, events: []});
      }
      return this.logoutView();
    }
    return (
      <View style={{paddingTop: 20, height: '100%'}}>
        <View style={[styleApp.marginView, {marginBottom: 15}]}>
          <Text style={[styleApp.title, {fontSize: 27}]}>Events</Text>
        </View>
        <View
          style={[
            styleApp.divider2,
            {marginLeft: 20, width: width - 40, marginTop: 0},
          ]}
        />
        {this.state.loader
          ? this.placeHolder()
          : events.map((event, i) => (
              <CardEvent
                index={i}
                eventTitle={event.info.name}
                start={event.date.start}
                click={(index) => this.clickEvent(index)}
              />
            ))}
      </View>
    );
  }
  buttonCoach() {
    const {navigate} = this.props.navigation;
    const {userConnected} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={50} style={styleApp.center}>
                <AllIcons
                  name="laptop-medical"
                  color={colors.blue}
                  size={16}
                  type="font"
                />
              </Col>
              <Col size={70} style={styleApp.center2}>
                <Text style={styleApp.text}> Coach</Text>
              </Col>
            </Row>
          );
        }}
        color={'white'}
        style={[styleApp.center, styleApp.shade2, styleApp.buttonCoach]}
        click={() => {
          !userConnected ? navigate('SignIn') : navigate('StartCoaching');
        }}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    const {events} = this.state;
    if (this.props.userConnected && this.state.wasLoggedOut) {
      this.loadEvents();
    }
    return (
      <View style={styleApp.stylePage}>
        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.streamPageView(events)}
          keyboardAvoidDisable={true}
          marginBottomScrollView={0}
          marginTop={sizes.marginTopApp}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={false}
          offsetBottom={10}
          showsVerticalScrollIndicator={true}
        />

        {this.buttonCoach()}
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
