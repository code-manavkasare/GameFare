import React, {Component} from 'react';
import {Animated, View} from 'react-native';
import FontIcon from 'react-native-vector-icons/FontAwesome5';

import colors from '../../style/colors';
import styleApp from '../../style/style';
import ButtonColor from '../Views/Button';

import {timing, native} from '../../animations/animations';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);

export default class ExpandableView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.expanded = new Animated.Value(0);
    this.open = 0;
  }

  async expand() {
    console.log('this.open', this.open);
    if (this.open === 0) {
      await Animated.parallel([
        Animated.timing(this.expanded, timing(1, 100)),
      ]).start(() => (this.open = 1));
    } else {
      await Animated.parallel([
        Animated.timing(this.expanded, timing(0, 100)),
      ]).start(() => (this.open = 0));
    }
    return true;
  }

  render() {
    const {lengthList, heightCard, list} = this.props;
    const spin = this.expanded.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    const heightDropDown = this.expanded.interpolate({
      inputRange: [0, 1],
      outputRange: [heightCard * 2, heightCard * lengthList],
    });

    return (
      <View>
        <Animated.View
          style={{
            height: heightDropDown,
            overflow: 'hidden',
          }}>
          {list}
        </Animated.View>
        <ButtonColor
          view={() => {
            return (
              <AnimatedIcon
                name="chevron-down"
                color={colors.title}
                style={{transform: [{rotate: spin}]}}
                size={20}
              />
            );
          }}
          click={() => this.expand()}
          color={'white'}
          style={[
            styleApp.center,
            {
              height: 40,
              borderBottomWidth: 1,
              borderTopWidth: 1,
              borderColor: colors.off,
            },
          ]}
          onPressColor={colors.off}
        />
      </View>
    );
  }
}
