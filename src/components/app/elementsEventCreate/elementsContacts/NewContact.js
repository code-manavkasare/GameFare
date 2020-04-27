import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  InputAccessoryView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';

import ScrollView from '../../../layout/scrollViews/ScrollView';
import ButtonFull from '../../../layout/buttons/ButtonFull';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';

class Page1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      phoneNumber: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.addContact = this.addContact.bind(this);
  }
  componentDidMount() {}
  newContact() {
    return (
      <View style={[styleApp.marginView, {marginTop: 0}]}>
        <Text style={[styleApp.title, {fontSize: 17, marginTop: 20}]}>
          Full contact name
        </Text>

        <Row style={styleApp.inputForm}>
          <Col style={styleApp.center2}>
            <TextInput
              style={styleApp.input}
              placeholder={'Name'}
              returnKeyType={'done'}
              // keyboardType={this.props.keyboardType}
              blurOnSubmit={true}
              autoFocus={true}
              onFocus={() => this.setState({showShareIcons: false})}
              onBlur={() => this.setState({showShareIcons: true})}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={true}
              inputAccessoryViewID={'text'}
              onChangeText={(text) => this.setState({name: text})}
              value={this.state.search}
            />
          </Col>
        </Row>

        <Text style={[styleApp.title, {fontSize: 17, marginTop: 20}]}>
          Phone Number
        </Text>

        <Row style={styleApp.inputForm}>
          <Col style={styleApp.center2}>
            <TextInput
              style={styleApp.input}
              placeholder={'(012) 345-6789'}
              returnKeyType={'done'}
              // keyboardType={this.props.keyboardType}
              blurOnSubmit={true}
              ref={(input) => {
                this.textSearchInput = input;
              }}
              // autoFocus={true}
              inputAccessoryViewID={'text'}
              onFocus={() => this.setState({showShareIcons: false})}
              onBlur={() => this.setState({showShareIcons: true})}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={true}
              keyboardType="phone-pad"
              onChangeText={(text) => this.setState({phoneNumber: text})}
              value={this.state.search}
            />
          </Col>
        </Row>
      </View>
    );
  }
  addContact() {
    this.props.navigation.state.params.onGoBack(this.state);
  }
  render() {
    return (
      <View style={{backgroundColor: 'white', flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Apple Pay'}
          inputRange={[20, 50]}
          initialTitleOpacity={0}
          initialBackgroundColor={'white'}
          initialBorderColorIcon={'white'}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.newContact.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />

        <InputAccessoryView nativeID={'text'}>
          <ButtonFull
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            loader={this.state.loader}
            click={() => this.addContact()}
            enable={this.state.name != '' && this.state.phoneNumber != ''}
            text={'Add'}
          />
        </InputAccessoryView>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(Page1);
