import React,{Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Image
} from 'react-native';
import {connect} from 'react-redux';

const { height, width } = Dimensions.get('screen')
import Header from '../../layout/headers/HeaderButton'
import ScrollView from '../../layout/scrollViews/ScrollView'
import TextField from '../../layout/textField/TextField'
import Switch from '../../layout/switch/Switch'
import ButtonRound from '../../layout/buttons/ButtonRound'
import Button from '../../layout/buttons/Button'
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";

import AllIcons from '../../layout/icons/AllIcons'
import BackButton from '../../layout/buttons/BackButton'

import styleApp from '../../style/style'
import sizes from '../../style/sizes'
import colors from '../../style/colors';

import RNFetchBlob from 'react-native-fetch-blob'
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

class Page3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true,
      loader:false
    };
    this.translateYFooter = new Animated.Value(0)
    this.translateXFooter = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Group summary',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  async componentDidMount() {
    console.log('page3 mount')
    console.log(this.props.navigation.getParam('data'))
  }

  sport(sport) {
    return <TextField
    state={sport.text}
    placeHolder={''}
    heightField={50}
    multiline={false}
    editable={false}
    keyboardType={'default'}
    icon={sport.icon}
    typeIcon={sport.typeIcon}
  />
  }
  rowIcon(icon,component,typeIcon) {
    return (
      <Row style={{marginBottom:0,marginTop:10}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name={icon} size={18} type={typeIcon} color={colors.grey}/>
        </Col>
        
        <Col size={80} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
    )
  }
  title(text) {
    return <Text style={[styleApp.title,{fontSize:15,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
  }
  page2(data) {
      console.log('data')
      console.log(data)
      var sport = Object.values(this.props.sports).filter(sport => sport.value == data.info.sport)[0]
      return (
          <View style={{width:width,marginLeft:-20,marginTop:-20}}>
             <Image source={{uri:data.img}} style={{width:'100%',height:250,}}/>
            <View style={[styleApp.viewHome,{paddingTop:15}]}>
              <View style={styleApp.marginView}>
                <Row>
                  <Col size={25} style={styleApp.center2}>
                    <View style={[styleApp.viewSport,{marginTop:5}]}>
                      <Text style={styleApp.textSport}>{data.info.sport.charAt(0).toUpperCase() + data.info.sport.slice(1)}</Text>
                    </View>
                  </Col>
                  <Col size={65} style={styleApp.center3}></Col>
                  <Col size={10} style={styleApp.center3}>
                    <AllIcons name={data.info.public?'lock-open':'lock'} size={18} type={'font'} color={colors.blue}/>
                  </Col>
                </Row>
              </View>
            </View>

            

            <View style={[styleApp.viewHome,{paddingTop:15}]}>
              <View style={styleApp.marginView}>
              {this.rowIcon('map-marker-alt',this.title(data.location.address),'font')}
                {this.rowIcon('hashtag',this.title(data.info.name),'font')}
                {this.rowIcon('info-circle',this.title(data.info.description),'font')}
              </View>
            </View>



            <View style={[styleApp.viewHome,{paddingTop:20}]}>
              <View style={styleApp.marginView}>
              <Text style={[styleApp.title,{fontSize:13}]}>Reminder • <Text style={{fontFamily:'OpenSans-Regular'}}>Invite your friends/contacts to your group once you create the event</Text></Text>
              </View>
            </View>

          </View>
      )
  }
  async uploadImage(uploadUri,idGroup){
    try {
      let imageName = 'main'
      const imageRef = firebase.storage().ref('groups').child(idGroup).child('mainPicture').child(imageName)
      await imageRef.put(uploadUri, { contentType: 'image/jpg' })
      var url = imageRef.getDownloadURL()
      return url
    } catch (error) {
      console.log(error)
      alert(error.toString() + ' la ' + uploadUri)
      return false
    }
  }
  async submit(data) {
    this.setState({loader:true})
    
    var group = {
      ...data,
      info:{
        ...data.info,
        organizer:this.props.userID,
      },
      organizer:{
        userID:this.props.userID,
        name:this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname
      },
    }
    delete group['img']
    if (uri != false) {
      console.log('event')
      console.log(group)
      var pushEvent = await firebase.database().ref('groups').push(group)
      group.eventID = pushEvent.key
      group.objectID = pushEvent.key
      var uri = await this.uploadImage(data.img,pushEvent.key)
      await firebase.database().ref('groups/' + pushEvent.key).update({'groupID':pushEvent.key,'pictures':[uri]})
      var userGroup={
          groupID:pushEvent.key,
          status:'confirmed',
          organizer:true,
      }
      group.pictures = [uri]

      // var that = this
      // setTimeout(function () {
      //     firebase.database().ref('usersGroups/' + this.props.userID + '/' + pushEvent.key).update(userGroup)
             
      // }, 1000);
      try {
        await firebase.messaging().requestPermission();
        // User has authorised
        await firebase.messaging().subscribeToTopic(this.props.userID)
        await firebase.messaging().subscribeToTopic('all')
        await firebase.messaging().subscribeToTopic(pushEvent.key)
      } catch (error) {
          // User has rejected permissions
      }
      this.setState({loader:false})
      this.props.navigation.navigate('Contacts',{data:group,pageFrom:'CreateGroup1',openPageLink:'openGroupPage'}) 

    } else {
      return this.setState({loader:false})
    }
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1,borderRightWidth:1}]}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.page2(this.props.navigation.getParam('data'))}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+90}
          showsVerticalScrollIndicator={false}
        />


        <View style={styleApp.footerBooking}>
        {
          this.props.userConnected?
          <Button
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          enabled={true} 
          disabled={false}
          text={'Create group'}
          loader={this.state.loader} 
          click={() => this.submit(this.props.navigation.getParam('data'))}
         />
         :
         <Button
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          enabled={true} 
          text='Sign in to proceed'
          loader={false} 
          click={() => this.props.navigation.navigate('SignIn',{pageFrom:'CreateGroup1'})}
         />
        }
         </View>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({

  });


  const  mapStateToProps = state => {
    return {
      sports:state.globaleVariables.sports.list,
      userConnected:state.user.userConnected,
      userID:state.user.userID,
      infoUser:state.user.infoUser.userInfo,
    };
  };
  
  export default connect(mapStateToProps,{})(Page3);
