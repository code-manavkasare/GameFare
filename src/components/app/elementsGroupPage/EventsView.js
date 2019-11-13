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
    return (
      <View key={i}>
        <Text>event</Text>
      </View>
    )
  }
  eventsView(data) {
      return (
        <View style={[styleApp.viewHome,{paddingBottom:0}]}>
          <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={styleApp.text}>Events</Text>
            </Col >
            <Col style={styleApp.center3} size={20}>
              <ButtonColor view={() => {
                return <Text style={styleApp.title}>+</Text>
              }} 
              click={() => this.props.newEvent()}
              color='white'
              style={[styleApp.center,{borderColor:colors.off,height:40,width:40,borderRadius:20,borderWidth:1}]}
              onPressColor={colors.off}
              />
              </Col>
          </Row>
          
          

          <View style={[styleApp.divider2,{marginBottom:10}]} />
          <View style={{marginLeft:-20,width:width}}>
          {
            this.state.loader?
            <FadeInView duration={300} style={{paddingTop:10}}>
              <PlaceHolder />
            </FadeInView>
            :Object.values(this.state.events).length == 0?
            <Text style={[styleApp.smallText,{marginTop:10,marginBottom:20,marginLeft:20}]}>No events has been created yet.</Text>
            :
            <FadeInView duration={300} style={{marginTop:5}}>
            {Object.values(this.state.events).map((event,i) => (
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


