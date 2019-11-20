import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated,
    //ScrollView,
    Image
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import PlaceHolder from '../../../placeHolders/CardEvent'
import Header from '../../../layout/headers/HeaderButton'
import ScrollView from '../../../layout/scrollViews/ScrollView2'
import Switch from '../../../layout/switch/Switch'
import ButtonAdd from '../../elementsHome/ButtonAdd'

import AllIcons from '../../../layout/icons/AllIcons'
import BackButton from '../../../layout/buttons/BackButton'
import Button from '../../../layout/buttons/Button'
import CardEvent from '../../elementsHome/CardEvent'
import SwiperLogout from '../elementsProfile/SwiperLogout'
import Swiper from 'react-native-swiper'
import FadeInView from 'react-native-fade-in-view';
import NewEventCard from '../../elementsHome/NewEventCard'

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import colors from '../../../style/colors';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      events:[],
      organizer:false,
      index:0
    };
    this.events = this.events.bind(this)
    this.translateXVoile = new Animated.Value(width)
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.opacityVoile = new Animated.Value(0.3)
  }
  async componentDidMount() {
    if (this.props.userConnected) this.loadEvents(this.props.userID)

    
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.userConnected == true && this.props.userConnected == false) {
      console.log('list events now connected')
      this.loadEvents(nextProps.userID)
    }
  }
  async loadEvents(userID) {
    var that = this
    firebase.database().ref('usersEvents/' + userID).on('value', function(snapshot) {
      console.log('on charge les match !!!!!!!')
      that.setState({loader:true})
      var events = []
      snapshot.forEach(function(childSnapshot) {
        var event = childSnapshot.val()
        event.objectID = childSnapshot.key
        events.push(event)
      });
      that.setState({events:events,loader:false})
    })
  }
  events () {
    return (
      <View style={{flex:1,marginLeft:-20,width:width}}>
        {this.listEvent()}
      </View>
    )
  }
  listEvent() {
    return (
      <View style={{paddingTop:20}}>
          <View style={styleApp.marginView}>
            <Text style={styleApp.title}>My events</Text>
          </View>

          <View style={[styleApp.divider2,{marginLeft:20,width:width-40}]}/>
          { 
          !this.props.userConnected?
          this.eventsLogout()
          :this.state.loader?
          <View>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </View>
          :
          <FadeInView duration={350}>
            {
              Object.values(this.state.events).length == 0?
              this.eventsLogout()
              :
              Object.values(this.state.events).reverse().map((event,i) => (
                <CardEvent loadData={true} key={i} userID={this.props.userID} userCard={true} openEvent={(event) => this.props.navigation.push('Event',{data:event,pageFrom:'ListEvents'})} item={event}/>
              ))
            }
          </FadeInView>
        }
        <View style={[styleApp.divider2,{marginLeft:20,width:width-40}]}/>
        <NewEventCard pageFrom='ListEvents' />
      </View>
    )
  }
  rowCheck (text) {
    return (
      <Row style={{height:30}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name='check' type='mat' size={17} color={colors.grey} />
        </Col>
        <Col size={90}  style={styleApp.center2}>
          <Text style={[styleApp.text,{fontSize:14,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  eventsLogout() {
    return (
      <View style={[styleApp.marginView,{paddingTop:20}]}>
      <SwiperLogout type={'events'}/>

      <View style={{height:20}} />
      <Button text='Create your event' click={() => this.props.navigation.navigate('CreateEvent0',{pageFrom:'ListEvents'})} backgroundColor={'blue'} onPressColor={colors.blueLight}/>
      <View style={{height:10}} />
      <Button text='Join sessions' click={() => this.props.navigation.navigate('Home',{pageFrom:'ListEvents'})} backgroundColor={'secondary'} onPressColor={colors.secondary}/>
      <View style={{height:10}} />
      {
      !this.props.userConnected?
      <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'ListEvents'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      :null
      }
      </View>
    )
  }
  async refresh() {
    await this.setState({loader:true})
    this.setState({loader:false})
  }
  render() {
    return (
      <View style={{flex:1 }}>
        <View style={{height:sizes.marginTopApp}} />
        <ScrollView
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.listEvent()}
          marginBottomScrollView={sizes.marginTopApp}
          marginTop={0}

          initialColorIcon={colors.title}
          icon1={'plus'}
          clickButton1={() => this.props.navigation.navigate('CreateEvent0',{'pageFrom':'ListEvents'})}

          colorRefresh={colors.title}
          refreshControl={true}
          refresh={() => this.refresh()}
          offsetBottom={90}
          showsVerticalScrollIndicator={true}
        />

        <Animated.View style={[styleApp.voile,{opacity:this.opacityVoile,transform:[{translateX:this.translateXVoile}]}]}/>
        <ButtonAdd 
        translateXVoile={this.translateXVoile}
        opacityVoile={this.opacityVoile}
        new ={(val) => {
          if (val == 'event') return this.props.navigation.navigate('CreateEvent0',{'pageFrom':'ListEvents'})
          return this.props.navigation.navigate('CreateGroup0',{'pageFrom':'ListEvents'})
        }}
        />

              
      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    userConnected:state.user.userConnected
  };
};

export default connect(mapStateToProps,{})(ListEvent);

