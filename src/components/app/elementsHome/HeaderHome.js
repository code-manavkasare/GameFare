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
const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import sizes from '../../style/sizes'
import styleApp from '../../style/style'
import { Col, Row, Grid } from "react-native-easy-grid";


export default class HeaderHome extends React.Component {
  state={
    inputFocus:false
  }
  openProfile() {
        this.props.navigate('Profile',{message:'the message is here sdfsdfsd'})
    }
  render() {
    return (
      <View style={styles.searchBarComponent}>
        <Row style={{width:width-40,marginLeft:20}}>
          <Col size={70}>
            <TouchableOpacity activeOpacity={0.7} onPress={() => this.openSearch(true)} style={styleApp.searchBarHome}>
              <Row>
              {
                !this.state.inputFocus?
                <Col size={25} style={styleApp.center}>
                  <Image source={require('../../../img/icons/searchWhite.png')} style={{height:17,width:17,}} />
                </Col>
                :
                <Col size={25} style={styleApp.center} activeOpacity={0.7} activeOpacity={0.7} onPress={() => this.openSearch(false)}>
                  <Image source={require('../../../img/icons/closeWhite.png')} style={{height:13,width:13,}} />
                </Col>
              }
                <Col size={75} style={styleApp.center2}>
                  <TextInput 
                    style={styles.input}
                    placeholder="Search for events"
                    returnKeyType={'done'}
                    underlineColorAndroid='rgba(0,0,0,0)'
                    autoCorrect={true}
                    placeholderTextColor={'white'}
                    // keyboardType={'phone-pad'}
                    // onSubmitEditing={() => this.openSearch(false)}
                    ref={(input) => { this.searchBarRef = input }}
                    onFocus={() => this.openSearch(true)}
                    onChangeText={text => this.changeText(text)}
                    value={this.state.textInput}
                  />
                </Col>
                {/* {this.buttonReset()} */}
              </Row>
            </TouchableOpacity>
          </Col>
          

          <Col size={15} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.props.navigate('CreateEvent',{})} >
            <Image source={require('../../../img/icons/plusWhite.png')} style={{height:20,width:20,}} />
          </Col>

          <Col size={15} style={styleApp.center3} activeOpacity={0.7} onPress={() => this.openProfile()}>
            <Image source={require('../../../img/icons/userWhite.png')} style={{height:23,width:23,}} />
          </Col>
        </Row>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    searchBarComponent:{
        position:'absolute',
        width:width,
        backgroundColor:colors.primary,
        borderBottomWidth:0,
        borderColor:'#eaeaea',
        paddingTop:sizes.marginTopApp,
        height:sizes.heightHeaderHomeSearch,
        top:0,
      },
});
