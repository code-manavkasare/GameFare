import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Easing,
  Keyboard,
  PermissionsAndroid,
  Dimensions,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {currentLocation} from '../../functions/location';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import FontIcon from 'react-native-vector-icons/FontAwesome';
import {Col, Row, Grid} from 'react-native-easy-grid';

import RNFetchBlob from 'rn-fetch-blob';
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = RNFetchBlob.polyfill.Blob;

import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import Loader from '../../layout/loaders/Loader';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import ScrollView from '../../layout/scrollViews/ScrollView2';
const {height, width} = Dimensions.get('screen');

class LocationSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      EventCode: '',
      textInput: '',
      loader: false,
      showAlert: false,
      message: '',
      historicSearchLocation: {},
      initialResults: [
        {
          type: 'currentLocation',
          description: 'Current Location',
          structured_formatting: {
            main_text: 'Current Location',
          },
        },
      ],
      results: [
        {
          type: 'currentLocation',
          description: 'Current Location',
          structured_formatting: {
            main_text: 'Current Location',
          },
        },
      ],
      initialLoader: true,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {}
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state !== nextState) return true;
    return false;
  }
  async changeLocation(value) {
    try {
      this.setState({textInput: value});
      var val = value.replace(/ /g, '+');
      const apiUrl =
        'https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyDmY5dDppV_dAZDv9PYRjfAgxJKn3-U5gk&input=' +
        val +
        '&fields=formatted_address';
      const result = await RNFetchBlob.fetch('GET', apiUrl);

      const json = await result.json();

      if (json.status == 'INVALID_REQUEST' || json.status == 'ZERO_RESULTS') {
        this.setState({results: this.state.initialResults});
      } else {
        this.setState({results: json.predictions});
      }
    } catch (err) {
      console.log('errrrrr', err);
    }
  }
  async onclickLocation(address) {
    Keyboard.dismiss();
    this.setState({loader: true});
    const {route} = this.props;
    const {setUserLocation, setUniqueLocation} = route.params;
    try {
      if (address.type === 'currentLocation' && !this.state.loader)
        return this.getCurrentLocation();

      if (!this.state.loader) {
        var url2 =
          'https://maps.googleapis.com/maps/api/geocode/json?new_forward_geocoder=true&place_id=' +
          address.place_id +
          '&key=AIzaSyDmY5dDppV_dAZDv9PYRjfAgxJKn3-U5gk';
        const result2 = await RNFetchBlob.fetch('GET', url2);
        const json = await result2.json();
        var locationObj = json.results[0];

        var currentHistoricSearchLocation = this.props.historicSearchLocation;
        if (Object.values(currentHistoricSearchLocation) === 0) {
          var add = address;
          add.type = 'past';
          currentHistoricSearchLocation = {
            ...currentHistoricSearchLocation,
            [address.id]: add,
          };
          await this.props.historicSearchAction(
            'setHistoricLocationSearch',
            currentHistoricSearchLocation,
          );
        } else if (!currentHistoricSearchLocation[address.id]) {
          var add = address;
          add.type = 'past';
          currentHistoricSearchLocation = {
            ...currentHistoricSearchLocation,
            [address.id]: add,
          };
          await this.props.historicSearchAction(
            'setHistoricLocationSearch',
            currentHistoricSearchLocation,
          );
        }
        if (!setUserLocation) {
          return this.props.navigation.state.params.onGoBack({
            address: address.description,
            lat: locationObj.geometry.location.lat,
            lng: locationObj.geometry.location.lng,
          });
        }
        if (!setUniqueLocation) {
          await this.props.historicSearchAction('setLocationSearch', {
            address: address.description,
            lat: locationObj.geometry.location.lat,
            lng: locationObj.geometry.location.lng,
          });
        }
        return this.props.navigation.goBack();
      }
    } catch (err) {
      this.setState({loader: false});
    }
  }
  async getCurrentLocation() {
    const {route} = this.props;
    const {setUserLocation, setUniqueLocation} = route.params;
    var CurrentLocation = await currentLocation();
    if (CurrentLocation.response === false) {
      this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        textButton: 'Got it!',
        title: 'An error has occured.',
        subtitle: 'Please check your settings.',
      });
    }

    if (!setUserLocation) {
      return this.props.navigation.state.params.onGoBack(CurrentLocation);
    }
    if (!setUniqueLocation) {
      await this.props.historicSearchAction(
        'setLocationSearch',
        CurrentLocation,
      );
    }
    return this.props.navigation.goBack();
  }
  buttonSearchAddress() {
    const {textInput} = this.state;
    return (
      <Animated.View
        style={[
          styleApp.inputForm,
          {
            height: 50,
            marginTop: 10,
            marginLeft: 20,
            width: width - 40,
            backgroundColor: colors.off2,
            borderWidth: 0.3,
            borderRadius: 5,
            marginBottom: 10,
          },
        ]}>
        <Row style={{height: 50}}>
          <Col size={15} style={styleApp.center}>
            <AllIcons
              name="map-marker-alt"
              size={18}
              color={colors.title}
              type="font"
            />
          </Col>
          <Col size={75} style={styleApp.center2}>
            <TextInput
              placeholder="Search for an address"
              autoCorrect={false}
              // autoFocus={true}
              icon={'angle-down'}
              style={styleApp.input}
              autoFocus={true}
              ref={(input) => {
                this.textSearchInput = input;
              }}
              underlineColorAndroid="rgba(0,0,0,0)"
              returnKeyType={'done'}
              onChangeText={(text) => this.changeLocation(text)}
              value={textInput}
            />
          </Col>
          {textInput !== '' ? (
            <Col
              size={10}
              style={styles.center}
              activeOpacity={0.7}
              onPress={() => this.changeLocation('')}>
              <FontIcon name="times-circle" color={colors.grey} size={12} />
            </Col>
          ) : (
            <Col size={10} style={styleApp.center} />
          )}
        </Row>
      </Animated.View>
    );
  }
  /*

    
    */
  cardResult(result) {
    const {historicSearchLocation} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center}>
                {result.type === 'currentLocation' ? (
                  <MatIcon
                    name="my-location"
                    color={colors.greyDark}
                    size={18}
                  />
                ) : !historicSearchLocation[result.id] ? (
                  <MatIcon
                    name="access-time"
                    color={colors.greyDark}
                    size={16}
                  />
                ) : (
                  <FontIcon
                    name="map-marker"
                    color={colors.greyDark}
                    size={16}
                  />
                )}
              </Col>
              <Col size={85} style={styleApp.center2}>
                {result.type === 'currentLocation' ? (
                  <Text style={styles.mainRes}>
                    {result.structured_formatting.main_text}
                  </Text>
                ) : (
                  <View>
                    <Text style={styleApp.text}>
                      {result.structured_formatting.main_text}
                    </Text>
                    <Text style={styleApp.subtitle}>
                      {result.structured_formatting.secondary_text}
                    </Text>
                  </View>
                )}
              </Col>
            </Row>
          );
        }}
        click={() => {
          this.onclickLocation(result);
        }}
        color="white"
        style={styles.buttonResult}
        onPressColor={colors.off}
      />
    );
  }
  locationFields() {
    return (
      <View>
        {this.buttonSearchAddress()}

        {this.state.textInput === '' ? (
          <View>
            {this.cardResult({
              type: 'currentLocation',
              description: 'Current Location',
              structured_formatting: {
                main_text: 'Current Location',
              },
            })}
            {Object.values(this.props.historicSearchLocation).map(
              (result, i) => (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.8}
                  onPress={() => {
                    this.onclickLocation(result);
                  }}>
                  {this.cardResult(result)}
                </TouchableOpacity>
              ),
            )}
          </View>
        ) : (
          Object.values(this.state.results).map((result, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.8}
              onPress={() => {
                this.onclickLocation(result);
              }}>
              {this.cardResult(result)}
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  }
  render() {
    const {goBack} = this.props.navigation;
    return (
      //
      <View style={styles.content}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={this.state.loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1={'times'}
          clickButton1={() => goBack()}
        />

        <ScrollView
          style={{marginTop: sizes.heightHeaderHome}}
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.locationFields.bind(this)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: 'white',
  },
  buttonResult: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
    width: width,
  },
  popupNoProviders: {
    top: 0,
    height: height,
    width: '100%',
    marginLeft: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    historicSearchLocation: state.historicSearch.historicSearchLocation,
  };
};

export default connect(
  mapStateToProps,
  {historicSearchAction},
)(LocationSelector);
