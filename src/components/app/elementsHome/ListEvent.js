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
import indexEvents from '../../database/algolia'
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListEvents'
import CardEvent from './CardEvent'
import ScrollView from '../../layout/scrollViews/ScrollView'
import Button from '../../layout/buttons/Button'


class ListEvents extends React.Component {
  state={
    events:[],
    loader:true
  }
  async componentDidMount() {
    var events = await indexEvents.search({
      query: ''
    })
    console.log('eventswdsflfgjlkdfjglkd')
    console.log(events)
    console.log(this.props.globaleVariables)
    this.setState({loader:false,events:events.hits})
  }
  homePageComponent () {
    return (
      <View style={{margingTop:20}}>
        <Text style={[styleApp.title,{marginBottom:10}]}>{this.props.globaleVariables.tabs.home.title}</Text>
        <Text style={[styleApp.subtitle,{marginBottom:20}]}>{this.props.globaleVariables.tabs.home.subtitle}</Text>

        { 
          this.state.loader?
          <PlaceHolder />
          :
          <FadeInView duration={350}>
            {this.state.events.map((event,i) => (
              <CardEvent key={i} homePage={true} marginTop={25} navigate={(val,data) => this.props.navigate(val,{data:event,pageFrom:'home'})} item={event}/>
            ))}
          </FadeInView>
        }

      <View style={{height:1,backgroundColor:'#eaeaea',marginLeft:-20,width:width,}}/>
          <View style={{flex:1,backgroundColor:'#F6F6F6',width:width,marginLeft:-20,paddingLeft:20,paddingRight:20,paddingTop:20,borderBottomWidth:1,borderColor:'#eaeaea'}}>
            <Text style={[styles.text,{fontSize:18,}]}>Want to organize an event?</Text>
            <Text style={[styles.text,{fontSize:15,marginTop:10,fontFamily:'OpenSans-Regular'}]}>Pick your sport and join the GameFare community now!</Text>
            <Button backgroundColor={'green'} onPressColor={colors.greenClick} click={() => this.props.navigate('CreateEvent1',{})} text={'Organize your event'} styleButton={{marginBottom:25,marginTop:20}} loader={false}/>
        </View>
      </View>
    )
  }
  render() {
    return (
        <ScrollView 
          style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.homePageComponent.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={false}
        />
    );
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
