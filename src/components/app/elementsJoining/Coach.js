import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');

import BackButton from '../../layout/buttons/BackButton';
import Button from '../../layout/buttons/Button';
import ButtonOff from '../../layout/buttons/ButtonOff';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import ScrollView from '../../layout/scrollViews/ScrollView';

import colors from '../../style/colors';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';

export default class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      player: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Instructor/Player',
      headerStyle: styleApp.styleHeader,
      headerTitleStyle: styleApp.textHeader,
      headerLeft: () => (
        <BackButton
          color={colors.title}
          name="keyboard-arrow-left"
          type="mat"
          click={() => navigation.goBack()}
        />
      ),
    };
  };
  componentDidMount() {}
  page0() {
    return (
      <View style={{marginTop: 0, marginLeft: 0, width: width}}>
        <View style={[{paddingTop: 0}]}>
          <View style={styleApp.marginView}>
            <Text style={[styleApp.title, {fontSize: 19, marginTop: 20}]}>
              I am a...
            </Text>

            <View style={{height: 20}} />
            {this.state.player ? (
              <ButtonOff
                text="Instructor"
                click={() => this.setState({player: false})}
                backgroundColor={'white'}
                onPressColor={'white'}
                textButton={{color: colors.primary}}
              />
            ) : (
              <Button
                text="Instructor"
                click={() => this.setState({player: false})}
                backgroundColor={'primary'}
                onPressColor={colors.primary2}
              />
            )}

            <View style={{height: 10}} />
            {!this.state.player ? (
              <ButtonOff
                text="Player"
                click={() => this.setState({player: true})}
                backgroundColor={'white'}
                onPressColor={'white'}
                textButton={{color: colors.primary}}
              />
            ) : (
              <Button
                text="Player"
                click={() => this.setState({player: true})}
                backgroundColor={'primary'}
                onPressColor={colors.primary2}
              />
            )}
          </View>
        </View>
      </View>
    );
  }
  render() {
    const {route} = this.props;
    const {pageFrom, data} = route.params;
    return (
      <View style={[styleApp.stylePage, {borderLeftWidth: 1}]}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.page0.bind(this)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />

        <View style={styleApp.footerBooking}>
          <Button
            icon={'next'}
            backgroundColor="green"
            onPressColor={colors.greenClick}
            styleButton={{marginLeft: 20, width: width - 40}}
            enabled={true}
            disabled={false}
            text={'Next'}
            loader={this.state.loader}
            click={() =>
              this.props.navigation.navigate('Checkout', {
                pageFrom: pageFrom,
                data: data,
                coach: this.state,
              })
            }
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
0;
