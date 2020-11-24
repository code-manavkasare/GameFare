import React, {Component} from 'react';
import {View, Text, Animated, StyleSheet} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {string} from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import {goBack} from '../../../../NavigationService';

export default class ModalHeader extends Component {
  static propTypes = {
    title: string,
  };

  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  closeButton() {
    return (
      <Animated.View style={styles.buttonClose}>
        <ButtonColor
          view={() => {
            return (
              <AllIcons
                name="times"
                size={16}
                color={colors.title}
                type="font"
              />
            );
          }}
          click={goBack}
          color={'transparent'}
          onPressColor={colors.white}
        />
      </Animated.View>
    );
  }

  blurView() {
    return (
      <BlurView style={styles.blurView} blurType="light" blurAmount={10} />
    );
  }

  render() {
    const {title} = this.props;
    return (
      <View style={styles.body}>
        {this.closeButton()}
        <Text style={styles.text}>{title}</Text>
        {this.blurView()}
        <View style={styles.blurBackdrop} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    position: 'absolute',
    width: '100%',
    height: 80,
    zIndex: 20,
  },
  text: {
    ...styleApp.text,
    marginTop: 25,
    fontSize: 22,
    textAlign: 'left',
    marginLeft: '5%',
    fontWeight: 'bold',
    color: colors.black,
  },
  buttonClose: {
    position: 'absolute',
    opacity: 1,
    top: 20,
    right: '5%',
    height: 35,
    width: 35,
    zIndex: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  blurView: {
    position: 'absolute',
    zIndex: -1,
    ...styleApp.fullSize,
    top: 0,
  },
  blurBackdrop: {
    position: 'absolute',
    zIndex: -2,
    ...styleApp.fullSize,
    top: 0,
    backgroundColor: colors.white,
    opacity: 0.8,
  },
});
