import React,{Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Animated
} from 'react-native';
import {connect} from 'react-redux';

const { height, width } = Dimensions.get('screen')
import Header from '../../layout/headers/HeaderButton'
import ScrollView from '../../layout/scrollViews/ScrollView'
import TextField from '../../layout/textField/TextField'
import Switch from '../../layout/switch/Switch'
import ButtonRound from '../../layout/buttons/ButtonRound'
import AllIcons from '../../layout/icons/AllIcons'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import { Col, Row, Grid } from "react-native-easy-grid";

import BackButton from '../../layout/buttons/BackButton'


import styleApp from '../../style/style'
import sizes from '../../style/sizes'

class Page2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initialLoader:true
    };
    this.translateYFooter = new Animated.Value(0)
    this.translateXFooter = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Advanced settings',
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
        <BackButton name='keyboard-arrow-left' type='mat' click={() => navigation.goBack()} />
      ),
    }
  };
  async componentDidMount() {
    console.log('le mount step 2')
    console.log(this.props.navigation.getParam('data'))
    var fields =this.props.navigation.getParam('sport').fields
    fields = fields.filter(field => field != null)
    console.log(fields)
    var states = {sport:this.props.navigation.getParam('data').sportsFilter.valueSelected,initialLoader:false}
    for (var field in fields) {
      if (fields[field].field == 'expandable') {
        if (fields[field].value == 'rulesFilter') {
          states = {
            ...states,
            [fields[field].value]:{
              text:fields[field].value,
              value:fields[field].value,
              type:fields[field].value,
              expendable:true,
              alwaysExpanded:true,
              valueSelected:Object.values(this.props.navigation.getParam('sport').rules)[0].value,
              listExpend:Object.values(this.props.navigation.getParam('sport').rules)
            },
          }
        } else {
          states = {
            ...states,
            [fields[field].value]:{
              text:fields[field].value,
              value:fields[field].value,
              type:fields[field].value,
              expendable:true,
              alwaysExpanded:true,
              valueSelected:Object.values(fields[field].list)[0].value,
              listExpend:Object.values(fields[field].list)
            },
          }
        }
      } else {
        states = {
          ...states,
          [fields[field].value]:fields[field].initialValue == undefined?'':fields[field].initialValue
        }
      }
    }
    console.log('initStatessss')
    console.log(this.props.navigation.getParam('sport').fields)
    console.log(states)
    await this.setState({...states})
  }
  switch (textOn,textOff,state) {
    return (
      <Switch 
        textOn={textOn}
        textOff={textOff}
        translateXTo={width/2-20}
        height={50}
        state={this.state[state]}
        setState={(val) => this.setState({[state]:val})}
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
  textField (state,placeHolder,heightField,multiline,keyboardType,icon) {
    return(
      <TextField
      state={this.state[state]}
      placeHolder={placeHolder}
      heightField={heightField}
      multiline={multiline}
      keyboardType={keyboardType}
      icon={icon}
      typeIcon={'font'}
      />
    )
  }
  title(text){
    return<Text style={[styleApp.title,{marginTop:20,fontSize:17}]}>{text}</Text>
  }
  field(field) {
    if (field.field == 'expandable') {
      return <ExpandableCard 
          option = {this.state[field.value]} 
          tickFilter={(value) => {
          var filter = this.state[field.value]
          filter.valueSelected = value
          this.setState({[field.value]:filter})
      }}
    />
    } else if (field.field == 'plus') {
      return this.plusMinus(field.value,field.maxValue,field.increment,field.minValue,field.icon) 
    } else if (field.field == 'text') {
      return this.textField(field.value,field.placeHolder,field.heightField,field.multiline,field.keyboardType,field.icon)
    }
  }
  page2() {
      if (this.state.initialLoader) return null
      return (
          <View style={{marginTop:-20}}>
            <TextField
              state={this.props.navigation.getParam('sport').text}
              placeHolder={''}
              heightField={50}
              multiline={false}
              editable={false}
              keyboardType={'default'}
              icon={this.props.navigation.getParam('sport').icon}
              typeIcon='moon'
            />

            {Object.values(this.props.navigation.getParam('sport').fields).filter(field => field != null).map((field,i) => (
              <View key={i}>
                {this.title(field.text)}
                {this.field(field)}
              </View>
            ))}
          </View>
      )
  }
  render() {
    return (
      <View style={{backgroundColor:'white',flex:1, }}>
        {/* <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Advanced settings'}
        icon={'angle-left'}
        close={() => this.props.navigation.goBack()}
        /> */}
        <ScrollView 
          // style={{marginTop:sizes.heightHeaderHome}}
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page2.bind(this)}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={90+60}
          showsVerticalScrollIndicator={false}
        />
        <ButtonRound
          icon={'next'} 
          enabled={true} 
          loader={false} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.props.navigation.navigate('CreateEvent3',{data:{step0:this.props.navigation.getParam('step0'),step1:this.props.navigation.getParam('data'),step2:this.state,sport:this.props.navigation.getParam('sport')}})}
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
  
  export default connect(mapStateToProps,{})(Page2);
