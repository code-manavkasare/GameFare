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
import BackButton from '../../layout/buttons/BackButton';

import RNFetchBlob from 'rn-fetch-blob';
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = RNFetchBlob.polyfill.Blob;

import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';
import Loader from '../../layout/loaders/Loader';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import ScrollView from '../../layout/scrollViews/ScrollView';
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
  static navigationOptions = ({navigation}) => {
    return {
      title: '',
      headerStyle: styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton
          color={colors.title}
          name="close"
          size={24}
          type="mat"
          click={() => navigation.navigate(navigation.getParam('pageFrom'))}
        />
      ),
      headerRight: () =>
        navigation.getParam('loader') == true ? (
          <View style={{paddingRight: 15}}>
            <Loader color="primary" size={16} />
          </View>
        ) : null,
    };
  };
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
    try {
      if (address.type == 'currentLocation' && this.state.loader == false)
        return this.getCurrentLocation();

      if (this.state.loader == false) {
        var url2 =
          'https://maps.googleapis.com/maps/api/geocode/json?new_forward_geocoder=true&place_id=' +
          address.place_id +
          '&key=AIzaSyDmY5dDppV_dAZDv9PYRjfAgxJKn3-U5gk';
        const result2 = await RNFetchBlob.fetch('GET', url2);
        const json = await result2.json();
        var locationObj = json.results[0];

        var currentHistoricSearchLocation = this.props.historicSearchLocation;
        if (Object.values(currentHistoricSearchLocation) == 0) {
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
        } else if (currentHistoricSearchLocation[address.id] == undefined) {
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
        this.props.selectLocation({
          address: address.description,
          lat: locationObj.geometry.location.lat,
          lng: locationObj.geometry.location.lng, 
        });
      }
    } catch (err) {
      console.log('errrrrrr');
      console.log(err);
      this.setState({loader: false});
    }
  }
  async getCurrentLocation() {
    var CurrentLocation = await currentLocation();
    console.log('currentLocation');
    console.log(CurrentLocation);
    if (CurrentLocation.response === false) {
      this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        close: true,
        textButton: 'Got it!',
        title: 'An error has occured.',
        subtitle: 'Please check your settings.',
      });
    }
    console.log('set lovation back');

    if (!this.props.navigation.getParam('setUserLocation')) {
      return this.props.navigation.state.params.onGoBack(CurrentLocation);
    }
    await this.props.historicSearchAction('setLocationSearch', CurrentLocation);
    return this.props.navigation.goBack();
  }
  buttonSearchAddress() {
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
          <Col size={15} style={styles.center}>
            <AllIcons
              name="map-marker-alt"
              size={18}
              color={colors.title}
              type="font"
            />
          </Col>
          <Col size={75} style={styles.center2}>
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
              value={this.state.textInput}
            />
          </Col>
          {this.state.textInput != '' ? (
            <Col
              size={10}
              style={styles.center}
              activeOpacity={0.7}
              onPress={() => this.changeLocation('')}>
              <FontIcon name="times-circle" color={colors.grey} size={12} />
            </Col>
          ) : (
            <Col size={10} style={styles.center}></Col>
          )}
        </Row>
      </Animated.View>
    );
  }
  /*

    
    */
  cardResult(result) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styles.center}>
                {result.type == 'currentLocation' ? (
                  <MatIcon name="my-location" color="grey" size={18} />
                ) : this.props.historicSearchLocation[result.id] !=
                  undefined ? (
                  <MatIcon name="access-time" color="grey" size={16} />
                ) : (
                  <FontIcon name="map-marker" color="grey" size={16} />
                )}
              </Col>
              <Col size={85} style={styles.center2}>
                {result.type == 'currentLocation' ? (
                  <Text style={styles.mainRes}>
                    {result.structured_formatting.main_text}
                  </Text>
                ) : (
                  <View>
                    <Text style={styles.mainRes}>
                      {result.structured_formatting.main_text}
                    </Text>
                    <Text style={styles.secondRes}>
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
        style={{
          flex: 1,
          borderBottomWidth: 0,
          borderColor: '#EAEAEA',
          paddingTop: 15,
          paddingBottom: 15,
          marginLeft: 0,
          width: width,
        }}
        onPressColor={colors.off}
      />
    );
  }
  locationFields() {
    return (
      <View>
        {this.buttonSearchAddress()}

        {this.state.textInput == '' ? (
          <View />
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
    return (
      <View style={styles.content}>
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
    position: 'absolute',
    top: 0,
    borderTopWidth: 0,
    borderColor: colors.off,
    height: height,
    width: width,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2: {
    //alignItems: 'center',
    justifyContent: 'center',
  },
  mainRes: {
    color: '#46474B',
    fontSize: 17,
    fontFamily: 'OpenSans-SemiBold',
  },
  secondRes: {
    color: 'grey',
    fontSize: 17,
    marginTop: 2,
    fontFamily: 'OpenSans-Regular',
  },
  title: {
    color: 'white',
    fontSize: 19,
    fontFamily: 'OpenSans-Bold',
  },
  subtitle: {
    color: colors.title,
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
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

export default connect(mapStateToProps, {historicSearchAction})(
  LocationSelector,
);
