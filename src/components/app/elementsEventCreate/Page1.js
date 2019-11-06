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

class Page1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      private:false,
      players:1,
      levelFilter:{
        text:"Joining",
        value:'join',
        type:'join',
        expendable:true,
        alwaysExpanded:true,
        value:Object.values(this.props.sports[0].level.list)[0],
        valueSelected:Object.values(this.props.sports[0].level.list)[0].value,
        listExpend:Object.values(this.props.sports[0].level.list)
      },
      levelOption:{
        text:"Joining",
        value:'join',
        type:'join',
        expendable:true,
        alwaysExpanded:true,
        valueSelected:'equal',
        listExpend:[{value:'equal',text:'Only'},{value:'min',text:'And above'},{value:'max',text:'And below'}]
      },
      genderFilter:{
        text:"Gender",
        value:'gender',
        type:'gender',
        expendable:true,
        alwaysExpanded:true,
        valueSelected:'mixed',
        listExpend:[ {
          "icon" : "venus-mars",
          "text" : "Mixed",
          "typeIcon" : "font",
          "value" : "mixed"
        }, {
          "icon" : "venus",
          "text" : "Female",
          "typeIcon" : "font",
          "value" : "female"
        }, {
          "icon" : "mars",
          "text" : "Male",
          "typeIcon" : "font",
          "value" : "male"
        } ]
      },
    };
    this.translateYFooter = new Animated.Value(0)
    this.translateXFooter = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Access settings',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  componentDidMount() {
    console.log('page 1 mount')
    console.log(this.props.sports)
  }
  switch (textOn,textOff,state,translateXComponent0,translateXComponent1) {
    return (
      <Switch 
        textOn={textOn}
        textOff={textOff}
        translateXTo={width/2-20}
        height={50}
        translateXComponent0={translateXComponent0}
        translateXComponent1={translateXComponent1}
        state={this.state[state]}
        setState={(val) => this.setState({[state]:val})}
      />
    )
  }
  levelFilter() {
    return (
      <ExpandableCard 
          option = {this.state.levelFilter} 
          tickFilter={(value) => {
          var levelFilter = this.state.levelFilter
          levelFilter.value = Object.values(this.props.sports[0].level.list).filter(level => level.value == value)[0]
          levelFilter.valueSelected = value
          this.setState({levelFilter:levelFilter})
        }}
      />
    )
  }
  levelOption() {
    return (
      <ExpandableCard 
          option = {this.state.levelOption} 
          tickFilter={(value) => {
          var levelOption = this.state.levelOption
          levelOption.valueSelected = value
          this.setState({levelOption:levelOption})
        }}
      />
    )
  }
  gender() {
    return (
      <ExpandableCard 
          option = {this.state.genderFilter} 
          tickFilter={(value) => {
          var genderFilter = this.state.genderFilter
          genderFilter.valueSelected = value
          this.setState({genderFilter:genderFilter})
        }}
      />
    )
  }
  plusMinus(state,maxValue,increment,minValue,icon) {
    return(
      <Row style={styleApp.inputForm}>
        <Col size={15} style={styleApp.center}>
          <AllIcons name={icon} color={colors.title} size={17} type='font' />
        </Col>
        <Col size={55} style={[styleApp.center2,{paddingLeft:15}]}>
          <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular'}]}>{this.state[state]} {state}</Text>
        </Col>
        <Col size={15} style={styleApp.center} activeOpacity={0.7} onPress={() => {
          if (this.state[state] != minValue) {
            this.setState({[state]:this.state[state]-increment})
          }
        }} >
          <AllIcons name={'minus'} color={colors.title} size={17} type='font' />
        </Col>
        
        <Col size={15} style={styleApp.center} activeOpacity={0.7} onPress={() => {
          if (this.state[state] != maxValue) {
            this.setState({[state]:this.state[state]+increment})
          }
        }} >
          <AllIcons name={'plus'} color={colors.title} size={17} type='font' />
        </Col>
        
      </Row>
    )
  }
  

  page1() {
      return (
        <View style={{marginTop:-15}}>

          <Text style={[styleApp.title,{fontSize:19,marginTop:20}]}>Access</Text>
          {this.switch('Open access','Invite only','private')}
          {this.levelFilter()}
          {this.state.levelFilter.valueSelected != 0?this.levelOption():null}


          <Text style={[styleApp.title,{fontSize:19,marginTop:30}]}>Attendance</Text>
          
          {this.plusMinus('players',200,1,1,'user-check')}

          <Text style={[styleApp.title,{fontSize:19,marginTop:30}]}>Gender</Text>
          
          {this.gender()}

        </View>
      )
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1}]}>
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page1.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={true}
        />

        <ButtonRound
          icon={'next'} 
          enabled={true} 
          loader={false} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.props.navigation.navigate('CreateEvent2',{page1:this.state,page0:this.props.navigation.getParam('page0')})}
         />

      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
  };
};

export default connect(mapStateToProps,{})(Page1);

