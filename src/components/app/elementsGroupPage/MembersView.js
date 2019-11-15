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
import firebase from 'react-native-firebase'

import ButtonColor from '../../layout/Views/Button'
import AllIcons from '../../layout/icons/AllIcons'
import Communications from 'react-native-communications';
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListAttendees'
import LinearGradient from 'react-native-linear-gradient';
import NavigationService from '../../../../NavigationService'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

export default class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      members:[]
    };
  }
  componentDidMount() {
    this.load()
  }
  async load() {
    var members = await firebase.database().ref('groups/' + this.props.objectID + '/members/').once('value')
    members = members.val()
    if (members == null) members = []
    this.setState({loader:false,members:members})
  }
  async componentWillReceiveProps(nextProps) {
    if (nextProps.loader) {
      await this.setState({loader:true})
      this.load()
    }
  }
  rowUser (user,i,data) {
    return (
      <View  key={i} style={{paddingTop:10,paddingBottom:10}}>
        <Row>
          <Col size={10} style={styleApp.center2}>
            <AllIcons name='user' color={colors.grey} type='font' size={19} />
          </Col>
          <Col size={70} style={styleApp.center2}>
            <Text style={styleApp.text}>{user.info.name}</Text>
          </Col>
          <Col size={20} style={styleApp.center}>
          </Col>
        </Row>
      </View>
    )
  }
  async joinGroup () {
    console.log('join')
    var user = {
      userID:this.props.userID,
      status:'confirmed',
      info:{
        name:this.props.infoUser.firstname + ' ' + this.props.infoUser.lastname,
        phoneNumber:this.props.infoUser.countryCode + this.props.infoUser.phoneNumber
      }
    }
    await this.setState({members:{
      ...this.state.members,
      [this.props.userID]:user,
    }})
    await firebase.database().ref('usersGroups/' + this.props.userID + '/' + this.props.objectID).update({
      groupID:this.props.objectID,
      status:'confirmed',
      organizer:false,
    })
    await firebase.database().ref('groups/' + this.props.objectID + '/members/' + this.props.userID).update(user)
    return NavigationService.navigate('Group')
  }
  join (data) {
    if (!this.props.userConnected) {
      return NavigationService.navigate('SignIn',{pageFrom:'Group'})
    }
    if (data.organizer.userID == this.props.userID) {
      return NavigationService.navigate('Alert',{textButton:'Got it!',close:true,title:'You are the admin of this group.',subtitle:'You cannot join it.'})
    } else if (Object.values(this.state.members).filter(user => user.userID == this.props.userID).length != 0) {
      return NavigationService.navigate('Alert',{textButton:'Got it!',close:true,title:'You are already a member of this group.',subtitle:'You cannot join it.'})
    }
    return NavigationService.navigate('Alert',{textButton:'Join now',title:'Join ' + data.info.name,onGoBack:() => this.joinGroup()})
  }
  membersView(data) {
      return (
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>

          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={[styleApp.text,{marginBottom:0}]}>Members</Text>
            </Col >
            <Col style={styleApp.center3} size={20}>
              <ButtonColor view={() => {
                return <Text style={[styleApp.text,{color:'white'}]}>Join</Text>
              }} 
              click={() => this.join(data)}
              color={colors.green}
              style={[styleApp.center,{borderColor:colors.off,height:40,width:90,borderRadius:20,borderWidth:1}]}
              onPressColor={colors.greenClick}
              />
              </Col>
          </Row>
          
          

          <View style={[styleApp.divider2,{marginBottom:10}]} />
          {
            this.state.loader?
            <FadeInView duration={300} style={{paddingTop:10}}>
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
            </FadeInView>
            :Object.values(this.state.members).length == 0?
            <Text style={[styleApp.smallText,{marginTop:10}]}>No one has joined the group yet.</Text>
            :
            <FadeInView duration={300} style={{marginTop:5}}>
            {Object.values(this.state.members).map((user,i) => (
              this.rowUser(user,i,data)
            ))}
            </FadeInView>
          }

          </View>
        </View>
      )
  }
  render() {
    return (this.membersView(this.props.data));
  }
}

const styles = StyleSheet.create({

});


