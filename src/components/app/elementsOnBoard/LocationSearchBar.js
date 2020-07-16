import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Animated,
  Keyboard,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {currentLocation} from '../../functions/location';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import FontIcon from 'react-native-vector-icons/FontAwesome';
import {Col, Row} from 'react-native-easy-grid';

import RNFetchBlob from 'rn-fetch-blob';
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = RNFetchBlob.polyfill.Blob;

import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';

import ScrollView from '../../layout/scrollViews/ScrollView2';
import NavigationService from '../../../../NavigationService';

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

      if (json.status === 'INVALID_REQUEST' || json.status === 'ZERO_RESULTS') {
        this.setState({results: this.state.initialResults});
      } else {
        this.setState({results: json.predictions});
      }
    } catch (err) {
      console.log('error', err);
    }
  }
  async onclickLocation(address) {
    const {loader, setState} = this.props;
    Keyboard.dismiss();
    try {
      if (address.type === 'currentLocation' && !loader) {
        await setState({loader: true});
        return this.getCurrentLocation();
      }

      if (!loader) {
        await setState({loader: true});
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
        this.props.selectLocation({
          address: address.description,
          lat: locationObj.geometry.location.lat,
          lng: locationObj.geometry.location.lng,
        });
      }
    } catch (err) {
      console.log('error', err);
      setState({loader: false});
    }
  }
  async getCurrentLocation() {
    const {setState} = this.props;
    var CurrentLocation = await currentLocation();
    if (!CurrentLocation.response) {
      await setState({loader: false});
      return NavigationService.navigate('Alert', {
        close: true,
        textButton: 'Got it!',
        title: 'An error has occured.',
        subtitle: 'Please check your settings.',
      });
    }
    this.props.selectLocation(CurrentLocation);
  }
  buttonSearchAddress() {
    const {textInput} = this.state;
    return (
      <Animated.View style={styles.searchInput}>
        <Row>
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
              style={styleApp.center}
              activeOpacity={0.7}
              onPress={() => this.changeLocation('')}>
              <FontIcon name="times-circle" color={colors.greyDark} size={15} />
            </Col>
          ) : (
            <Col size={10} style={styleApp.center} />
          )}
        </Row>
      </Animated.View>
    );
  }
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
                ) : historicSearchLocation[result.id] ? (
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
                  <Text style={styleApp.text}>
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
        click={() => this.onclickLocation(result)}
        color="white"
        style={styles.buttonResult}
        onPressColor={colors.off}
      />
    );
  }
  locationFields() {
    const {results} = this.state;
    return (
      <View style={{...styleApp.marginView, marginTop: 5}}>
        {this.buttonSearchAddress()}

        {Object.values(results).map((result, i) => this.cardResult(result))}
      </View>
    );
  }
  render() {
    return this.locationFields();
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    //  backgroundColor: 'red',
  },
  searchInput: {
    height: 50,
    marginTop: 10,
    width: '100%',
    backgroundColor: colors.off2,
    borderWidth: 0.3,
    borderColor: colors.grey,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonResult: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
    width: '100%',
    borderRadius: 5,
  },
  secondRes: {
    ...styleApp.text,
    color: colors.greyDark,
    fontSize: 17,
    marginTop: 2,
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
