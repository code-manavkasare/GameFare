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
  Clipboard,
  View
} from 'react-native';
import { Col, Row, Grid } from "react-native-easy-grid";
import Permissions from 'react-native-permissions'
import AndroidOpenSettings from 'react-native-android-open-settings'
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import branch from 'react-native-branch'

import styleApp from '../../../style/style'
import colors from '../../../style/colors'
import {date} from '../../../layout/date/date'
import AllIcons from '../../../layout/icons/AllIcons'

import ListContacts from './ListContacts'
const { height, width } = Dimensions.get('screen')

export default class ContactsComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
          contacts:[],
          showAddContact:false,
          showShareIcons:true,
          copied:false,
          contactsSelected:{},
          search:'',
          nameNewContact:'',
          phoneNewContact:'',
          freeContacts:{},
          alphabeth:['','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
        };
        this.counter=0
        this.componentDidMount = this.componentDidMount.bind(this);
      }
      componentDidMount(){
      this.props.onRef(this)
    } 
    getContactSelected () {
      return this.state.contactsSelected
    }
   
    goToSettings() {
      console.log('go to settings !')
      if (Platform.OS == 'ios'){
        Permissions.openSettings()
      } else {
        AndroidOpenSettings.appDetailsSettings()
      }
    }
    selectContact(contact,val) {
      console.log('laaaaa')
      console.log(val)
      if (val == false) {
        this.setState({nameNewContact:'',phoneNewContact:'',showAddContact:false,contactsSelected:{...this.state.contactsSelected,[contact.recordID]:contact}})
      } else {
        this.deleteContact(contact)
      }
    }
    setFreeContact(contact) {
      if (this.state.freeContacts[contact] == undefined){
        this.setState({freeContacts:{...this.state.freeContacts,[contact]:true}})
      } else {
        this.setState({freeContacts:{...this.state.freeContacts,[contact]:!this.state.freeContacts[contact]}})
      }
    }
    deleteContact (contact) {
      var contacts = {...this.state.contactsSelected}
      delete contacts[contact.recordID]
      this.setState({contactsSelected:contacts})
    }
    widthCard(val) {
      return val.length*8 + 25
    }
    cardContactSelected(contact,key) {
      return (
        <View key={key} style={{height:35 ,width:this.widthCard(contact.givenName + ' ' + contact.familyName)}}>
          <Row style={styles.cardContactSelected}>
            <Col size={75} style={styles.center}>
              <Text style={[styles.text,{color:'white',fontSize:11,fontFamily:'OpenSans-SemiBold'}]}>{contact.givenName} {contact.familyName}</Text>
            </Col>
            <Col size={30} style={styles.center} activeOpacity={0.7} onPress={() => {this.deleteContact(contact)}}>
              <FontIcon style={{marginTop:0,marginRight:5}} name='times-circle' color='white' size={13}/>
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
      return <ListContacts 
      onRef={ref => (this.listContactRef = ref)} 
      contactsSelected={this.state.contactsSelected}
      selectContact={this.selectContact.bind(this)}
      deleteContact={this.deleteContact.bind(this)}
      setFreeContact={this.setFreeContact.bind(this)}
      />
    }
    listContactsSelected () {
      if (Object.values(this.state.contactsSelected).length == 0) return null  
      return (
        <Row style={styles.rowContactSelected}>
          {Object.values(this.state.contactsSelected).map((contact,i) => (
            this.cardContactSelected(contact,i)
          ))}
        </Row> 
      )
    }
    
    changeSearch(search) {
      this.setState({search:search})
      if (search.toLowerCase() == '') {
        return this.listContactRef.setState({contacts:this.listContactRef.getContacts()})
      }
      return this.listContactRef.setState({contacts:this.listContactRef.getContacts().filter(contact => contact.givenName.toLowerCase().search(search.toLowerCase()) != -1 || contact.familyName.toLowerCase().search(search.toLowerCase()) != -1)})
    }
    
    searchBar () {
      return (
        <Row style={[styleApp.inputForm,{marginTop:-20,marginBottom:0,marginLeft:-20,width:width}]}>
          <Col size={15} style={styles.center}>
            <AllIcons name="search" type="font" color={colors.primary} size={16} />
          </Col>
          <Col size={55} style={[styles.center2,{paddingLeft:15}]}>
          <TextInput
              style={styles.input}
              placeholder={'Search for contact...'}
              returnKeyType={'done'}
              // keyboardType={this.props.keyboardType}
              blurOnSubmit={true}
              onFocus={() => this.setState({showShareIcons:false})}
              onBlur={() => this.setState({showShareIcons:true})}
              underlineColorAndroid='rgba(0,0,0,0)'
              autoCorrect={true}
              onChangeText={text => this.changeSearch(text)}
              value={this.state.search}
            />
          </Col>
          {
            this.state.search!=''?
            <Col size={15} activeOpacity={0.7} style={styles.center} onPress={() => this.changeSearch('')}>
              <FontIcon name='times-circle' color={'#eaeaea'} size={12} />
            </Col>
            :
            <Col size={15}></Col>
          }
          <Col size={15} activeOpacity={0.7} style={styles.center} onPress={() => this.setState({showAddContact:!this.state.showAddContact})}>
              <FontIcon name={!this.state.showAddContact?'plus':'minus'} color={colors.primary} size={14} />
          </Col>
        </Row>
      )
    }
    addNewContact (name,phone) {
      var id = Math.random().toString(36).substring(7)
      Keyboard.dismiss()
      console.log('id')
      console.log(id)
      
      
      this.selectContact({
        givenName:name,
        recordID:id,
        familyName:'',
        phoneNumbers:[{label:'mobile',number:phone}]
      },false)
    }
    addContact() {
      if (this.state.showAddContact) {
        return (
          <View style={{width:width,marginLeft:-20}}>
            <Row style={{borderBottomWidth:1,borderColor:'#eaeaea'}}>
              <Col size={15} style={styles.center}>
                <AllIcons name="user-alt" type="font" color={colors.primary} size={16} />
              </Col>
              <Col size={70} style={[styles.center2,{paddingLeft:15}]}>
                <Row style={{height:40}}>
                  <Col style={styles.center2}>
                  <TextInput
                    style={styles.input}
                    placeholder={'Full contact name'}
                    returnKeyType={'done'}
                    // keyboardType={this.props.keyboardType}
                    blurOnSubmit={true}
                    underlineColorAndroid='rgba(0,0,0,0)'
                    autoCorrect={true}
                    onChangeText={text => this.setState({nameNewContact:text})}
                    value={this.state.nameNewContact}
                  />
                  </Col>
                </Row>
                <Row style={{height:40}}>
                  <Col style={styles.center2}>
                  <TextInput
                    style={styles.input}
                    placeholder={'Phone number'}
                    returnKeyType={'done'}
                    keyboardType={'phone-pad'}
                    blurOnSubmit={true}
                    underlineColorAndroid='rgba(0,0,0,0)'
                    autoCorrect={true}
                    onChangeText={text => this.setState({phoneNewContact:text})}
                    value={this.state.phoneNewContact}
                  />
                  </Col>
                </Row>
              </Col>
              {
                this.state.nameNewContact == '' || this.state.phoneNewContact == '' ?
                <Col size={15} style={styles.center} >
                  <Text style={[styles.text,{color:'#eaeaea'}]}>Add</Text>
                </Col>
                :
                <Col size={15} style={styles.center} activeOpacity={0.7} onPress={() => this.addNewContact(this.state.nameNewContact,this.state.phoneNewContact)}>
                  <Text style={[styles.text,{color:colors.primary}]}>Add</Text>
                </Col>
              }
              
            </Row>
          </View>
        )
      }
      return null
    }
    async copyEvent() {
      var infoEvent = this.props.params
      console.log('infoEvent')
      console.log(infoEvent)
      var description='Join my event ' + infoEvent.info.name + ' on ' + date(infoEvent.date.start,'ddd, MMM D') + ' at ' + date(infoEvent.date.start,'h:mm a') +  ' by following the link!'
      let branchUniversalObject = await branch.createBranchUniversalObject('canonicalIdentifier', {
        // contentTitle: description,
        contentDescription: description,
        title: infoEvent.info.name,
        contentMetadata: {
          customMetadata: {
            'eventID': infoEvent.objectID,
            'action':'openEventPage',
            '$uri_redirect_mode': '1',
            '$og_image_url':'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/sports%2Flogoios.png?alt=media&token=f7d4d951-ecfb-4264-a338-60affacae254'
          }
        }
      })

      let linkProperties = { feature: 'share', channel: 'GameFare' }
      let controlParams = { $desktop_url: 'http://getgamefare.com'}

      let {url} = await branchUniversalObject.generateShortUrl(linkProperties, controlParams)
      await Clipboard.setString(url)
      console.log('url')
      console.log(url)
      this.setState({copied:true})
      var that = this
      setTimeout(function(){
        that.setState({copied:false})
      }, 900);   
    }
    shareEvent () {
      var infoEvent = this.props.params
      var description='Join my event ' + infoEvent.info.name + ' on ' + date(infoEvent.date.start,'ddd, MMM D') + ' at ' + date(infoEvent.date.start,'h:mm a') +  ' by following the link!'
      branch.createBranchUniversalObject('canonicalIdentifier', {
        // contentTitle: description,
        contentDescription: description,
        title: infoEvent.info.name,
        contentMetadata: {
          customMetadata: {
            'eventID': infoEvent.objectID,
            'action':'openEventPage',
            '$uri_redirect_mode': '1',
            '$og_image_url':'https://firebasestorage.googleapis.com/v0/b/getplayd.appspot.com/o/sports%2Flogoios.png?alt=media&token=f7d4d951-ecfb-4264-a338-60affacae254'
          }
        }
      }).then( (branchUniversalObject) => {
        let shareOptions = { messageHeader: description , messageBody: description}
        let linkProperties = {
          channel: 'facebook'
        }
        let controlParams = {
          $desktop_url: 'https://getgamefare.com'
        }
        branchUniversalObject.showShareSheet(shareOptions, linkProperties, controlParams).then( (channel, completed, error) => {
          console.log('share open')
        })
      })   
    }
    shareIcons() {
      if (!this.state.showShareIcons) return null
      return (
        <Row style={{height:120,borderBottomWidth:1,borderColor:colors.off,marginLeft:-20,width:width,marginBottom:20}}>
          <Col style={styleApp.center} activeOpacity={0.7} onPress={() => this.copyEvent()}>
            <View style={[styleApp.center,styles.roundView]}>
              {
                this.state.copied?
                <AllIcons name="check" type="font" color={colors.title} size={16} />
                :
                <AllIcons name="link" type="font" color={colors.title} size={16} />
              }
            </View>
            <Text style={[styleApp.text,{marginTop:10}]}>Copy link</Text>
          </Col>
          <Col style={styleApp.center} activeOpacity={0.7} onPress={() => this.shareEvent()}>
            <View style={[styleApp.center,styles.roundView]}>
              <AllIcons name="share" type="moon" color={colors.title} size={16} />
            </View>
            <Text style={[styleApp.text,{marginTop:10}]}>Share</Text>
          </Col>
        </Row>
      )
    }
  render() {
    return (
        <View>
          {this.shareIcons()}
          {this.searchBar()}

          {this.addContact()}

          {this.listContactsSelected()}

          {this.listContacts()}
        </View>
    );
  }
}

const styles = StyleSheet.create({
  content:{
    flex:1,
    width:'100%',
    marginBottom:10,
  },
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContactSelected:{
    width:width,flexDirection: 'row', 
    marginLeft:-20,
    borderBottomWidth:1,
    borderColor:colors.off,
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
  roundView:{
    height:50,
    width:50,
    borderRadius:25,
    backgroundColor:colors.off
  },
  text:{
    color:colors.title,
    fontSize:15,
    fontFamily: 'OpenSans-Regular',
  },
});

