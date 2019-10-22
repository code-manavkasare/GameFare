import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  View,
  FlatList
} from 'react-native';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import { Col, Row, Grid } from "react-native-easy-grid";

const { height, width } = Dimensions.get('screen')
import ScrollView from '../../layout/scrollViews/ScrollView'
import colors from '../../style/colors'
import Header from '../../layout/headers/HeaderButton'
import sizes from '../../style/sizes'
const ListCountry = require('./listCountry.json')

export default class SelectCountry extends Component {
    constructor(props) {
        super(props);
        this.state = {
          slice:30,
        };
        this.componentDidMount = this.componentDidMount.bind(this);
      }
      componentDidMount(){
     }
    back() {
      this.props.close()
    }
    async selectCountry(country){
      this.props.navigation.navigate('Phone',{country:country})
    }
    conditionCheck (country) {
      // if (this.props.signUp) {
      //   if (this.props.country == country.code) return true
      //   return false
      // } else {
      //   if (this.props.country.name == country.name) return true
      //   return false
      // }
      return false
    }
    cardCountry (country) {
      if (country.dial_code == undefined) {
        return (
          <Row>
            <Col style={styles.center2}>
              <Text style={[styles.subtitle,{fontWeight:'bold'}]}>{country.name}</Text>
            </Col>
          </Row>
        )
      } else {
        return (
          <Row style={{backgroundColor:'white'}} activeOpacity={0.8} onPress={() => {this.selectCountry(country)}}>
            <Col size={15} style={styles.center2}>
              <Image source={{uri:'data:image/png;base64,'+country.flag}} style={{width:24,height:16,borderRadius:2}} />     
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
      }
    }
    contryComponent() {
      return (
        <View style={{marginTop:sizes.heightHeaderHome,marginLeft:20,width:width-40}}>
          <FlatList
            data={ListCountry.slice(0,this.state.slice)}
            keyExtractor={item => item.index}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (this.state.slice != ListCountry.length) {
                this.setState({slice:ListCountry.length})
              }
            }}
            renderItem={(item) => <View style={{width: width,height:40 ,}}>
            {this.cardCountry(item.item)}
            </View>}
          />
        </View>
      )
    }
  render() {
    return (  
        <View style={styles.content}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={''}
        icon={'angle-down'}
        close={() => this.props.navigation.navigate('Phone')}
        />
        {this.contryComponent()}
          {/* <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.contryComponent.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        /> */}

        </View>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    height:height,
    width:width,
    zIndex:70,
    position:'absolute',
    borderTopWidth:1,
    backgroundColor:'white',
    borderColor:'#eaeaea'
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

