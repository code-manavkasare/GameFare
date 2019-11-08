import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated,
    Image,
    TextInput,
} from 'react-native';

import firebase from 'react-native-firebase'
import {connect} from 'react-redux';

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";
import {indexGroups} from '../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListEvents'
import CardEvent from './CardEvent'
import ScrollView from '../../layout/scrollViews/ScrollView'
import Button from '../../layout/buttons/Button'
import AllIcons from '../../layout/icons/AllIcons'

class ListEvents extends React.Component {
  state={
    events:[],
    loader:true
  }
  async componentDidMount() {
    this.loadEvent()
  }
  async loadEvent() {
    console.log('on reload')
    console.log(events)
    this.setState({loader:true})
    indexGroups.clearCache()
    var events = await indexGroups.search({
      query: ''
    })
    console.log('events.hits')
    console.log(events.hits)
    await this.setState({loader:false,events:events.hits})
    events = ''
    return true
  }
  openEvent(event) {
    if (!event.info.public) {
      return this.props.navigate('Alert',{close:true,title:'The event is private.',subtitle:'You need to receive an invitation in order to join it.',pageFrom:'Home',textButton:'Got it!',icon:<AllIcons name='lock' color={colors.blue} size={21} type='mat' />})
    }
    return this.props.navigate('Event',{data:event,pageFrom:'Home',loader:true})
  }
  ListEvent () {
    return (
      <View style={styleApp.viewHome}>
        <Text style={[styleApp.title,{marginBottom:5,marginLeft:20}]}>Groups</Text>
        <Text style={[styleApp.subtitle,{marginBottom:20,marginLeft:20}]}>Los Angeles, California</Text>


        { 
          this.state.loader?
          <PlaceHolder />
          :
          <FadeInView duration={350}>
            {this.state.events.map((event,i) => (
              <CardEvent key={i} homePage={true} marginTop={25} openEvent={() => this.openEvent(event)} item={event}/>
            ))}
          </FadeInView>
        }

        
      </View>
    )
  }
  render() {
    return this.ListEvent()
  }
}

const styles = StyleSheet.create({
  text:{
    fontFamily:'OpenSans-SemiBold',
    color:colors.title
  }
});

const  mapStateToProps = state => {
  return {
    globaleVariables:state.globaleVariables
  };
};

export default connect(mapStateToProps,{})(ListEvents);
