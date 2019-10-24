import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Keyboard,
  Dimensions,
  View
} from 'react-native';
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import Permissions from 'react-native-permissions'
import AndroidOpenSettings from 'react-native-android-open-settings'
import Contacts from 'react-native-contacts';

import colors from '../../../style/colors'
import styleApp from '../../../style/style'
import AllIcons from '../../../layout/icons/AllIcons'

import sizes from '../../../style/sizes';
import ScrollView from '../../../layout/scrollViews/ScrollView'

const { height, width } = Dimensions.get('screen')

export default class ContactsComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
          allContacts:[],
          contacts:[],
          showAddContact:false,
          contactsSelected:{},
          search:'',
          nameNewContact:'',
          phoneNewContact:'',
          freeContacts:{},
          alphabeth:['','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
          authorizedContact:true,
        };
        this.counter=0
        this.componentWillMount = this.componentWillMount.bind(this);
      }
    componentWillMount(){
      this.props.onRef(this)
      this.loadContacts()
    } 
    getContactSelected () {
      return this.state.contactsSelected
    }
    getContacts() {
      return this.state.allContacts
    }
   
    goToSettings() {
      console.log('go to settings !')
      if (Platform.OS == 'ios'){
        Permissions.openSettings()
      } else {
        AndroidOpenSettings.appDetailsSettings()
      }
    }
    loadContacts() {
      var that = this
      Contacts.getAll((err, contacts) => {
        if (err) {
          return that.setState({contacts:[],authorizedContact:false})
        }
        console.log('contactsss')
        console.log(contacts)
        var Contacts = contacts.filter(contact => contact.phoneNumbers.length != 0)
        var Contacts = Contacts.sort(function(a, b) {
          var textA = a.givenName.toUpperCase();
          var textB = b.givenName.toUpperCase();
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        return that.setState({contacts:Contacts,authorizedContact:true,allContacts:Contacts})
      })
    }
    rowContact(contact,key) {
      return (
        <TouchableOpacity key={key} style={{marginTop:0,borderBottomWidth:1,borderColor:'#eaeaea',height:55}}activeOpacity={0.7} onPress={() => this.props.selectContact(contact,Object.values(this.state.contactsSelected).filter(contact1 => contact1.recordID == contact.recordID).length != 0)} >
          <Row>
            <Col size={15} style={styles.center}>
              {
              Object.values(this.state.contactsSelected).filter(contact1 => contact1.recordID == contact.recordID).length == 0?
              <AllIcons name="check" type="font" color={colors.off} size={16} />
              :
              <AllIcons name="check" type="font" color={colors.green} size={16} />
              }
            </Col>
            <Col size={70} style={[styles.center2,{paddingLeft:15}]}>
              <Text style={[styles.text,{fontSize:14}]}>{contact.givenName} {contact.familyName}</Text>
              <Text style={[styles.text,{fontSize:12,color:colors.title,marginTop:4}]}>{contact.phoneNumbers[0].number} • {contact.phoneNumbers[0].label}</Text>
            </Col>
            <Col size={15} style={styles.center} activeOpacity={0.7} onPress={() => this.props.setFreeContact(contact.recordID)}>
              
              {
                this.state.freeContacts[contact.recordID] == true?
                <AllIcons name="dollar-sign" type="font" color={colors.off} size={16} />
                :
                <AllIcons name="dollar-sign" type="font" color={colors.title} size={16} />
              }
          </Col>
          </Row>
        </TouchableOpacity>
      )
    }
    widthCard(val) {
      return val.length*8 + 25
    }
    cardContactSelected(contact,key) {
      return (
        <View key={key} style={{height:35 ,width:this.widthCard(contact.givenName + ' ' + contact.familyName)}}>
          <Row style={styles.cardContactSelected}>
            <Col size={80} style={styles.center}>
              <Text style={[styles.text,{color:'white',fontSize:12}]}>{contact.givenName} {contact.familyName}</Text>
            </Col>
            <Col size={20} style={styles.center} activeOpacity={0.7} onPress={() => {this.props.deleteContact(contact)}}>
              <FontIcon style={{marginTop:0,marginRight:5}} name='times-circle' color='white' size={14}/>
            </Col>
          </Row>
        </View>
      )
    }
    getLetterDisplay (letter) {
      console.log('letter')
      console.log(letter)
      if (letter != this.state.alphabeth[this.counter]) {
        var counter = Object.keys(this.state.alphabeth).find(key => this.state.alphabeth[key] === letter)
        console.log(counter)
        this.counter = counter
        console.log('laaaaaaaaasdfsdfdfd')
        console.log(this.state.alphabeth[this.counter])
        return <Row style={{height:25,backgroundColor:'#F6F6F6',borderBottomWidth:1,borderColor:'#eaeaea'}}>
          <Col style={styles.center} size={15}>
            <Text style={[styles.text,{fontSize:12}]}>{this.state.alphabeth[this.counter]}</Text>
          </Col>
          <Col size={85}></Col>
        </Row>
      }
      return null
    }
    listContacts() {    
      this.counter = 0
      return (this.state.contacts.map((contact,i) => (
        <View>
        {this.getLetterDisplay(contact.givenName[0])}
        {this.rowContact(contact,i)}
        </View>
      )))
    }
    changeSearch(search) {
      if (search.toLowerCase() == '') {
        return this.setState({contacts:this.state.allContacts,search:search})
      }
      return this.setState({contacts:this.state.allContacts.filter(contact => contact.givenName.toLowerCase().search(search.toLowerCase()) != -1 || contact.familyName.toLowerCase().search(search.toLowerCase()) != -1),search:search})
    }
    viewNotAuthorized() {
      return <View style={[styles.center,{marginTop:20}]}>
      <Image source={require('../../../../img/animals/bird.png')} style={{height:70,width:70,marginBottom:20}} />
      <Text style={styles.text}>We need to access your contacts. Please go to your settings and turn the contacts authorisation.</Text>

      {/* <ButtonFooterBooking click={this.goToSettings.bind(this)} text={'Settings'} styleText={{color:colors.primary,fontSize:14}} styleButton={{height:35,backgroundColor:'white',marginBottom:10,marginTop:20}} onPressColor='white'/>

      <ButtonFooterBooking click={() =>this.loadContacts()} text={'Load contacts'} styleText={{color:colors.primary,fontSize:14}} styleButton={{height:35,backgroundColor:'white',marginBottom:15}} onPressColor='white'/> */}

    </View>
    }
    listContactsComponent() {
      if (!this.state.authorizedContact) return this.viewNotAuthorized()
      return <View>{this.listContacts()}
        <View style={{height:120}}/>
      </View>
    }
  render() {
    return (
      <View style={styles.content}>
       {this.listContactsComponent()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    height:height-sizes.marginTopApp-105-70,
    width:width,
    marginLeft:-20
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContactSelected:{
    width:'100%',flexDirection: 'row', 
    flexWrap: 'wrap',
    backgroundColor:'white',
  },
  cardContactSelected:{
    backgroundColor:'#89DB87',
    margin:5,
    borderRadius:5,
  },
  center2:{
    justifyContent: 'center',
  },
  input:{
    color:colors.title,
    fontSize:16,
    fontFamily: 'OpenSans-Regular'
  },
  text:{
    color:colors.title,
    fontSize:15,
    fontFamily: 'OpenSans-Regular'
  },
});

