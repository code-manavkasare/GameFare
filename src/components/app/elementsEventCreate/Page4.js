import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";

import Header from '../../layout/headers/HeaderButton'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import Contacts from './elementsContacts/Contacts'
import AllIcons from '../../layout/icons/AllIcons'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import branch from 'react-native-branch'
import SendSMS from 'react-native-sms'
import {date} from '../../layout/date/date'

class Page4 extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Invite your friends',
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      gesturesEnabled: navigation.getParam('pageFrom')=='CreateEvent3'?false:true,
      headerLeft: () => navigation.getParam('pageFrom') == 'CreateEvent3'?null:<TouchableOpacity style={{paddingLeft:15}} onPress={() => navigation.goBack()}>
      <AllIcons name='angle-left' color={'white'} size={23} type='font' />
    </TouchableOpacity>,
      headerRight: () => navigation.getParam('pageFrom') == 'event'?null:<TouchableOpacity style={{paddingRight:15}} onPress={() => navigation.navigate('ListEvents',{})}>
      <Text style={[styleApp.text,{fontFamily:'OpenSans-SemiBold',color:'white',fontSize:13}]}>Skip</Text>
      </TouchableOpacity>,
    }
  };
  componentDidMount() {
    console.log('page 4 mount')

  }
  page4() {
      return (
        <View>
          <Contacts params={this.props.navigation.getParam('data')} onRef={ref => (this.contactRef = ref)}/>
        </View>
      )
  }

  async submit() {
    var contacts = this.contactRef.getContactSelected()
    var that = this
    if (contacts.length == 0) {
      return this.props.navigation.navigate('ListEvents',{})
    }
    var infoEvent = this.props.navigation.getParam('data')
    var description='Join my event ' + infoEvent.info.name + ' on ' + date(infoEvent.date.start,'ddd, MMM D') + ' at ' + date(infoEvent.date.start,'h:mm a') +  ' by following the link!'
    console.log('event id!!!!')
    console.log(infoEvent)
    console.log(description)
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
    let controlParams = { $desktop_url: 'http://getgamefare.com', $ios_url: 'http://getgamefare.com' }

    let {url} = await branchUniversalObject.generateShortUrl(linkProperties, controlParams)

    var phoneNumbers = Object.values(contacts).map(contact => contact.phoneNumbers[0].number)
    console.log(url)
    console.log(phoneNumbers)
    console.log('phoneNumbers')
    SendSMS.send({
      body: description+ ' ' + url,
      recipients: phoneNumbers,
      successTypes: ['sent', 'queued'],
      allowAndroidSendWithoutReadPermission: true
      }, (completed, cancelled, error) => {
        if (cancelled || error) {
          return true
        }
        console.log('SMS Callback: completed: ' + completed + ' cancelled: ' + cancelled + 'error: ' + error);
        if (that.props.navigation.getParam('pageFrom') == 'event'){
          return that.props.navigation.goBack()
        }
        return that.props.navigation.navigate('ListEvents',{})
  
      });

  }
  iconBack() {
    if (this.props.navigation.getParam('pageFrom') == 'event') return 'angle-left'
    return ''
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>
        {/* <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Invite your friends'}
        icon={this.iconBack()}
        close={() => this.props.navigation.goBack()}
        /> */}
        
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page4.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        />

        <ButtonRound
          icon={'send'} 
          enabled={true} 
          loader={false} 
          click={() => this.submit()}
         />

      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{})(Page4);

