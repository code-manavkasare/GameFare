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
import ButtonOff from '../../layout/buttons/ButtonOff'
import ButtonRoundOff  from '../../layout/buttons/ButtonRoundOff'
import ButtonRound from '../../layout/buttons/ButtonRound'

import HeaderBackButton from '../../layout/headers/HeaderBackButton'


import ScrollView from '../../layout/scrollViews/ScrollView'
import ExpandableCard from '../../layout/cards/ExpandableCard'
import Switch from '../../layout/switch/Switch'
import TextField from '../../layout/textField/TextField'
import AllIcons from '../../layout/icons/AllIcons'
import {date} from '../../layout/date/date'
import Communications from 'react-native-communications';

import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import UploadImage from '../../layout/image/UploadImage';

class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      private:false,
      name:'',
      img:'',
      location:{address:''},
      description:'',
      sportsFilter:{
        text:"Sports",
        value:'sports',
        type:'sports',
        expendable:true,
        alwaysExpanded:true,
        value:Object.values(this.props.sports)[0],
        valueSelected:Object.values(this.props.sports)[0].value,
        listExpend:Object.values(this.props.sports)
      },
    };
    this.AnimatedHeaderValue = new Animated.Value(0)
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Create a group',
      headerStyle:styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton color={colors.title} name='keyboard-arrow-left' type='mat' click={() => navigation.navigate(navigation.getParam('pageFrom'))} />
      ),
    }
  };
  componentDidMount() {
    console.log('page 1 mount')
    console.log(this.state.sportsFilter)
  }
  sports() {
    return (
      <ExpandableCard 
          option = {this.state.sportsFilter} 
          tickFilter={(value) => {
          var sportsFilter = this.state.sportsFilter
          sportsFilter.value = Object.values(this.props.sports).filter(sport => sport.value == value)[0]
          sportsFilter.valueSelected = value
          console.log('le sport')
          console.log(value)
          this.setState({
            sportsFilter:sportsFilter,
          })
        }}
      />
    )
  }
  sendMessage () {
    var email1 = 'contact@getgamefare.com';
    var subject = ''
    Communications.email([email1],null,null, subject ,'');
    this.props.navigation.navigate('CreateEvent0')
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
  tournamentName () {
    return(
      <TouchableOpacity activeOpacity={0.7} onPress={() => this.nameInput.focus()} style={styleApp.inputForm}>
      <Row >
        <Col size={15} style={styleApp.center}>
          <AllIcons name='hashtag' size={16} color={colors.title} type='font' />
        </Col>
        <Col style={[styleApp.center2,{paddingLeft:15}]} size={90}>
          <TextInput
            style={styleApp.input}
            placeholder="Group name"
            returnKeyType={'done'}
            ref={(input) => { this.nameInput = input }}
            underlineColorAndroid='rgba(0,0,0,0)'
            autoCorrect={true}
            onChangeText={text => this.setState({name:text})}
            value={this.state.name}
          />
        </Col>
      </Row>
      </TouchableOpacity>
    )
  }
  textField (state,placeHolder,heightField,multiline,keyboardType,icon) {
    return(
      <TextField
      state={this.state[state]}
      placeHolder={placeHolder}
      heightField={heightField}
      multiline={multiline}
      setState={(val) => this.setState({[state]:val})}
      keyboardType={keyboardType}
      icon={icon}
      typeIcon={'font'}
      />
    )
  }
  setImage(img, resized){
    // this.state.importedPicture = img
    console.log("this is now the charting pic")
    console.log(resized)
    var uri = resized
    if (Platform.OS == 'ios' && uri) resized = resized.substr(7)
    this.setState({img: resized})
    console.log(this.state)
  }
  async setLocation(data) {
    await this.setState({location:data})
    this.props.navigation.navigate('CreateGroup0')
  }
  address() {
    return (
      <TouchableOpacity style={styleApp.inputForm} activeOpacity={0.7} onPress={() => this.props.navigation.navigate('Location',{location:this.state.location,pageFrom:'CreateGroup0',onGoBack: (data) => this.setLocation(data)})}>
        <Row>
          <Col style={styleApp.center} size={15}>
            <AllIcons name='map-marker-alt' size={18} color={colors.title} type='font'/>
          </Col>
          <Col style={[styleApp.center2,{paddingLeft:15}]} size={85}>
            <Text style={this.state.location.address == ''?styleApp.inputOff:styleApp.input}>{this.state.location.address==''?'Group area':this.state.location.address}</Text>
          </Col>
        </Row>
      </TouchableOpacity>
    )
  }
  page0() {
      return (
        <View style={{marginTop:-15,marginLeft:0,width:width}}>

 
          <View style={styleApp.marginView}>
            {this.sports()}
          </View>

          <View style={[styleApp.marginView,{marginTop:30}]}>

          <Text style={[styleApp.title,{fontSize:19,marginBottom:10}]}>Group information</Text>
            {this.switch('Open access','Invite only','private')}
            {this.address()}
            {this.tournamentName()}

            {this.textField('description','Group description',80,true,'default','info-circle')}         
          </View>


          <View style={styleApp.marginView}>
            <Text style={[styleApp.title,{fontSize:19,marginBottom:10}]}>Image</Text>
            <UploadImage setImage={this.setImage.bind(this)}/>
          </View>


        </View>
      )
  }
  conditionOn() {
    if (this.state.name == '' || this.state.description == '' || this.state.img == '' || this.state.location.address == '') return false
    return true
  }
  data(state) {
    return {
      info:{
        sport:state.sportsFilter.valueSelected,
        name:state.name,
        description:state.description,
        public:!state.private
      },
      location:this.state.location,
      img:state.img,
    }
  }
  render() {
    return (
      
      <View style={styleApp.stylePage}>
        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        close={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
        textHeader={'Create your group'}
        inputRange={[5,10]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        initialTitleOpacity={1}
        icon1='arrow-left'
        icon2={null}
        clickButton1={() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))} 
        />

        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={this.page0.bind(this)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={150}
          showsVerticalScrollIndicator={false}
        />
        
        {
          this.conditionOn()?
          <ButtonRound
          icon={'next'} 
          onPressColor={colors.greenLight2}
          enabled={this.conditionOn()}
          loader={false} 
          click={() => this.props.navigation.navigate('CreateGroup1',{data:this.data(this.state)})}
         />
         :
         <ButtonRoundOff
          icon={'next'} 
          enabled={this.conditionOn()}
          loader={false} 
          click={() => this.props.navigation.navigate('CreateGroup1',{data:this.data(this.state)})}
         />
        }
        

      </View>
    );
  }
}

const styles = StyleSheet.create({

});

const  mapStateToProps = state => {
  return {
    sports:state.globaleVariables.sports.list,
    infoUser:state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps,{})(Page0);

