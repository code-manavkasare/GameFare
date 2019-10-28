import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Button
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase'

const { height, width } = Dimensions.get('screen')
import colors from '../style/colors'
import styleApp from '../style/style'
import sizes from '../style/sizes'
import {Grid,Row,Col} from 'react-native-easy-grid';

import ScrollView from '../layout/scrollViews/ScrollView'
import Header from '../layout/headers/HeaderButton'
import AllIcons from '../layout/icons/AllIcons'
import DateEvent from './elementsEventCreate/DateEvent'
import ButtonRound from '../layout/buttons/ButtonRound'
import Button2 from '../layout/buttons/Button'
import Loader from '../layout/loaders/Loader'

class EventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed:true,
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('data').info.name,
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerRight: () => (
        <TouchableOpacity style={{paddingRight:15}} onPress={() => navigation.navigate('CreateEvent4',{pageFrom:'event',data:{...navigation.getParam('data'),eventID:navigation.getParam('data').objectID}})}>
          <AllIcons name='share' color={'white'} size={18} type='moon' />
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity style={{paddingLeft:15}} onPress={() => navigation.goBack()}>
          <AllIcons name='angle-left' color={'white'} size={23} type='font' />
        </TouchableOpacity>
      ),
    }
  };
  async componentDidMount() {
    var usersConfirmed = await firebase.database().ref('events/' + this.props.navigation.getParam('data').objectID + '/usersConfirmed').once('value')
    usersConfirmed = usersConfirmed.val()
    if (usersConfirmed == null) {
      usersConfirmed = []
    }
    console.log('usersConfirmed')
    console.log(usersConfirmed)
    var infoOrganizer = await firebase.database().ref('users/' + this.props.navigation.getParam('data').info.organizer + '/userInfo').once('value')
    infoOrganizer = infoOrganizer.val()
    this.setState({usersConfirmed:usersConfirmed,infoOrganizer:infoOrganizer})
  }
  cancel() {
    console.log('cancel!!!!')
    this.props.navigation.navigate('Event')
  }
  rowIcon (component,icon) {
    return (
      <Row style={{marginTop:20}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name={icon} color={colors.grey} size={18} type='font' />
        </Col>
        <Col size={90} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
    )
  }
  title(text) {
    return <Text style={[styleApp.title,{fontSize:15,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
  }
  dateTime(start,end) {
    return <DateEvent 
    start={start}
    end={end}
    />
  }
  getIconField(field,step2) {
    var icon = field.icon
    if (field.field == 'expandable') {
      icon = field.list.filter(field1 => field1.value == step2[field.value])[0].icon
    }
    return icon
  }
  getTextField(field,step2) {
    if (field.field == 'plus') {
      return step2[field.value] + ' ' + field.value
    }
    return step2[field.value].charAt(0).toUpperCase() + step2[field.value].slice(1)
  }
  rowOrganizer() {
    if (this.state.usersConfirmed == true) return null
    return <Row style={{height:40,marginTop:10}}>
      <Col size={15} style={styleApp.center2}>
        <AllIcons name='user-alt' color={colors.grey} type='font' size={20}/>
      </Col>
      <Col size={85} style={styleApp.center2}>
        <Text style={styleApp.text}>{this.state.infoOrganizer.firstname} {this.state.infoOrganizer.lastname} (organizer)</Text>
      </Col>
    </Row>
  }
  openCondition() {
    if (Object.values(this.state.usersConfirmed).length <= Number(this.props.navigation.getParam('data').info.maxAttendance)) return true
    return false
  }
  openView() {
    if (this.state.usersConfirmed == true) return <View style={{height:25,width:70}} />
    console.log('this.openCondition()')
    console.log(this.openCondition())
    return <View style={this.openCondition()?styles.viewSport:{...styles.viewSport,backgroundColor:colors.primaryLight}}>
    <Text style={this.openCondition()?styles.textSport:{...styles.textSport,color:'white'}}>{this.openCondition()?'Open':'Full'}</Text>
  </View>
  }
  event() {
    var sport = this.props.sports.filter(sport => sport.value == this.props.navigation.getParam('data').info.sport)[0]
    console.log('sport')
    console.log(sport)
    return (
      <View>
        <Row>
          <Col size={80} style={styleApp.center2}>
            <Text style={styleApp.title}>{this.props.navigation.getParam('data').info.name}</Text>
          </Col>
          <Col size={20} style={styleApp.center3}>
          {this.openView()}
          <View style={[styles.viewSport,{marginTop:5}]}>
            <Text style={styles.textSport}>{this.props.navigation.getParam('data').info.sport.charAt(0).toUpperCase() + this.props.navigation.getParam('data').info.sport.slice(1)}</Text>
          </View>
          
          </Col>
        </Row>
        
        {this.rowIcon(this.dateTime(this.props.navigation.getParam('data').date.start,this.props.navigation.getParam('data').date.end),'calendar-alt')}
        {this.rowIcon(this.title(this.props.navigation.getParam('data').location.area),'map-marker-alt')}
        {this.rowIcon(this.title(Number(this.props.navigation.getParam('data').price.joiningFee) == 0?'Free entry':this.props.navigation.getParam('data').price.joiningFee + ' entry fee'),'dollar-sign')}

        <View style={[styleApp.divider,{marginBottom:20}]} />

        <Text style={styleApp.title}>Event settings</Text>
        
        {
            Object.values(sport.fields).filter(field => field != null).map((field,i) => (
              <View key={i}>
                {this.rowIcon(this.title(this.getTextField(field,this.props.navigation.getParam('data').advancedSettings)),this.getIconField(field,this.props.navigation.getParam('data').advancedSettings))}
              </View>
        ))}

        <View style={[styleApp.divider,{marginBottom:20}]} />

        <Text style={styleApp.title}>Confirmed attendees</Text>
        {this.rowOrganizer()}
        

        {
          this.state.usersConfirmed == true?
          <Row style={{marginTop:20}}>
            <Col style={styleApp.center}>
            <Loader size={20} color='primary' />
            </Col>
          </Row>
          :this.state.usersConfirmed.length == 0?
          null
          :
          <View style={{marginTop:0}}>
          {Object.values(this.state.usersConfirmed).map((user,i) => (
            <Row key={i} style={{height:40}}>
              <Col size={15} style={styleApp.center2}>
                <AllIcons name='user-alt' color={colors.grey} type='font' size={20}/>
              </Col>
              <Col size={85} style={styleApp.center2}>
                <Text style={styleApp.text}>{user.captainInfo.name}</Text>
              </Col>
            </Row>
          ))}
          </View>
        }

        <View style={[styleApp.divider,{marginBottom:20}]} />

      </View>
    )
  }
  clickIconRight () {
    this.props.navigation.navigate('CreateEvent4',{pageFrom:'event',data:{...this.props.navigation.getParam('data'),eventID:this.props.navigation.getParam('data').objectID}})
  }
  clickCancel() {
    this.props.navigation.navigate('Alert',{title:'Do you want to unjoin this event?',textButton:'Unjoin',onGoBack:() => this.cancel()})
  }
  render() {
    return (
      <View style={{ flex:1,backgroundColor:'white' }}>

        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.event.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={190}
          showsVerticalScrollIndicator={true}
        />
        {
          this.state.usersConfirmed == true?
          null
          :!this.openCondition()?
          null
          :this.props.navigation.getParam('pageFrom') == 'home'?
          <View style={styleApp.footerBooking}>
          <Button2
          icon={'next'} 
          backgroundColor='green'
          onPressColor={colors.greenClick}
          styleButton={{marginLeft:20,width:width-40}}
          disabled={false} 
          text='Join the event'
          loader={false} 
          click={() => this.props.navigation.navigate('Checkout',{pageFrom:'event',data:{...this.props.navigation.getParam('data'),eventID:this.props.navigation.getParam('data').objectID}})}
         />
         </View>
         :null
        }
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewSport:{
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    height:25,
    width:70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
});


const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
    userID:state.user.userID
  };
};

export default connect(mapStateToProps,{})(EventPage);
