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
import FontIcon from 'react-native-vector-icons/FontAwesome';
import StatusBar from '@react-native-community/status-bar';
import BackButton from '../../layout/buttons/BackButton'
import Button from '../../layout/buttons/Button'

import Header from '../../layout/headers/HeaderButton'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ScrollView from '../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import Switch from '../../layout/switch/Switch'
import AllIcons from '../../layout/icons/AllIcons'
import DateEvent from './DateEvent'
import {date} from '../../layout/date/date'

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

export default class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player:false,
      coachNeeded:false,
    };
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Organize an event',
      headerStyle: {
          backgroundColor: colors.primary,
          borderBottomWidth:0
      },
      headerTitleStyle: {
          color:'white',
          fontFamily:'OpenSans-Bold',
          fontSize:14,
      },
      headerLeft: () => (
        <BackButton name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  componentDidMount() {
    console.log('page 1 mount')
  }
  page0() {
      return (
        <View style={{marginTop:-15}}>
          
          <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>I am a...</Text>

          <View style={{height:20}} />
          {
            this.state.player?
            <Button text="Coach" click={() => this.setState({player:false})} backgroundColor={'white'} onPressColor={colors.primary} textButton={{color:colors.primary}}/>
            :
            <Button text="Coach" click={() => this.setState({player:false})} backgroundColor={'primary'} onPressColor={colors.primary}/>
          }
          
          <View style={{height:10}} />
          {
            !this.state.player?
            <Button text="Player" click={() => this.setState({player:true})} backgroundColor={'white'} onPressColor={colors.primary} textButton={{color:colors.primary}}/>
            :
            <Button text="Player" click={() => this.setState({player:true})} backgroundColor={'primary'} onPressColor={colors.primary}/>
          }
          
          {
            this.state.player?
            <TouchableOpacity style={{marginTop:25}} activeOpacity={0.7} onPress={() => this.setState({coachNeeded:!this.state.coachNeeded})}>
            <Row >
              <Col size={15} style={styleApp.center2}>
                <AllIcons name='check' type='mat' color={!this.state.coachNeeded?colors.grey:colors.green} size={23} />
              </Col>
              <Col size={85} style={styleApp.center2}>
                <Text style={[styleApp.text,{fontSize:17,color:!this.state.coachNeeded?colors.grey:colors.green},]}>I need a coach</Text>
              </Col>
            </Row>
            </TouchableOpacity>
            :null
          }
        </View>
      )
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1 }}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page0.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />

        <ButtonRound
          icon={'next'} 
          enabled={true}
          loader={false} 
          click={() => this.props.navigation.navigate('CreateEvent1',{data:this.state})}
         />

      </View>
    );
  }
}

const styles = StyleSheet.create({

});
0

