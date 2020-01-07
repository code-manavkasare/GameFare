import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import LocationSearchBar from './LocationSearchBar';
import ButtonColor from '../../layout/Views/Button';

import ScrollView from '../../layout/scrollViews/ScrollView2';
import {currentLocation} from '../../functions/location';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import AllIcon from '../../layout/icons/AllIcons';

class InitialPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.translateXText = new Animated.Value(90);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.setLocation.bind(this);
  }
  async setLocation(location) {
    await this.props.historicSearchAction('setLocationSearch', location);
    return this.props.navigation.navigate('TabsApp');
  }
  async currentLocation() {
    this.setState({loader: true});
    var location = await currentLocation();
    if (location.response === false) {
      this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        textButton: 'Got it!',
        title: 'An error has occured.',
        subtitle: 'Please check your settings.',
      });
    }
    return this.setLocation(location);
  }
  location() {
    return (
      <View>
        <LocationSearchBar selectLocation={(location) => this.setLocation(location)} />
        {/*<ButtonColor
          view={() => {
            return (
              <Row>
                <Col size={15} style={styleApp.center2}>
                  <AllIcon
                    name="my-location"
                    size={20}
                    type={'mat'}
                    color={colors.title}
                  />
                </Col>
                <Col size={60} style={[styleApp.center2, {paddingLeft: 0}]}>
                  <Text
                    style={[
                      styleApp.title,
                      {
                        color: colors.title,
                        fontSize: 15,
                        fontFamily: 'OpenSans-SemiBold',
                      },
                    ]}>
                    Use current location
                  </Text>
                </Col>
              </Row>
            );
          }}
          click={() => this.currentLocation()}
          color={'white'}
          style={[
            styles.cardSports,
            {
              height: 60,
              borderBottomWidth: 0,
              borderColor: colors.grey,
              paddingRight: 20,
              paddingLeft: 20,
              width: width,
            },
          ]}
          onPressColor={colors.off}
        /> */}
      </View>

    );
  }
  locationSelector() {
    return (
      <FadeInView duration={200} style={{height: height / 2}}>
        <View style={[styleApp.marginView, {width: width - 90}]}>
          <Text
            style={[styleApp.title, {color: colors.title, marginBottom: 30}]}>
            Where do you plan to play {this.props.navigation.getParam('sport')}?
          </Text>
        </View>

        {/* <View style={[styleApp.divider2,{marginBottom:0,marginTop:5}]} /> */}

        <ButtonColor
          view={() => {
            return (
              <Row>
                <Col size={15} style={styleApp.center2}>
                  <AllIcon
                    name="search"
                    size={15}
                    type={'font'}
                    color={colors.title}
                  />
                </Col>
                <Col size={60} style={[styleApp.center2, {paddingLeft: 0}]}>
                  <Text
                    style={[
                      styleApp.title,
                      {
                        color: colors.title,
                        fontSize: 15,
                        fontFamily: 'OpenSans-SemiBold',
                      },
                    ]}>
                    Search for an area
                  </Text>
                </Col>
                <Col size={15} style={styleApp.center3}>
                  <AllIcon
                    name="arrow-right"
                    size={14}
                    type={'font'}
                    color={colors.title}
                  />
                </Col>
              </Row>
            );
          }}
          click={() => {
            // StatusBar.setBarStyle('dark-content',true)
            this.props.navigation.navigate('LocationOnBoard', {
              pageFrom: 'LocationSelect',
              onGoBack: (location) => this.setLocation(location),
            });
          }}
          color={'white'}
          style={[
            styles.cardSports,
            {
              height: 60,
              borderBottomWidth: 0,
              borderColor: colors.grey,
              paddingRight: 20,
              paddingLeft: 20,
              width: width,
            },
          ]}
          onPressColor={colors.off}
        />

        <ButtonColor
          view={() => {
            return (
              <Row>
                <Col size={15} style={styleApp.center2}>
                  <AllIcon
                    name="my-location"
                    size={20}
                    type={'mat'}
                    color={colors.title}
                  />
                </Col>
                <Col size={60} style={[styleApp.center2, {paddingLeft: 0}]}>
                  <Text
                    style={[
                      styleApp.title,
                      {
                        color: colors.title,
                        fontSize: 15,
                        fontFamily: 'OpenSans-SemiBold',
                      },
                    ]}>
                    Use current location
                  </Text>
                </Col>
              </Row>
            );
          }}
          click={() => this.currentLocation()}
          color={'white'}
          style={[
            styles.cardSports,
            {
              height: 60,
              borderBottomWidth: 0,
              borderColor: colors.grey,
              paddingRight: 20,
              paddingLeft: 20,
              width: width,
            },
          ]}
          onPressColor={colors.off}
        />
      </FadeInView>
    );
  }
  render() {
    return (
      <View style={[{backgroundColor: 'white', flex: 1}]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Search for an address'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          loader={this.state.loader}
          icon1="arrow-left"
          clickButton1={() => this.props.navigation.goBack()}
          icon2="text"
          text2={'Skip'}
          clickButton2={() => this.props.navigation.navigate('TabsApp')}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.location.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={0}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imgBackground: {
    height: 40,
    width: 40,
    // borderRadius:24,
    borderColor: colors.off,
    borderWidth: 0,
    borderRadius: 20,
  },
  cardSport: {
    // backgroundColor:'red',
    marginRight: 0,
    height: 60,
    width: width,
    borderColor: colors.off,
    borderWidth: 1,
    // marginRight:10,
    borderRadius: 10,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {historicSearchAction})(InitialPage);
