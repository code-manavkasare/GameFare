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
import HeaderBackButton from '../../layout/headers/HeaderBackButton'

import Header from '../../layout/headers/HeaderButton'
import ButtonRound from '../../layout/buttons/ButtonRound'
import ButtonColor from '../../layout/Views/Button'
import ScrollView from '../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import Switch from '../../layout/switch/Switch'
import AllIcons from '../../layout/icons/AllIcons'
import AsyncImage from '../../layout/image/AsyncImage'
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
      groups:{},
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
    this.AnimatedHeaderValue = new Animated.Value(0)
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
    if (this.props.navigation.getParam('group') != undefined) {
      this.setState({groups:{
        [this.props.navigation.getParam('group').objectID]:this.props.navigation.getParam('group')
      }})
    }
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
    var text = state
    if (this.state[state]==1) text = state + 's'
    return(
      <Row style={styleApp.inputForm}>
        <Col size={15} style={styleApp.center}>
          <AllIcons name={icon} color={colors.title} size={17} type='font' />
        </Col>
        <Col size={55} style={[styleApp.center2,{paddingLeft:15}]}>
          <Text style={[styleApp.text,{fontFamily:'OpenSans-Regular'}]}>{this.state[state]} {this.state[state]==1?'player':'players'} total</Text>
        </Col>
        <Col size={15} style={styleApp.center} activeOpacity={0.7} onPress={() => {
          if (this.state[state] != minValue) {
            this.setState({[state]:this.state[state]-increment})
          }
        }} >
          <AllIcons name={'remove'} color={colors.title} size={25} type='mat' />
        </Col>
        
        <Col size={15} style={styleApp.center} activeOpacity={0.7} onPress={() => {
          if (this.state[state] != maxValue) {
            this.setState({[state]:this.state[state]+increment})
          }
        }} >
          <AllIcons name={'add'} color={colors.title} size={25} type='mat' />
        </Col>
        
      </Row>
    )
  }
  
  async setGroups(groups) {
    console.log('set groups!')
    console.log(groups)
    await this.setState({groups:groups})
    this.props.navigation.navigate('CreateEvent1')
  }
  openAddGroups() {
    if (!this.props.userConnected) return this.props.navigation.navigate('SignIn',{pageFrom:'CreateEvent1'})
    return this.props.navigation.navigate('AddGroups',{userID:this.props.userID,groups:this.state.groups,onGoBack:(groups) => this.setGroups(groups)})
  }
  rowGroup(group,i){
    return (
      <ButtonColor view={() => {
        return (
          <Row>       
            <Col size={15} style={styleApp.center2}>
              <AsyncImage style={{width:'100%',height:40,borderRadius:6}} mainImage={group.pictures[0]} imgInitial={group.pictures[0]} />
            </Col>
            <Col size={85} style={[styleApp.center2,{paddingLeft:15}]}>
              <Text style={styleApp.text}>{group.info.name}</Text>
              <Text style={[styleApp.smallText,{fontSize:12}]}>{group.info.sport.charAt(0).toUpperCase() + group.info.sport.slice(1)}</Text>
            </Col>
            <Col size={10} style={styleApp.center3}>
              <AllIcons name='check' type='mat' size={20} color={colors.green} />
            </Col>
          </Row>
        )
      }} 
      click={() => console.log('')}
      color='white'
      style={[styles.rowGroup,{marginTop:10,flex:1}]}
      onPressColor='white'
      />
    )
  }
  page1() {
      return (
        <View style={{marginTop:-15,marginLeft:-20,width:width}}>
            <View style={styleApp.marginView}>
              {this.switch('Open access','Invite only','private')}
              {this.levelFilter()}
              {this.state.levelFilter.valueSelected != 0?this.levelOption():null}
              {this.plusMinus('players',200,1,1,'user-check')}
            </View>



            <View style={[styleApp.marginView,{marginTop:30}]}>
              <Text style={styleApp.title}>Add event to groups</Text>
                {
                  Object.values(this.state.groups).length!=0?
                  <View style={{marginTop:10}}>
                  {Object.values(this.state.groups).map((group,i) => (
                      this.rowGroup(group,i)
                  ))}
                  </View>
                  :null
                }
                <ButtonColor view={() => {
                  return <Text style={styleApp.title}>+</Text>
                }} 
                click={() => this.openAddGroups()}
                color='white'
                style={[styleApp.center,{borderColor:colors.off,height:40,width:'100%',borderRadius:20,borderWidth:1,marginTop:20}]}
                onPressColor={colors.off}
                />
            </View>

            <View style={[styleApp.marginView,{marginTop:30}]}>
              <Text style={styleApp.title}>Gender</Text>
              {this.gender()}
            </View>

        </View>
      )
  }
  render() {
    return (
      <View style={[styleApp.stylePage,{borderLeftWidth:1}]}>
         <HeaderBackButton 
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={'Access settings'}
            inputRange={[5,10]}
            initialBorderColorIcon={'white'}
            initialBackgroundColor={'white'}
            initialTitleOpacity={1}
            icon1='arrow-left'
            icon2={null}
            clickButton1={() => this.props.navigation.goBack()} 
        />

        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page1.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={false}
        />

        <ButtonRound
          icon={'next'} 
          enabled={true} 
          loader={false} 
          onPressColor={colors.greenLight2}
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
    userConnected:state.user.userConnected,
    userID:state.user.userID
  };
};

export default connect(mapStateToProps,{})(Page1);

