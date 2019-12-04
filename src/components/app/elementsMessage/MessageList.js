import React from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions'
import { Col, Row, Grid } from "react-native-easy-grid";


import HeaderBackButton from '../../layout/headers/HeaderBackButton'
import styleApp from '../../style/style'
import colors from '../../style/colors'
import Button from '../../layout/buttons/Button'
import ButtonColor from '../../layout/Views/Button'

import ScrollView2 from '../../layout/scrollViews/ScrollView2'
import AllIcons from '../../layout/icons/AllIcons'
const { height, width } = Dimensions.get('screen')
import StatusBar from '@react-native-community/status-bar';
import ButtonAdd from '../../app/elementsHome/ButtonAdd'


import sizes from '../../style/sizes';
import isEqual from 'lodash.isequal'

class MessageTab extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        events:[],
        loader:false,
        unreadMessages:3,
      };
      this.translateXVoile = new Animated.Value(width)
      this.AnimatedHeaderValue = new Animated.Value(0);
      this.opacityVoile = new Animated.Value(0.3)
    }
    async componentDidMount() {
     console.log(this.props.conversations)
    }
    navigate(val,data) {
      this.props.navigation.push(val,data)
    }
    async componentWillReceiveProps(nextProps) {
      if (!isEqual(this.props.sports,nextProps.sports)) {
        await this.setState({loader:true,filterSports:nextProps.sportSelected})
        this.setState({loader:false})
      }
    }
    async changeSport (val) {
      await this.setState({loader:true,filterSports:val})
      var that = this
      setTimeout(function(){
        that.setState({loader:false})
      }, 400);   
    }
    getAnimateHeader() {
      return this.scrollViewRef.getAnimateHeader()
    }
    cardConversation(conversation,i) {
      return <ButtonColor key={i} view={() => {
        return (
          <View>
          <Row style={{paddingTop:10,marginLeft:0,width:width-40,paddingBottom:0,borderBottomWidth:1,borderColor:colors.off,flex:1}}>    
            <Col size={3} style={styleApp.center2}>
              <Text style={[styleApp.input,{color:colors.green}]}>•</Text>
            </Col>   
            <Col size={15} style={styleApp.center}>
              <View style={[styleApp.roundView,{backgroundColor:colors.off2,width:35,height:35,borderRadius:17.5,borderWidth:0.5,borderColor:colors.borderColor}]}>
                <Text style={[styleApp.text,{fontSize:13}]}>{Object.values(conversation.members).filter(user => user.userID != this.props.userID)[0].firstname[0] + Object.values(conversation.members).filter(user => user.userID != this.props.userID)[0].lastname[0]}</Text>
              </View>
              {/* <AsyncImage style={{width:'100%',height:40,borderRadius:3}} mainImage={group.pictures[0]} imgInitial={group.pictures[0]} /> */}
            </Col>
            <Col size={75} style={[styleApp.center2,{paddingLeft:5}]}>
              <Text style={styleApp.text}>{Object.values(conversation.members).filter(user => user.userID != this.props.userID)[0].firstname} {Object.values(conversation.members).filter(user => user.userID != this.props.userID)[0].lastname}</Text>
              <Text style={[styleApp.smallText,{fontSize:12,marginTop:2,color:colors.greyDark}]}>{Object.values(conversation.messages)[0].text.slice(0,70)}...</Text>
            </Col>
            <Col size={10} style={styleApp.center3}>
              <AllIcons name='keyboard-arrow-right' type='mat' size={20} color={colors.grey} />
            </Col>
          </Row>
          </View>
        )
      }} 
      click={() => this.props.navigation.navigate('Conversation',{conversationID:'convo1'})}
      color='white'
      style={{height:100}}
      onPressColor={colors.off}
      />
    }
    messagePageView () {
      if (!this.props.userConnected) return <View style={[styleApp.marginView,{marginTop:30}]}>
        <View style={styleApp.center}>
          <Image style={{height:85,width:85,marginBottom:30}} source={require('../../../img/images/conversation.png')} />
        </View>
        <Text style={[styleApp.text,{marginBottom:30}]}>You need to be signed in in order to consult your conversations.</Text>

        <Button text='Sign in' click={() => this.props.navigation.navigate('Phone',{pageFrom:'MessageList'})} backgroundColor={'green'} onPressColor={colors.greenClick}/>
      </View>
      return (
        <View style={{paddingTop:20,flex:1}}>
          <View style={{minHeight:height-sizes.heightHeaderHome-70,backgroundColor:'white'}}>
            <View style={[styleApp.marginView,{marginBottom:15}]}>
              <Text style={styleApp.title}>Inbox</Text>
              {/* <Text style={[styleApp.subtitle,{marginTop:5}]}>You have {this.state.unreadMessages} unread messages.</Text> */}
            </View>
            
            {Object.values(this.props.conversations).map((conversation,i) => (
              this.cardConversation(conversation,i)
            ))}
          </View>

        </View>
      )
    }
    async refresh () {
      // this.eventGroupsRef.reload()
      // this.listEventsRef.reload()
      return true
    }
    async setLocation(data) {
      this.listEventsRef.setLocation(data)
    }
  render() {
    
    return (
      <View style={styleApp.stylePage}>

        <HeaderBackButton 
        AnimatedHeaderValue={this.AnimatedHeaderValue}
        textHeader={this.props.userConnected?'Inbox':null}
        inputRange={[50,80]}
        initialBorderColorIcon={colors.grey}
        initialBackgroundColor={'white'}
        typeIcon2={'mat'}
        sizeIcon2={17}
        initialTitleOpacity={0}
        icon1={null}
        icon2={this.props.userConnected?'edit':null}

        clickButton2={() => console.log('')}
        />
        
        <ScrollView2
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.messagePageView()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottom={0}
          colorRefresh={colors.title}
          stickyHeaderIndices={[3]}
          refreshControl={true}
          refresh={() => this.refresh()}
          offsetBottom={100}
          showsVerticalScrollIndicator={true}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
    button:{
        height:40,width:120,
        backgroundColor:'blue',
        alignItems: 'center',
        justifyContent: 'center',
    },
    voile:{
      position:'absolute',height:height,backgroundColor:colors.title,width:width,opacity:0.4,
      // zIndex:220,
    }
    
});

const  mapStateToProps = state => {
  return {
    conversations:state.conversations,
    userID:state.user.userID,
    userConnected:state.user.userConnected
  };
};

export default connect(mapStateToProps,{historicSearchAction})(MessageTab);
