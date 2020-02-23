import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {createEventAction} from '../../../actions/createEventActions';
import {createGroupAction} from '../../../actions/createGroupActions';
import NavigationService from '../../../../NavigationService';

import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';
import {timing, native} from '../../animations/animations';

var {height, width} = Dimensions.get('screen');

class ButtonAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    this.rotateButton = new Animated.Value(0);
    this.opacityButton1 = new Animated.Value(0);
    this.translateYButton1 = new Animated.Value(0);
    this.opacityButton2 = new Animated.Value(0);
    this.translateYButton2 = new Animated.Value(0);
    this.opacityButton3 = new Animated.Value(0);
    this.translateYButton3 = new Animated.Value(0);
  }
  async componentDidMount() {
    this.props.onRef(this);
  }
  close() {
    this.open(!this.state.open);
  }
  async open(val, to) {
    if (val) {
      await this.props.translateXVoile.setValue(0);
      await this.opacityButton3.setValue(1);
      await this.opacityButton2.setValue(1);
      await this.opacityButton1.setValue(1);
      return Animated.parallel([
        Animated.timing(this.rotateButton, native(1, 200)),
        Animated.timing(this.translateYButton1, native(-65, 200)),
        Animated.timing(this.translateYButton2, native(-130, 200)),
        Animated.timing(this.translateYButton3, native(-195, 200)),
        Animated.timing(this.props.opacityVoile, native(0.4, 200)),
      ]).start(() => this.setState({open: true}));
    }
    if (to === 'CreateEvent0') {
      await this.props.createEventAction('setStep1', {
        groups: [],
      });
    }
    return Animated.parallel([
      Animated.timing(this.rotateButton, native(0, 200)),
      Animated.timing(this.translateYButton1, native(0, 200)),
      Animated.timing(this.translateYButton2, native(0, 200)),
      Animated.timing(this.translateYButton3, native(0, 200)),
      Animated.timing(this.props.opacityVoile, native(0, 200)),
    ]).start(() => {
      this.props.translateXVoile.setValue(width);
      this.opacityButton1.setValue(0);
      this.opacityButton2.setValue(0);
      this.opacityButton3.setValue(0);
      this.setState({open: false});
      if (to !== undefined) {
        NavigationService.navigate(to);
      }
    });
  }

  textButton() {
    if (this.props.typeButton === 'event') return 'New event';
    return 'New group';
  }
  iconButton() {
    if (this.props.typeButton === 'event') return 'calendar2';
    return 'profileFooter';
  }

  render() {
    const spin = this.rotateButton.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '45deg'],
    });
    return (
      <View>
        <Animated.View
          style={[
            styles.viewButton,
            {
              opacity: this.opacityButton3,
              transform: [{translateY: this.translateYButton3}],
            },
          ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.open(!this.state.open, 'CreateEvent0')}
            style={{position: 'absolute', left: -134, width: 140}}>
            <Text
              style={[
                styleApp.title,
                styleApp.textShadowColor,
                {color: 'white', fontSize: 17, fontFamily: 'OpenSans-Bold'},
              ]}>
              New Challenge
            </Text>
          </TouchableOpacity>

          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name="mountain"
                  color={colors.green}
                  size={23}
                  type="moon"
                />
              );
            }}
            click={() => this.open(!this.state.open, 'CreateEvent0')}
            color={'white'}
            style={[styleApp.center, styleApp.shade2, styles.buttonRound]}
            onPressColor={colors.off}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.viewButton,
            {
              opacity: this.opacityButton2,
              transform: [{translateY: this.translateYButton2}],
            },
          ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.open(!this.state.open, 'CreateEvent0')}
            style={{position: 'absolute', left: -100, width: 100}}>
            <Text
              style={[
                styleApp.title,
                styleApp.textShadowColor,
                {color: 'white', fontSize: 17, fontFamily: 'OpenSans-Bold'},
              ]}>
              New Event
            </Text>
          </TouchableOpacity>

          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name="calendar2"
                  color={colors.green}
                  size={21}
                  type="moon"
                />
              );
            }}
            click={() => this.open(!this.state.open, 'CreateEvent0')}
            color={'white'}
            style={[styleApp.center, styleApp.shade2, styles.buttonRound]}
            onPressColor={colors.off}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.viewButton,
            {
              opacity: this.opacityButton1,
              transform: [{translateY: this.translateYButton1}],
            },
          ]}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => this.open(!this.state.open, this.props.pageTo)}
            style={{position: 'absolute', left: -100, width: 100}}>
            <Text
              style={[
                styleApp.title,
                styleApp.textShadowColor2,
                {color: 'white', fontSize: 17, fontFamily: 'OpenSans-Bold'},
              ]}>
              {this.textButton()}
            </Text>
          </TouchableOpacity>

          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name={this.iconButton()}
                  color={colors.green}
                  size={21}
                  type="moon"
                />
              );
            }}
            click={() => this.open(!this.state.open, this.props.pageTo)}
            color={'white'}
            style={[styleApp.center, styleApp.shade2, styles.buttonRound]}
            onPressColor={colors.off}
          />
        </Animated.View>

        <Animated.View
          style={[styles.viewButton, {transform: [{rotate: spin}]}]}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons name="plus" color={'white'} size={18} type="font" />
              );
            }}
            click={() => this.open(!this.state.open)}
            color={colors.green}
            style={[styleApp.center, styleApp.shade2, styles.buttonRound]}
            onPressColor={colors.greenLight}
          />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewButton: {
    ...styleApp.center,
    borderColor: colors.off,
    height: 55,
    width: 55,
    position: 'absolute',
    zIndex: 40,
    bottom: 20,
    right: 20,
  },
  buttonRound: {
    borderColor: colors.off,
    height: 60,
    width: 60,
    borderRadius: 30,
    borderWidth: 1,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {createEventAction, createGroupAction})(
  ButtonAdd,
);
