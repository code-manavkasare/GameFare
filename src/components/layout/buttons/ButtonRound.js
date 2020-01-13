import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Dimensions,
  Easing,
  Animated,
  Image,
  TouchableHighlight,
  View,
} from 'react-native';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import LoaderWhite from '../loaders/Loader';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import AllIcons from '../icons/AllIcons';
import {timing} from '../../animations/animations';

const {height, width} = Dimensions.get('screen');

export default class ButtonRound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColorAnimation: new Animated.Value(0),
    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }
  componentWillMount() {}
  click() {
    this.props.click();
  }
  stylesButton() {
    if (this.props.buttonRound2) return styleApp.buttonRound2;
    if (this.props.styleButton != undefined)
      return {...styleApp.buttonRound, ...this.props.styleButton};
    return styleApp.buttonRound;
  }
  styleButton() {
    if (!this.props.enabled)
      return {...this.stylesButton(), backgroundColor: 'white'};
    return this.stylesButton();
  }
  onPressColor() {
    if (!this.props.enabled) return 'white';
    else if (this.props.onPressColor != undefined)
      return this.props.onPressColor;
    return colors.green;
  }
  colorIcon() {
    if (!this.props.enabled) return '#eaeaea';
    return 'white';
  }
  onPress(val) {
    if (val)
      return Animated.parallel([
        Animated.timing(this.state.backgroundColorAnimation, timing(300, 100)),
      ]).start();
    return Animated.parallel([
      Animated.timing(this.state.backgroundColorAnimation, timing(0, 100)),
    ]).start();
  }
  render() {
    var color = this.state.backgroundColorAnimation.interpolate({
      inputRange: [0, 300],
      outputRange: [this.styleButton().backgroundColor, this.onPressColor()],
    });
    return (
      <Animated.View style={[this.styleButton(), {backgroundColor: color}]}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={this.props.loader}
          onPressIn={() => this.onPress(true)}
          onPressOut={() => this.onPress(false)}
          //underlayColor={this.onPressColor()}
          style={[styleApp.center, {width: '100%', height: '100%'}]}
          onPress={() => (this.props.enabled ? this.props.click() : true)}>
          {this.props.loader ? (
            <LoaderWhite color="white" size={20} />
          ) : this.props.icon == 'next' ? (
            <FontIcon name="arrow-right" size={22} color={this.colorIcon()} />
          ) : this.props.icon == 'invite' ? (
            <FontIcon name="share" size={20} color={this.colorIcon()} />
          ) : this.props.icon == 'send' ? (
            <FontIcon name="comments" size={20} color={this.colorIcon()} />
          ) : this.props.icon == 'sign' ? (
            <AllIcons name="user-alt" size={23} color={'white'} type="font" />
          ) : this.props.icon == 'check' ? (
            <FontIcon name="check" size={25} color={'white'} />
          ) : this.props.icon == 'event' ? (
            <AllIcons
              name="calendar-day"
              size={23}
              color={'white'}
              type="font"
            />
          ) : this.props.icon == 'create' ? (
            <FontIcon name="arrow-right" size={20} color={this.colorIcon()} />
          ) : null}
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
