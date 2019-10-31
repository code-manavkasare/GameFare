import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated,
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
import AllIcons from '../../../layout/icons/AllIcons'
import BackButton from '../../../layout/buttons/BackButton'
import Button from '../../../layout/buttons/Button'
import CardEvent from './CardEvent'

import sizes from '../../../style/sizes'
import styleApp from '../../../style/style'
import colors from '../../../style/colors';

class ListEvent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true,
      events:[]
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Your events',
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      // headerLeft: () => <BackButton name='home' type='mat' size={20} click={() => navigation.navigate('Home')} />,
      headerRight: () => <BackButton name='add' type='mat' click={() => navigation.navigate('CreateEvent1',{'pageFrom':'ListEvents'})}/>,
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

    firebase.database().ref('usersEvents/' + userID).on('value', function(snap) {
      console.log('on charge les match !!!!!!!')
      var events = snap.val()
      if (events == null) {
        events = []
      } else {
        events = Object.values(events)
      }
      console.log(events)
      console.log(userID)
      that.setState({events:events,initialLoader:false})
    })
  }
  listEvent() {
      if (this.state.initialLoader) return <PlaceHolder />
      return (
          <View style={{marginTop:0}}>
            {this.state.events.map((event,i) => (
              <CardEvent key={i} homePage={true} marginTop={25} navigate={(val,data) => this.props.navigation.push(val,{data:event,pageFrom:'user'})} item={event}/>
            ))}
          <View style={{height:1,backgroundColor:colors.off,width:width,marginLeft:-20}} />
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
          <Text style={[styleApp.text,{fontSize:14}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  eventsLogout() {
    return (
      <View style={[{flex:1,marginTop:20}]}>
        <Row>
          <Col style={styleApp.center}>
            <Image source={require('../../../../img/images/inauguration.png')} style={{width:100,height:100,marginBottom:30}} />
          </Col>
        </Row>
        <Text style={[styleApp.title,{fontSize:19,marginBottom:15}]}>Join the GameFare community now!</Text>

        {this.rowCheck('Organize your sport events')}
        {this.rowCheck('Join sessions')}
        {this.rowCheck('Find your favourite coach')}
        {this.rowCheck('Rate your oponents')}
        {this.rowCheck('Create your community')}

        <View style={{height:20}} />
        <Button text='Organize your event' click={() => this.props.navigation.navigate('CreateEvent1',{pageFrom:'ListEvents'})} backgroundColor={'blue'} onPressColor={colors.blueLight}/>
        <View style={{height:10}} />
        <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'ListEvents'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      </View>
    )
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.props.userConnected?this.listEvent():this.eventsLogout()}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={20}
          showsVerticalScrollIndicator={true}
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

