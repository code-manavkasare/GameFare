import React, { Component } from 'react';
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
  View
} from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import FontIcon from 'react-native-vector-icons/FontAwesome';
import FadeInView from 'react-native-fade-in-view';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoder';
import { Col, Row, Grid } from "react-native-easy-grid";
import momentTZ from 'moment-timezone';
import moment from 'moment'


import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import Icon from '../../layout/icons/icons'
import AllIcons from '../../layout/icons/AllIcons'

import ScrollView from '../../layout/scrollViews/ScrollView'
import Header from '../../layout/headers/HeaderButton'


const { height, width } = Dimensions.get('screen')

export default class Location extends Component {
    constructor(props) {
        super(props);
        this.state = {
          EventCode:'',
          textInput:this.props.navigation.getParam('location').address,
          loader: false,
          showAlert:false,
          message:'',
          historicSearchLocation: [],
          initialResults: [{
            type: 'currentLocation',
            description:'Current Location',
            structured_formatting: {
              main_text: 'Current Location'
            }
          }],
          results: [{
            type: 'currentLocation',
            description:'Current Location',
            structured_formatting: {
              main_text: 'Current Location'
            }
          }],
          initialLoader:true,
        };
        this.componentDidMount = this.componentDidMount.bind(this);
      }
    componentDidMount(){
      console.log('locatiin mount')
      // this.props.onRef(this)
      // this.loadPastSearch()
      console.log(this.props.navigation.getParam('location'))
    }
    focusField() {
      this.textSearchInput.focus()
    }
    async blurField() {
      await this.textSearchInput.blur()
      // return true
    }
    async loadPastSearch () {
      var address = ''
      var historicSearchLocation = await ls.get('historicSearchLocation')
      if (historicSearchLocation == null) {
        historicSearchLocation = []
      }
      var initialResult = this.state.initialResults
      
      this.setState({
        textInput:address,
        initialLoader:false,
        historicSearchLocation:historicSearchLocation,
        initialResults:initialResult.concat(historicSearchLocation),
        results:initialResult.concat(historicSearchLocation)
      })
    }
    shouldComponentUpdate(nextProps,nextState) {
      if (this.state !== nextState) return true
      return false
    }
    async changeLocation (value) {
      try {
        this.setState({textInput:value})
        var val = value.replace(/ /g, "+")
        console.log('val')
        console.log(val)
        const apiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyDmY5dDppV_dAZDv9PYRjfAgxJKn3-U5gk&input='+val+'&fields=formatted_address'
        const result = await fetch(apiUrl)
        console.log(result)
        const json = await result.json()
        console.log(json)
        if (json.status == 'INVALID_REQUEST' || json.status == 'ZERO_RESULTS') {
          this.setState({results:this.state.initialResults})
        } else {
          this.setState({results:json.predictions})
        }
      } catch (err) {
        console.log('erfrfrord')
        console.log(err)
      }
     
    }
    async permissionAndroid () {
      var that = this
      try {
        console.log('permission')
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Wlnss Nurse Location Permission',
            message:
              'Wlnss Nurse needs access to your location ' +
              'so you can get the closest offers.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
          that.currentLocation()
        } else {
          console.log('Camera permission denied');
          that.setState({loader:false})
        }
      } catch (err) {
        console.log('errrro')
        console.log(err);
        that.setState({loader:false})
      }
    }
    async onclickLocation (address) {
      Keyboard.dismiss()
      this.setState({loader:true})
      console.log('on click sur locations')
      console.log(address)
      try{

      if (address.type == 'currentLocation' && this.state.loader == false) {
        if (Platform.OS == 'android') {
          this.permissionAndroid()
        } else {
          this.currentLocation()
        }
      } else if (this.state.loader == false) {
        var url2 = 'https://maps.googleapis.com/maps/api/geocode/json?new_forward_geocoder=true&place_id='+address.place_id+'&key=AIzaSyDmY5dDppV_dAZDv9PYRjfAgxJKn3-U5gk'
        console.log('url2')

        console.log(url2)
        const result2 = await fetch(url2)
        console.log('result2')
        console.log(result2)
        const json = await result2.json()
        var locationObj =json.results[0]


        var currentHistoricSearchLocation = this.state.historicSearchLocation
        var checkAddressExists = currentHistoricSearchLocation.filter(location => (location.id == address.id))
        console.log(checkAddressExists)
        if (checkAddressExists.length == 0) {
          var add = address
          add.type = 'past'
          currentHistoricSearchLocation.push(add)
          // ls.save('historicSearchLocation', currentHistoricSearchLocation)
          var initialResults = this.state.initialResults
          initialResults.push(add)
          this.setState({
            historicSearchLocation:currentHistoricSearchLocation,
            initialResults:initialResults,
            textInput:address.description
          })
        }
        var region = {
          latitude: locationObj.geometry.location.lat,
          longitude: locationObj.geometry.location.lng,
          latitudeDelta: 0.22,
          longitudeDelta: 0.22,
        }
        var addressComponent = locationObj.address_components
        var filterZip = addressComponent.filter(component => component.types.indexOf('postal_code') == 0)
        var zipCode  = 0
        if (filterZip.length != 0) {
          zipCode = Number(filterZip[0].long_name)
        }

        if (zipCode == 0) {
          this.setState({
            loader:false,
            showAlert:true,
            message:'Wrong address. Please try again.'
          })
        } else {
          var urlTimeZone = 'https://maps.googleapis.com/maps/api/timezone/json?location='+locationObj.geometry.location.lat+','+locationObj.geometry.location.lng+'&timestamp='+(Math.round((new Date().getTime())/1000)).toString()+'&key=AIzaSyDmY5dDppV_dAZDv9PYRjfAgxJKn3-U5gk'
          const timeZoneresult = await fetch(urlTimeZone)
          const jsonTimeZone = await timeZoneresult.json()
          var timeZoneName = jsonTimeZone.timeZoneName
          var timeZoneName = timeZoneName.split(' ')
          var timeZoneName2 = ''
          for (var i in timeZoneName) {
            timeZoneName2 = timeZoneName2 + timeZoneName[i][0]
          }
          jsonTimeZone.timeZoneName2 = timeZoneName2
          jsonTimeZone.offSet = momentTZ.tz(moment().format('ddd, MMM Do'),'ddd, MMM Do',jsonTimeZone.timeZoneId).format('Z')
          Keyboard.dismiss()
          var addressOff = address.description
          addressOff = addressOff.replace(', USA', '')
          addressOff = addressOff.replace(', Australia', '')
          var latOffer = locationObj.geometry.location.lat
          var lngOffer = locationObj.geometry.location.lng

          console.log('finitptttt')
          console.log(address)
          console.log(addressOff)
          console.log(region)
          console.log(jsonTimeZone)
          this.setState({loader:false})
          await Keyboard.dismiss()
          this.props.navigation.state.params.onGoBack({
            address:addressOff,
            timeZone:jsonTimeZone,
            area:addressOff,
            lat:locationObj.geometry.location.lat,
            lng:locationObj.geometry.location.lng,
          })
        }      
      }
      } catch (err) {
        console.log('errrrrrr')
        console.log(err)
        this.setState({loader:false,showAlert:true,message:'An error has occured. Please try again.'})
      }
    }
    currentLocation () {
        Geolocation.getCurrentPosition(
        position => {
            console.log(position)
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            const geocode = Geocoder.geocodePosition(pos)
            Promise.all([geocode]).then(results => {
              var location = results[0][0].formattedAddress
              location = location.replace(', United States', '')
              this.currentLocationOK(position,location,results[0][0]) 
            }).catch(err => {
              console.log('erro location')
              console.log(err)
              this.setState({loader:false})
            })
        },
        error => {
          console.log('error location 2')
          console.log(error)
          this.setState({loader:false})
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      )
    }
    async currentLocationOK(position,location,address) {
      console.log('location okkkkkay')
      var urlTimeZone = 'https://maps.googleapis.com/maps/api/timezone/json?location='+position.coords.latitude+','+position.coords.longitude+'&timestamp='+(Math.round((new Date().getTime())/1000)).toString()+'&key=AIzaSyDmY5dDppV_dAZDv9PYRjfAgxJKn3-U5gk'
      const timeZoneresult = await fetch(urlTimeZone)
      const jsonTimeZone = await timeZoneresult.json()

      var timeZoneName = jsonTimeZone.timeZoneName
      var timeZoneName = timeZoneName.split(' ')
      var timeZoneName2 = ''

      for (var i in timeZoneName) {
        timeZoneName2 = timeZoneName2 + timeZoneName[i][0]
      }
      jsonTimeZone.timeZoneName2 = timeZoneName2


      await this.setState({loader:false,textInput:location})
      this.props.navigation.state.params.onGoBack({
        address:location,
        timeZone:jsonTimeZone,
        area:location,
        lat:position.coords.latitude,
        lng:position.coords.longitude,
      })
    }
    buttonSearchAddress () {
      return (
        <Animated.View style={[styleApp.inputForm,{height:60,marginTop:sizes.heightHeaderHome+10,marginBottom:0,borderBottomWidth:1}]}>
          <Row style={{height:50}}>
              <Col size={15} style={styles.center}>
                <AllIcons name='map-marker-alt' size={18} color={colors.title} type='font'/>
              </Col>
              <Col size={75} style={styles.center2}>
                <TextInput 
                placeholder='Search for an address'
                autoCorrect={false}
                // autoFocus={true}
                icon={'angle-down'}
                style={styleApp.input}
                autoFocus={true}
                ref={(input) => { this.textSearchInput = input }}
                underlineColorAndroid='rgba(0,0,0,0)'
                returnKeyType={ 'done' }
                onChangeText={text =>this.changeLocation(text)}
                value={this.state.textInput}
                />
                </Col>
                {
                this.state.textInput!= ''?
                <Col size={10} style={styles.center} activeOpacity={0.7} onPress={() => this.changeLocation('')}>
                  <FontIcon name='times-circle' color={colors.grey} size={12} />
                </Col>
                :
                <Col size={10} style={styles.center}></Col>
                }
                
            </Row>

          </Animated.View>
      )
    }
    cardResult (result) {
      return (
        <Row style={{flex:1,borderBottomWidth:0,borderColor:'#EAEAEA',paddingTop:15,paddingBottom:15,marginLeft:-20,width:width}}>
          <Col size={15} style={styles.center}>
            {
              result.type=='currentLocation'?
              <MatIcon name='my-location' color='grey' size={18}/>  
              :result.type=='past'?
              <MatIcon name='access-time' color="grey" size={16}/> 
              :
              <FontIcon name='map-marker' color="grey" size={16}/> 
            }
            
          </Col>
          <Col size={85} style={styles.center2}>
            {
              result.type=='currentLocation'?
              <Text style={styles.mainRes}>{result.structured_formatting.main_text}</Text>
              :
              <View>
                <Text style={styles.mainRes}>{result.structured_formatting.main_text}</Text>
                <Text style={styles.secondRes}>{result.structured_formatting.secondary_text}</Text>    
              </View>
            }               
          </Col>
        </Row>
      )
    }
    locationFields () {
      return (
        <View>
         
          

          {Object.values(this.state.results).map((result,i) => (
              <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => {this.onclickLocation(result)}}>
                {this.cardResult(result)}
              </TouchableOpacity>
            ))}

        </View>
      )
    }
    async close() {
      this.blurField()
      return this.props.close()
    }
  render() {
    return (
      <View style={styles.content}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Location'}
        icon={'angle-down'}
        loader={this.state.loader}
        close={() => this.props.navigation.goBack()}
        />

        {this.buttonSearchAddress()}

        <ScrollView 
          style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.locationFields.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    backgroundColor:'white',
    position:'absolute',
    top:0,
    borderTopWidth:1,
    borderColor:colors.off,
    height:height,
    width:width,
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    //alignItems: 'center',
    justifyContent: 'center',
  },
  mainRes: {
    color:'#46474B',
    fontSize:17,
    fontFamily:'OpenSans-SemiBold',
  },
  secondRes: {
    color:'grey',
    fontSize:17,
    marginTop:2,
    fontFamily: 'OpenSans-Regular',
  },
  title:{
    color:'white',
    fontSize:19,
    fontFamily: 'OpenSans-Bold',
  },
  subtitle:{
    color:colors.title,
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
  },
  popupNoProviders:{
    top:0,
    height:height,
    width:'100%',
    marginLeft:0,
  },
});

