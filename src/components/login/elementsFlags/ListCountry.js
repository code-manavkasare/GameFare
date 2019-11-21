import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  InteractionManager
} from 'react-native';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import { Col, Row, Grid } from "react-native-easy-grid";
import Flag from 'react-native-flags';
import { CountrySelection } from 'react-native-country-list';

const { height, width } = Dimensions.get('screen')
import ScrollView from '../../layout/scrollViews/ScrollView2'
import HeaderBackButton from '../../layout/headers/HeaderBackButton'
import colors from '../../style/colors'
import ButtonColor from '../../layout/Views/Button'
import styleApp from '../../style/style'
import Header from '../../layout/headers/HeaderButton'
import sizes from '../../style/sizes'
import AllIcons from '../../layout/icons/AllIcons'
import BackButton from '../../layout/buttons/BackButton'
const ListCountry = require('./country.json')

import RNFS from 'react-native-fs'

export default class SelectCountry extends Component {
    constructor(props) {
        super(props);
        this.state = {
          slice:30,
        };
        this.componentDidMount = this.componentDidMount.bind(this);
        this.AnimatedHeaderValue = new Animated.Value(0)
        this.letter = '-'
      }
      async componentDidMount(){
        // var path = RNFS.DocumentDirectoryPath + '/test.json';

        // var allCountry = []
        // for (var i in ListCountry) {
        //   var country = ListCountry[i]
        //   country.img = "1"
        //   delete country['flag']
        //   allCountry.push(country)
        // }
        // console.log(allCountry)
        // // write the file
        // RNFS.writeFile(path, JSON.stringify(allCountry), 'utf8')
        //   .then((success) => {
        //     console.log('FILE WRITTEN!');
        //     console.log(path)
        //   })
        //   .catch((err) => {
        //     console.log(err.message);
        //   });

             var that = this
              setTimeout(function(){
                that.setState({slice:ListCountry.length})
              }, 1150)
     }
     static navigationOptions = ({ navigation }) => {
      return {
        title: '',
        headerStyle:styleApp.styleHeader,
        headerTitleStyle: styleApp.textHeader,
        headerLeft: () => (
          <BackButton name='keyboard-arrow-down' color={colors.title} type='mat' click={() => navigation.navigate('Phone')} />
        ),
      }
    };
    back() {
      this.props.close()
    }
    async selectCountry(country){
      this.props.navigation.navigate('Phone',{country:country})
    }
    conditionCheck (country) {
      return false
    }
    cardCountry (country,displayHeader) {
      var displayLetter = false
      if (country.name[0] != this.letter && displayHeader) {
        displayLetter = true
        this.letter = country.name[0]
      }
      return (
        <View>
          {displayLetter && displayHeader?
          <Row style={{paddingTop:10,paddingBottom:10,backgroundColor:colors.off,paddingLeft:20}}>
            <Col style={styles.center2}>
              <Text style={[styles.subtitle,{fontWeight:'bold'}]}>{this.letter}</Text>
            </Col>
          </Row>
          :null
    }
          
          <ButtonColor view={() => {
          return (
            <Row>
              <Col size={15} style={styles.center2}>
                <Image source={{uri:country.flag}} style={{width:23,height:23,borderRadius:11.5}} />  
              </Col>
              <Col size={70} style={styles.center2}>
              <Text style={styles.subtitle}>{country.name}</Text>
              </Col>
              <Col size={15} style={styles.center}>
              {
                this.conditionCheck (country)?
                <MatIcon  name='check' color={colors.primary} size={18}/>
                :
                null
              }
              </Col>
            </Row>
          )
        }} 
        click={() => this.selectCountry(country)}
        color='white'
        style={{backgroundColor:'white',paddingTop:5,paddingBottom:5,height:40,marginLeft:-0,width:width,paddingLeft:20,paddingRight:20}}
        onPressColor={colors.off}
        />
       </View> 
      )
    }
    contryComponent() {
      // 
      return (
        <View style={{marginLeft:0,width:width-0}}>
          <Row style={{paddingTop:10,paddingBottom:10,backgroundColor:colors.off,paddingLeft:20}}>
            <Col style={styles.center2}>
              <Text style={[styles.subtitle,{fontWeight:'bold'}]}>Common countries</Text>
            </Col>
          </Row>
          {this.cardCountry(ListCountry.filter(country => country.name == 'United States')[0],false)}
          {this.cardCountry(ListCountry.filter(country => country.name == 'Canada')[0],false)}
          {this.cardCountry(ListCountry.filter(country => country.name == 'France')[0],false)}
          {this.cardCountry(ListCountry.filter(country => country.name == 'Australia')[0],false)}

            {ListCountry.slice(0,this.state.slice).map((item,i) => (
              this.cardCountry(item,true)
            ))}
            {/* <CountrySelection action={(item) => console.log(item)} selected={this.state.selectCountry}/> */}
        </View>
      )
    }
  render() {
    return (  
        <View style={[styleApp.stylePage,{backgroundColor:'white'}]}>
        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={'Select your country'}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={0}
        icon1='times'
        icon2={null}
        clickButton1={() => this.props.navigation.navigate('Phone')} 
        />

        <ScrollView
          onRef={ref => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          
          contentScrollView={this.contryComponent.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={180}
          showsVerticalScrollIndicator={true}
        />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    flex:1,
    width:width,
    backgroundColor:'white',
  },
  title:{
    fontSize:20,
    fontFamily: 'OpenSans-SemiBold',
    color:colors.title,
  },
  subtitle:{
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
    color:colors.title,
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    // alignItems: 'center',
    justifyContent: 'center',
  },
});

