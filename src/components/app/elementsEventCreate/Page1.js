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
import {createEventAction} from '../../../actions/createEventActions'


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
  componentDidMount() {
    console.log('page 1 mount')
    console.log(this.props.sports)
    if (Object.values(this.props.step1).length != 0) {
      this.setState(this.props.step1)
    } else {
      this.setState({
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
      })
    }

    if (this.props.navigation.getParam('group') != undefined) {
      this.setState({groups:{
        [this.props.navigation.getParam('group').objectID]:this.props.navigation.getParam('group')
      }})
    }
  }
  async setStateSwitch (state,val) {
    await this.setState({[state]:val})
    return true
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
        setState={(val) => this.setStateSwitch(state,val)}
      />
    )
  }
  levelFilter() {
    return (
      <View style={{borderBottomWidth:1,borderColor:colors.off}}>
      <ExpandableCard 
          option = {this.state.levelFilter} 
          tickFilter={(value) => {
          var levelFilter = this.state.levelFilter
          levelFilter.value = Object.values(this.props.sports[0].level.list).filter(level => level.value == value)[0]
          levelFilter.valueSelected = value
          this.setState({levelFilter:levelFilter})
        }}
      />
      </View>
    )
  }
  levelOption() {
    return (
      <View style={{borderBottomWidth:1,borderColor:colors.off}}>
      <ExpandableCard 
          option = {this.state.levelOption} 
          tickFilter={(value) => {
          var levelOption = this.state.levelOption
          levelOption.valueSelected = value
          this.setState({levelOption:levelOption})
        }}
      />
      </View>
    )
  }
  gender() {
    return (
      <View style={{borderBottomWidth:1,borderColor:colors.off}}>
      <ExpandableCard 
          option = {this.state.genderFilter} 
          tickFilter={(value) => {
          var genderFilter = this.state.genderFilter
          genderFilter.valueSelected = value
          this.setState({genderFilter:genderFilter})
        }}
      />
      </View>
    )
  }
  plusMinus(state,maxValue,increment,minValue,icon) {
    var text = state
    if (this.state[state]==1) text = state + 's'
    return(
      <Row style={{paddingLeft:20,paddingRight:20,height:60,borderBottomWidth:1,borderColor:colors.off}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name={icon} color={colors.greyDark} size={17} type='font' />
        </Col>
        <Col size={65} style={[styleApp.center2,{paddingLeft:10}]}>
          <Text style={styleApp.input}>{this.state[state]} {this.state[state]==1?'player':'players'} <Text style={styleApp.regularText}>(total)</Text></Text>
        </Col>
        <Col size={15} style={styleApp.center} activeOpacity={0.7} onPress={() => {
          if (this.state[state] != minValue) {
            this.setState({[state]:this.state[state]-increment})
          }
        }} >
          <AllIcons name={'minus'} color={colors.title} size={15} type='font' />
        </Col>
        
        <Col size={10} style={styleApp.center} activeOpacity={0.7} onPress={() => {
          if (this.state[state] != maxValue) {
            this.setState({[state]:this.state[state]+increment})
          }
        }} >
          <AllIcons name={'plus'} color={colors.title} size={15} type='font' />
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
          <Row style={{padddingBottom:10,}}>       
            <Col size={15} style={styleApp.center2}>
              <AsyncImage style={{width:'100%',height:40,borderRadius:3}} mainImage={group.pictures[0]} imgInitial={group.pictures[0]} />
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
      style={[{marginTop:10,flex:1,paddingLeft:20,paddingRight:20,height:60}]}
      onPressColor='white'
      />
    )
  }
  page1() {
      return (
        <View style={{marginTop:10,marginLeft:0,width:width}}>
            <View style={[styleApp.marginView,{marginBottom:15}]}>
              {this.switch('Open access','Invite only','private')}
             
            </View>

              {this.levelFilter()}
              {this.state.levelFilter.valueSelected != 0?this.levelOption():null}
              {this.plusMinus('players',200,1,1,'user-check')}
              {this.gender()}

            {/* <View style={{marginTop:25,borderTopWidth:1,borderColor:colors.off,height:1}} /> */}
            {
              Object.values(this.state.groups).length!=0?
              Object.values(this.state.groups).map((group,i) => (
                  this.rowGroup(group,i)
              ))
              :null
            }
            
            <ButtonColor view={() => {
              return <Row style={{paddingLeft:20,paddingRight:20}}>
                <Col size={90} style={[styleApp.center2]}>
                  <Text style={styleApp.input}>Add groups</Text>
                </Col>
                <Col size={10} style={styleApp.center}>
                  <AllIcons name={'plus'} color={colors.title} size={15} type='font' />
                </Col>
              </Row>
            }} 
            click={() => this.openAddGroups()}
            color='white'
            style={[{borderColor:colors.off,height:60,width:'100%',borderRadius:0,borderBottomWidth:1,marginTop:0}]}
            onPressColor={colors.off}
            />


        </View>
      )
  }
  async close () {
    console.log('close')
    await this.props.createEventAction('setStep1',this.state)
    return this.props.navigation.goBack()
  }
  async next() {
    await this.props.createEventAction('setStep1',this.state)
    return this.props.navigation.navigate('CreateEvent2',{page1:this.state,page0:this.props.navigation.getParam('page0')})
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
            clickButton1={() => this.close()} 
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
          onPressColor={colors.greenLight}
          click={() => this.next()}
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
    userID:state.user.userID,
    step1:state.createEventData.step1,
  };
};

export default connect(mapStateToProps,{createEventAction})(Page1);

