import React from 'react';
import {connect} from 'react-redux';
import {View, Text, Dimensions, Animated, TouchableOpacity} from 'react-native';
import StatusBar from '@react-native-community/status-bar';
import firebase from 'react-native-firebase';
import {Col, Row} from 'react-native-easy-grid';

import ListEvents from './elementsHome/ListEvent';
import HeaderHome from '../layout/headers/HeaderHome';
import EventFromGroups from './elementsHome/EventsFromGroups';
import styleApp from '../style/style';
import colors from '../style/colors';

import ButtonColor from '../layout/Views/Button';
import ScrollView2 from '../layout/scrollViews/ScrollView2';
const {height, width} = Dimensions.get('screen');
import ButtonAdd from './elementsHome/ButtonAdd';
import AllIcons from '../layout/icons/AllIcons';

import sizes from '../style/sizes';
import isEqual from 'lodash.isequal';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      showMap: false,
    };
    this.translateXVoile = new Animated.Value(width);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.opacityVoile = new Animated.Value(0.3);
  }
  componentDidMount() {
    StatusBar.setHidden(false, 'slide');
    StatusBar.setBarStyle('dark-content', true);
    this.notificationHandler();
  }

  componentWillUnmount() {
    this.removeNotificationListener();
    this.messageListener();
  }

  async notificationHandler() {
    // const enabled = await firebase.messaging().hasPermission();
    this.appBackgroundNotificationListenner();
    this.appOpenFistNotification();
    this.messageListener = firebase
      .notifications()
      .onNotification((notification1) => {
        const notification = new firebase.notifications.Notification()
          .setNotificationId(notification1._notificationId)
          .setTitle(notification1._title)
          .setBody(notification1._body)
          .setData(notification1._data);
        console.log('message received', notification);
        if (this.props.userID !== notification.data.senderID)
          firebase.notifications().displayNotification(notification);
      });
  }

  appBackgroundNotificationListenner() {
    this.removeNotificationListener = firebase
      .notifications()
      .onNotificationOpened((notification) => {
        const {data} = notification.notification;
        this.openPageFromNotification(data.action, data);
      });
  }

  async appOpenFistNotification() {
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const {data} = notificationOpen.notification;
      this.openPageFromNotification(data.action, data);
    }
  }

  openPageFromNotification(page, data) {
    this.props.navigation.push(page, data);
  }

  navigate(val, data) {
    this.props.navigation.push(val, data);
  }
  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.sports, nextProps.sports)) {
      await this.setState({loader: true});
      this.setState({loader: false});
    }
  }
  async changeSport(val) {
    await this.setState({loader: true});
    var that = this;
    setTimeout(function() {
      that.setState({loader: false});
    }, 400);
  }
  getAnimateHeader() {
    return this.scrollViewRef.getAnimateHeader();
  }
  homePageView() {
    return (
      <View style={{paddingTop: 10, minHeight: height / 1.5}}>
        <EventFromGroups
          navigate={this.navigate.bind(this)}
          navigate1={(val, data) => this.props.navigation.navigate(val, data)}
          loader={this.state.loader}
          onRef={(ref) => (this.eventGroupsRef = ref)}
        />

        <ListEvents
          location={this.state.location}
          search={this.state.search}
          key={2}
          onRef={(ref) => (this.listEventsRef = ref)}
          setState={(data) => this.setState(data)}
          loader={this.state.loader}
          navigate={this.navigate.bind(this)}
          navigate1={(val, data) => this.props.navigation.navigate(val, data)}
        />
      </View>
    );
  }
  async refresh() {
    this.eventGroupsRef.reload();
    this.listEventsRef.reload();
    return true;
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderHome
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          close={() =>
            this.props.navigation.navigate(
              this.props.navigation.getParam('pageFrom'),
            )
          }
          textHeader={'Organize your event'}
          inputRange={[0, sizes.heightHeaderHome + 0]}
          initialBorderColorIcon={colors.off}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          league={true}
          sports={this.props.sports}
          icon2={'map-marker-alt'}
          sizeIcon2={20}
          typeIcon2={'font'}
          clickButton2={() =>
            this.props.navigation.navigate('Location', {
              pageFrom: 'Home',
              setUserLocation: true,
            })
          }
          clickButton1={() =>
            this.props.navigation.navigate(
              this.props.navigation.getParam('pageFrom'),
            )
          }
        />

        <ScrollView2
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.homePageView()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderFilter - 30}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.refresh()}
          initialColorIcon={colors.title}
          offsetBottom={100}
          showsVerticalScrollIndicator={false}
        />
        <Animated.View
          style={[
            styleApp.voile,
            {
              opacity: this.opacityVoile,
              transform: [{translateX: this.translateXVoile}],
            },
          ]}>
          <TouchableOpacity
            style={styleApp.fullSize}
            onPress={() => this.buttonAddRef.close()}
          />
        </Animated.View>

        <ButtonAdd
          translateXVoile={this.translateXVoile}
          typeButton={'event'}
          pageTo="CreateEvent0"
          onRef={(ref) => (this.buttonAddRef = ref)}
          opacityVoile={this.opacityVoile}
        />
        <ButtonColor
          view={() => {
            return (
              <Row>
                <Col size={50} style={styleApp.center}>
                  <AllIcons
                    name="map-marker-alt"
                    color={colors.blue}
                    size={16}
                    type="font"
                  />
                </Col>
                <Col size={70} style={styleApp.center2}>
                  <Text style={styleApp.text}> Map</Text>
                </Col>
              </Row>
            );
          }}
          color={'white'}
          style={[styleApp.center, styleApp.shade2, styleApp.buttonMap]}
          click={() => {
            this.props.navigation.navigate('MapPage');
          }}
          onPressColor={colors.off}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userIDSaved,
  };
};

export default connect(mapStateToProps)(HomeScreen);
