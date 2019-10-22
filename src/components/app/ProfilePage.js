import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import {connect} from 'react-redux';

import Header from '../layout/headers/HeaderButton'
import ScrollView from '../layout/scrollViews/ScrollView'
import sizes from '../style/sizes'
import styleApp from '../style/style'
import colors from '../style/colors'
import { Col, Row, Grid } from "react-native-easy-grid";
import FontIcon from 'react-native-vector-icons/FontAwesome';
import {userAction} from '../../actions/userActions'

class ProfilePage extends Component {
  state={check:false}
  static getDerivedStateFromProps(props, state) {
    return state
  }
  title(text) {
    return (
      <Row style={{marginBottom:10}}>
        <Col style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:13}]}>{text}</Text>
        </Col>
      </Row>
    )
  }
  button(text,page,data) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => this.props.navigation.navigate(page,data)} style={styles.button}>
      <Row>
        <Col size={90} style={styleApp.center2}>
          <Text style={[styleApp.title,{fontSize:13}]}>{text}</Text>
        </Col>
        <Col size={10} style={styleApp.center3}>
          <FontIcon size={20} name={'angle-right'} color={colors.title} /> 
        </Col>
      </Row>
      </TouchableOpacity>
    )
  }
  profile() {
    return (
      <View>
        {this.title('Account parameters')}

        {this.button('Logout','Alert',{textButton:'Logout',title:'Do you want to log out?',onGoBack: (data) => this.confirmLogout(data)})}
      </View>
    )
  }
  async confirmLogout (data) {
    console.log('close logout')
    console.log(data)
    await this.props.userAction('logout')
    this.props.navigation.navigate('Home')
  }
  render() {
    return (
      <View style={{ flex: 1,backgroundColor:'white' }}>
        <Header
        onRef={ref => (this.headerRef = ref)}
        title={'Profile'}
        icon={'angle-left'}
        close={() => this.props.navigation.navigate('Home')}
        />
        <ScrollView 
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.profile()}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button:{
    height:40,
    borderColor:colors.off,
    borderBottomWidth:1,
  },
});

const  mapStateToProps = state => {
  return {
  };
};

export default connect(mapStateToProps,{userAction})(ProfilePage);
