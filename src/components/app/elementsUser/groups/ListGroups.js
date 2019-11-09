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
import PlaceHolder from '../../../placeHolders/ListEventsUser'
import Header from '../../../layout/headers/HeaderButton'
import ScrollView from '../../../layout/scrollViews/ScrollView'
import Switch from '../../../layout/switch/Switch'

import AllIcons from '../../../layout/icons/AllIcons'
import BackButton from '../../../layout/buttons/BackButton'
import Button from '../../../layout/buttons/Button'
import CardEvent from './CardEvent'
import SwiperLogout from '../elementsProfile/SwiperLogout'

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import colors from '../../../style/colors';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true,
      events:[],
      organizer:false,
      index:0
    };
    this.events = this.events.bind(this)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'My groups',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      // headerLeft: () => <BackButton name='home' type='mat' size={20} click={() => navigation.navigate('Home')} />,
      headerRight: () => <BackButton color={colors.primary} name='add' type='mat' click={() => navigation.navigate('CreateEvent0',{'pageFrom':'ListEvents'})}/>,
    }
  };
  async componentDidMount() {
    if (this.props.userConnected) this.loadEvents(this.props.userID)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.userConnected == true && this.props.userConnected == false) {
      console.log('list events now connected')
      this.loadEvents(nextProps.userID)
    }
  }
  loadEvents(userID) {
    var that = this
    firebase.database().ref('usersGroups/' + userID).on('value', function(snap) {
      console.log('on charge les match !!!!!!!')
      that.setState({initialLoader:true})
      var events = snap.val()
      if (events == null) {
        events = []
      } else {
        //events = Object.values(events)
        events = Object.values(events).map((event,i) => {
          var event = event
          event.objectID = Object.keys(events)[i]
          return event
        });
      }
      console.log(events)
      console.log(userID)
      that.setState({events:events,initialLoader:false,index:0,organizer:false})
    })
  }
  events () {
    return (
      <View style={{flex:1}}>
        {this.listEvent('join')}
      </View>
    )
  }
  listEvent(val) {
      if (this.state.initialLoader) return <PlaceHolder />
      if (this.state.events.length == 0) return this.noAppt()
      return (
            this.state.events.map((event,i) => (
              <CardEvent userID={this.props.userID} key={i} homePage={true} marginTop={25} navigate={(val,data) => this.props.navigation.navigate(val,data)} clickEvent={(event) => this.props.navigation.push('Event',{data:event,pageFrom:'ListEvents',loader:true})} item={event}/>
            ))
      )
  }
  noAppt (val) {
    return (
      <View style={[{height:'100%',marginTop:70,marginLeft:0,width:'100%'}]}>
        <View style={styleApp.center}>
        <Row style={{height:100}}>
          <Col style={styleApp.center}>
            <Image source={require('../../../../img/images/desk.png')} style={{width:100,height:100,marginBottom:0}} />      
          </Col>
        </Row>
        
        <Text style={[styleApp.text,{fontSize:15,marginBottom:20,marginTop:20}]}>You haven't joined any group yet.</Text>
        
        <View style={{height:10}} />
        <Button text='Join group' click={() => this.props.navigation.navigate('Home',{pageFrom:'ListEvents'})} backgroundColor={'green'} onPressColor={colors.greenLight2}/>
        <View style={{height:10}} />
        <Button text='Create a group' click={() => this.props.navigation.navigate('CreateEvent0',{pageFrom:'ListEvents'})} backgroundColor={'blue'} onPressColor={colors.blueLight}/>

        
        </View>
      </View>
    )
  }
  async close () {
    await firebase.database().ref('usersEvents/' + this.props.userID).off()
    this.props.navigation.navigate('Home')
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
      <View>
      <SwiperLogout type={'groups'}/>

      <View style={{height:20}} />
      <Button text='Create your group' click={() => this.props.navigation.navigate('CreateEvent0',{pageFrom:'ListGroups'})} backgroundColor={'primary'} onPressColor={colors.primary2}/>
      <View style={{height:10}} />
      {
      !this.props.userConnected?
      <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'ListGroups'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      :null
      }
      </View>
    )
  }
  render() {
    return (
      <View style={{backgroundColor:colors.off2,flex:1,paddingTop:10 }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.props.userConnected && Object.values(this.state.events).length != 0?this.events():this.eventsLogout()}
          marginBottomScrollView={0}
          marginTop={-20}
          refreshControl={true}
          refresh={() => {this.setState({loader:true});this.setState({loader:false})}}
          offsetBottom={sizes.heightFooterBooking+60}
          showsVerticalScrollIndicator={false}
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

