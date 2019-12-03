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
import LinearGradient from 'react-native-linear-gradient';
import PlaceHolder from '../../placeHolders/CardEvent'
import CardEvent from '../elementsHome/CardEvent'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

export default class Events extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      events:[]
    };
  }
  componentDidMount() {
    this.load()
  }
  async componentWillReceiveProps(nextProps) {
    if (nextProps.loader) {
      await this.setState({loader:true})
      this.load()
    }
  }
  async load() {
    var events = await firebase.database().ref('groups/' + this.props.objectID + '/events/').once('value')
    events = events.val()
    if (events == null) events = []
    this.setState({loader:false,events:events})
  }
  rowEvent(event,i){
    console.log('events!!!')
    console.log(event)
    return (
      <CardEvent userID={this.props.userID} key={i} groupPage={true} marginTop={25} navigate={(val,data) => this.props.navigate(val,data)} clickEvent={(event) => this.props.push('Event',{data:event,pageFrom:'Group'})} item={event} loadData={true}/>
    )
  }
  async newEvent() {
    if (!this.props.userConnected) return this.props.navigate('SignIn',{pageFrom:'Group'})
    if (this.props.userID != this.props.data.info.organizer) return this.props.navigate('Alert',{textButton:'Got it!',close:true,title:'You need to be admin of this groups in order to add events.',})
    await this.props.createEventAction('setStep1',{groups:[this.props.data]})
    await this.props.createEventAction('setStep0',{sport:this.props.data.info.sport})
    return this.props.navigate('CreateEvent0',{'pageFrom':'Group',group:this.props.data,sport:this.props.sport})
  }
  eventsView(data) {
      return (
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={styleApp.text}>Events</Text>
            </Col >
            <Col style={styleApp.center3} size={20}>
              <ButtonColor view={() => {
                return <Text style={styleApp.title}>+</Text>
              }} 
              click={this.newEvent.bind(this)}
              color='white'
              style={[styleApp.center,{borderColor:colors.off,height:40,width:40,borderRadius:20,borderWidth:1}]}
              onPressColor={colors.off}
              />
              </Col>
          </Row>
          
          

          <View style={[styleApp.divider2,{marginBottom:10}]} />
          <View style={{marginLeft:-20,width:width-21}}>
          {
            this.state.loader?
            <FadeInView duration={300} style={{paddingTop:10}}>
              <PlaceHolder />
            </FadeInView>
            :Object.values(this.state.events).length == 0?
            <Text style={[styleApp.smallText,{marginTop:10,marginBottom:20,marginLeft:20}]}>No events has been created yet.</Text>
            :
            <FadeInView duration={300} style={{marginTop:5,width:width}}>
            {Object.values(this.state.events).reverse().map((event,i) => (
              this.rowEvent(event,i)
            ))}
            </FadeInView>
          }
          </View>

          </View>
        </View>
      )
  }
  render() {
    return (this.eventsView(this.props.data));
  }
}

const styles = StyleSheet.create({

});


