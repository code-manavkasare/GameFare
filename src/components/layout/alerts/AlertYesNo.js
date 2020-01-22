import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Easing,
  Animated,
  View
} from 'react-native';

import { Col, Row, Grid } from "react-native-easy-grid";
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Button from '../buttons/Button'
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons'
import styleApp from '../../style/style';

const { height, width } = Dimensions.get('screen')
var bottomAlert = -20
var marginBottomSubmit=10
if (Platform.OS == 'ios') {
  bottomAlert = 0
  marginBottomSubmit=10
  if (height == 812) {
    bottomAlert = -20
    marginBottomSubmit=35
  } else if (height == 896) {
    bottomAlert = -20
    marginBottomSubmit=35
  }
  
}

export default class AlertYesNo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step:1,
      loader: false
    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }
  componentWillMount(){    
  }
  title() {
    return <Text style={[styleApp.title,{fontSize:18,fontFamily:'OpenSans-SemiBold'}]}>{this.props.navigation.getParam('title')}</Text>
  }
  subtitle() {
    if (this.props.navigation.getParam('subtitle') != undefined) return <Text style={[styleApp.text,{marginTop:20,fontFamily:'OpenSans-Regular',fontSize:15}]}>{this.props.navigation.getParam('subtitle')}</Text>
    return null
  }
  yesClick() {
    let click = this.props.navigation.getParam('yesClick');
    click();
    this.props.navigation.goBack();
  }
  noClick() {
    let click = this.props.navigation.getParam('noClick');
    click();
    this.props.navigation.goBack();
  }
  click(){
    if (this.props.navigation.getParam('close') != true) {
      this.setState({loader:true})
      this.props.navigation.state.params.onGoBack()
    } else {
      this.props.navigation.goBack()
    }
  }
  render() {  
    return (
      <View style={styles.viewModal}>
          <TouchableOpacity style={styles.buttonClose} activeOpacity={0.5} onPress={() => {this.props.navigation.goBack()}}>
            <MatIcon name="close" color={'#4a4a4a'} size={24} />
          </TouchableOpacity>

          {
            this.props.navigation.getParam('icon') != undefined?
            <View style={styles.viewIcon}>
            {this.props.navigation.getParam('icon')}
            </View>
            :null
          }

         <Row style={{flex:1,marginBottom:0,marginLeft:20,width:width-110,marginBottom:9,marginTop:17}}>
          <Col>
            {this.title()}
            {this.subtitle()}
          </Col>
         </Row>

          <Row style={styles.buttonArea}>
            <Col size={45} style={styles.viewButton}>
                <Button backgroundColor={'green'} disabled={false} onPressColor={colors.greenClick}  text={this.props.navigation.getParam('textYesButton')} click={() => this.yesClick()} loader={this.state.loader}/>
            </Col>
            <Col size={10}/>
            <Col size={45} style={styles.viewButton}>
                <Button backgroundColor={'red'} disabled={false} onPressColor={colors.greenClick}  text={this.props.navigation.getParam('textNoButton')} click={() => this.noClick()} loader={this.state.loader}/>
            </Col>
          </Row>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewModal:{
    bottom:0,
    position:'absolute',
    flex:1,
    backgroundColor:'white',
    borderTopWidth:0.3,
    borderColor:colors.borderColor,
    width:width,
    shadowColor: '#46474B',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
  },
  buttonClose:{
    position:'absolute',
    width:26,
    height:26,
    right:15,
    top:20,
    zIndex:30,

    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'#f6f6f6',
    borderRadius:13
  },
  viewIcon:{
    position:'absolute',
    width:26,
    height:26,
    right:55,
    top:20,
    zIndex:30,

    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor:'#f6f6f6',
    borderRadius:13
  },
  buttonArea:{
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 25,
    paddingBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButton:{
    alignItems: 'center',
    justifyContent: 'center',
  },

  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2:{
    // alignItems: 'center',
    justifyContent: 'center',
  },
});

