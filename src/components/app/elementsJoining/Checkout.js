import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Linking
} from 'react-native';
import {connect} from 'react-redux';

import Header from '../../layout/headers/HeaderButton'
import ScrollView from '../../layout/scrollViews/ScrollView'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import colors from '../../style/colors'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import {userAction} from '../../../actions/userActions'
import ButtonRound from '../../layout/buttons/ButtonRound'
import AllIcons from '../../layout/icons/AllIcons'
import DateEvent from '../elementsEventCreate/DateEvent'

import InAppBrowser from 'react-native-inappbrowser-reborn'
import Communications from 'react-native-communications';

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:false,
    };
  }
  dateTime(start,end) {
    return <DateEvent 
    start={start}
    end={end}
    />
  }
  rowIcon (component,icon) {
    return (
      <Row style={{marginTop:20}}>
        <Col size={10} style={styleApp.center2}>
          <AllIcons name={icon} color={colors.title} size={20} type='font' />
        </Col>
        <Col size={90} style={styleApp.center2}>
          {component}
        </Col>
      </Row>
    )
  }
  title(text) {
    return <Text style={[styleApp.title,{fontSize:16,fontFamily:'OpenSans-Regular'}]}>{text}</Text>
  }
  profile() {
    return (
      <View>
        <Row>
          <Col size={80} style={styleApp.center2}>
            <Text style={styleApp.title}>{this.props.navigation.getParam('data').info.name}</Text>
          </Col>
          <Col size={20} style={styleApp.center3}>
          <View style={styles.viewSport}>
            <Text style={styles.textSport}>{this.props.navigation.getParam('data').info.sport.charAt(0).toUpperCase() + this.props.navigation.getParam('data').info.sport.slice(1)}</Text>
          </View>
          </Col>
        </Row>
        
        {this.rowIcon(this.dateTime(this.props.navigation.getParam('data').date.start,this.props.navigation.getParam('data').date.end),'calendar-alt')}
        {this.rowIcon(this.title(this.props.navigation.getParam('data').location.area),'map-marker-alt')}
        {this.rowIcon(this.title(this.props.navigation.getParam('data').info.maxAttendance + ' people'),'user-check')}
        
        <View style={[styleApp.divider,{marginBottom:20}]} />


      </View>
    )
  }
  async submit(data) {
    await this.setState({loader:true})
  }
  render() {
    return (
      <View style={{ flex: 1,backgroundColor:'white' }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Join ' + this.props.navigation.getParam('data').info.name}
        icon={'angle-left'}
        close={() => this.props.navigation.navigate('Event')}
        />
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90}
          showsVerticalScrollIndicator={false}
        />
        {
          this.props.userConnected?
          <ButtonRound
          icon={'check'} 
          enabled={true} 
          loader={this.state.loader} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.submit(this.props.navigation.getParam('data'))}
         />
         :
         <ButtonRound
          icon={'sign'} 
          enabled={true} 
          loader={false} 
          translateYFooter={this.translateYFooter}
          translateXFooter={this.translateXFooter} 
          click={() => this.props.navigation.navigate('SignIn',{pageFrom:'Checkout'})}
         />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewSport:{
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    height:25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
});

const  mapStateToProps = state => {
  return {
    userID:state.user.userID,
    userConnected:state.user.userConnected,
    infoUser:state.user.infoUser.userInfo
  };
};

export default connect(mapStateToProps,{userAction})(ProfilePage);
