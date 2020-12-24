import React, {Component} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {native} from '../../animations/animations';
import {View} from 'react-native';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {goBack} from '../../../../NavigationService';
import {height as deviceHeight, width as deviceWidth} from '../../style/sizes';
import AllIcon from '../../layout/icons/AllIcons';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {timeout} from '../../functions/coach';

export default class InteractionView extends Component {
  constructor(props) {
    super(props);
    this.reveal = new Animated.Value(0);
  }
  componentWillMount() {
    Animated.timing(this.reveal, native(1, 500)).start();
  }
  dismissView = async (completeInteraction) => {
    const {completion, onPress} = this.props.route.params;
    Animated.timing(this.reveal, native(0, 150)).start();
    if (!completeInteraction) {
      await timeout(150);
      await goBack();
    } else {
      await goBack();
      await onPress();
    }
    if (completion) completion();
  };
  render = () => {
    const {
      children,
      x,
      y,
      height,
      width,
      text,
      overlayStyle,
      offset,
    } = this.props.route.params;
    const opacity = this.reveal.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.3],
      extrapolate: 'clamp',
    });
    const offsetY = offset?.y ?? 0;
    const offsetX = offset?.x ?? 0;
    return (
      <Animated.View
        style={{
          ...styleApp.fullSize,
          ...styleApp.center,
          opacity: this.reveal,
        }}>
        <Animated.View style={{...styles.backdrop, opacity}}>
          <TouchableWithoutFeedback
            style={styleApp.fullSize}
            onPress={() => {
              this.dismissView(false);
            }}
          />
        </Animated.View>
        <View
          style={{
            ...styles.caret,
            top: y > deviceWidth * 0.5 ? undefined : y + height + 5 + offsetY,
            bottom:
              y > deviceWidth * 0.5
                ? deviceHeight - (y - height + 19 + offsetY)
                : undefined,
            left:
              x > deviceWidth * 0.5
                ? undefined
                : x + width * 0.5 - 10 + offsetX,
            right:
              x > deviceWidth * 0.5
                ? deviceWidth - (x + width * 0.5 + offsetX)
                : undefined,
          }}>
          <AllIcon
            size={34}
            type={'font'}
            name={y > deviceWidth * 0.5 ? 'caret-down' : 'caret-up'}
            solid
            color={colors.white}
          />
        </View>
        <View
          style={{
            top: y > deviceWidth * 0.5 ? undefined : y + height + 25 + offsetY,
            bottom:
              y > deviceWidth * 0.5
                ? deviceHeight - (y - height + offsetY)
                : undefined,
            left: x > deviceWidth * 0.5 ? undefined : x + offsetX,
            right:
              x > deviceWidth * 0.5
                ? deviceWidth - (x + width + offsetX)
                : undefined,
            ...styles.dialog,
          }}>
          <Text style={styles.text}>{text}</Text>
        </View>
        <View
          style={{
            ...styles.childrenView,
            top: y,
            left: x,
            height,
            width,
            ...overlayStyle,
          }}
          onTouchStart={() => {
            this.dismissView(true);
          }}>
          {React.Children.map(children, (child) => React.cloneElement(child))}
        </View>
      </Animated.View>
    );
  };
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: colors.white,
    position: 'absolute',
    ...styleApp.shadow,
    ...styleApp.center,
    maxWidth: deviceWidth * 0.7,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  text: {...styleApp.textBold, textAlign: 'center', color: colors.greyDarker},
  caret: {
    zIndex: 2,
    position: 'absolute',
  },
  childrenView: {
    ...styleApp.center,
    zIndex: 5,
    position: 'absolute',
    borderRadius: 15,
  },
  backdrop: {
    ...styleApp.fullSize,
    backgroundColor: colors.black,
    position: 'absolute',
    zIndex: -1,
  },
});
