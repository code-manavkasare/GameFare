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
import firebase from 'react-native-firebase'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import PlaceHolder from '../../../placeHolders/ListEventsUser'
import Header from '../../../layout/headers/HeaderButton'
import ScrollView from '../../../layout/scrollViews/ScrollView'
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
  async componentDidMount() {
    var that = this
    firebase.database().ref('usersEvents/' + this.props.userID).on('value', function(snap) {
      console.log('on charge les match !!!!!!!')
      var events = snap.val()
      if (events == null) {
        events = []
      } else {
        events = Object.values(events)
      }
      console.log(events)
      console.log(that.props.userID)
      that.setState({events:events,initialLoader:false})
    })
  }
  listEvent() {
      if (this.state.initialLoader) return <PlaceHolder />
      return (
          <View style={{marginTop:0}}>
            {this.state.events.map((event,i) => (
              <CardEvent key={i} homePage={true} marginTop={25} navigate={(val,data) => this.props.navigation.navigate(val,{data:event,pageFrom:'user'})} item={event}/>
            ))}
          <View style={{height:1,backgroundColor:colors.off,width:width,marginLeft:-20}} />
        </View>
      )
  }
  async close () {
    await firebase.database().ref('usersEvents/' + this.props.userID).off()
    this.props.navigation.navigate('Home')
  }
  render() {
    return (
      <View style={{backgroundColor:'white',height:height }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Your events'}
        icon={'angle-left'}
        iconRight={'plus'}
        clickIconRight={() => this.props.navigation.navigate('CreateEvent1',{})}
        close={() => this.close()}
        />
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.listEvent.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90+60}
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
    userID:state.user.userID
  };
};

export default connect(mapStateToProps,{})(ListEvent);

