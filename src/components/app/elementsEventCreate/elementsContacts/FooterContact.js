import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated,
    ScrollView
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import StatusBar from '@react-native-community/status-bar';
import BackButton from '../../../layout/buttons/BackButton'
import isEqual from 'lodash.isequal'

import Header from '../../../layout/headers/HeaderButton'
import ButtonRound from '../../../layout/buttons/ButtonRound'
// import ScrollView from '../../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../../layout/cards/ExpandableCard'
import Switch from '../../../layout/switch/Switch'
import AllIcons from '../../../layout/icons/AllIcons'
import {date} from '../../../layout/date/date'

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import {timing,native} from '../../../animations/animations'

class FooterContact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      val:0,
      nextVal:0,
      showNextVal:false
    };
    this.translateYCurrent = new Animated.Value(0)
    this.translateYNext = new Animated.Value(30)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'New contact',
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerLeft: () => (
        <BackButton name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  componentDidMount() {
    console.log('page 1 mount')
    console.log(this.props.sports)
    console.log(this.state.sportsFilter)
  }
  async componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.contactsSelected,this.props.contactsSelected)) {
      await this.setState({
        nextVal:Object.values(nextProps.contactsSelected).length,
        showNextVal:true,
      })
      console.log(Object.values(nextProps.contactsSelected).length)
      console.log(Object.values(this.props.contactsSelected).length)
      if (Object.values(nextProps.contactsSelected).length < this.state.val) {
        await this.translateYNext.setValue(-30)
        Animated.parallel([
          Animated.timing(this.translateYCurrent,native(30,200)),
          Animated.timing(this.translateYNext,native(0,200)),
        ]).start(() => {
          this.setState({val:Object.values(nextProps.contactsSelected).length,showNextVal:false})
          this.translateYCurrent.setValue(0)
        })
      } else {
        await this.translateYNext.setValue(30)
        console.log('yepa')
        Animated.parallel([
          Animated.timing(this.translateYCurrent,native(-30,200)),
          Animated.timing(this.translateYNext,native(0,200)),
        ]).start(() => {
          this.setState({val:Object.values(nextProps.contactsSelected).length,showNextVal:false})
          this.translateYCurrent.setValue(0)
        })
      }
    }
  }
  contact(contact,i) {
    var name = contact.givenName
    var name = name.slice(0,6)
    name = name+ '..'
    var family = contact.familyName[0]
    console.log('lalalala')
    console.log(family)
    if (family == '' || family == undefined) family=''
    else family = family.toUpperCase()
    var initial = contact.givenName[0] + family

    return (
      <View style={[styleApp.center,{height:70,width:50,marginTop:2}]}>
      <View style={[styleApp.center,{height:30,width:30,backgroundColor:contact.color,borderRadius:15,borderWidth:1,borderColor:colors.off}]}>
        <Text style={[styleApp.subtitle,{color:'white',fontSize:11,fontFamily:'OpenSans-SemiBold'}]}>{initial}</Text>    
        <TouchableOpacity style={styles.viewDelete} activeOpacity={0.7} onPress={() => this.props.deleteContact(contact)}>
          <AllIcons name="close" type="mat" color={'white'} size={9} />
        </TouchableOpacity>
      </View>
      <Text style={[styleApp.text,{fontSize:12,marginTop:4}]}>{name}</Text>
      </View>
    )
  }
  send() {
    if (this.state.val != 0) {
      this.props.sendSMS()
    }
  }
  styleButtonSMS () {
    if (this.state.nextVal != 0) {
      return [styles.viewNumber,{backgroundColor:colors.green,width:40,height:40,borderRadius:20,borderWidth:1,borderColor:colors.off}]
    }
    return [styles.viewNumber,{backgroundColor:'white',width:40,height:40,borderRadius:20,borderColor:colors.off,borderWidth:1}]
  }
  colorButtonSMS () {
    if (this.state.nextVal != 0) {
      return 'white'
    }
    return colors.off
  }
  render() {
    return (
      <View style={{height:sizes.heightFooterBooking,position:'absolute',backgroundColor:'white',bottom:0,zIndex:200,width:width,borderTopWidth:0.3,borderColor:colors.borderColor,paddingTop:4,}}>
        <Row style={{height:70}}>
          <Col size={15} style={styleApp.center}>
            <View style={styles.viewNumber}>
              <Animated.Text style={[styleApp.text,{color:'white',elevation: 20,position:'absolute',transform:[{translateY:this.translateYCurrent}]}]}>{this.state.val}</Animated.Text>
              {
                this.state.showNextVal?
                <Animated.Text style={[styleApp.text,{color:'white',position:'absolute',transform:[{translateY:this.translateYNext}]}]}>{this.state.nextVal}</Animated.Text>
                :null
              }
              
            </View>
            <Text style={[styleApp.text,{fontSize:12}]}>Total</Text>
          </Col>
          <Col size={70} style={[styleApp.center2,{borderLeftWidth:0,borderColor:colors.off,borderRightWidth:0}]}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {Object.values(this.props.contactsSelected).map((contact,i) => (
              this.contact(contact,i)
            ))}
            </ScrollView>
          </Col>
          <Col size={15} style={styleApp.center} activeOpacity={0.7} onPress={() => this.send()}>
            <View style={this.styleButtonSMS()}>
              <AllIcons name='sms' type='font' color={this.colorButtonSMS()} size={20} />
            </View>
          </Col>
        </Row>

        </View>
    );
  }
}

const styles = StyleSheet.create({
  viewNumber:{
    backgroundColor:colors.blue,height:35,width:35,borderRadius:17.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  viewTick:{
    position:'absolute',bottom:-3,right:-4,backgroundColor:colors.blue,height:15,width:15,borderRadius:7.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth:0.3,
    borderColor:colors.off,
  },
  viewDelete:{
    position:'absolute',top:-8,left:-4,backgroundColor:colors.primary,height:15,width:15,borderRadius:7.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth:0.6,borderColor:colors.off
  },
});

const  mapStateToProps = state => {
  return {
  };
};

export default connect(mapStateToProps,{})(FooterContact);

