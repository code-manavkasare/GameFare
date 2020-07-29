import React, {Component} from 'react';
import {connect} from 'react-redux';

import {StyleSheet, Text, Animated, View} from 'react-native';
import {Grid, Row, Col} from 'react-native-easy-grid';

import sizes, {marginTopApp, marginTopAppLandscape} from '../../style/sizes';
import Loader from '../loaders/Loader';
import colors from '../../style/colors';
import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';
import styleApp from '../../style/style';
import AsyncImage from '../image/AsyncImage';

class HeaderBackButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableClickButton: true,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  componentDidMount() {
    const {loaderOn} = this.props;
    if (loaderOn) {
      this.props.onRef(this);
    }
  }
  animatedValues() {
    const {
      AnimatedHeaderValue,
      inputRange,
      initialBorderColorHeader,
      initialBorderWidth,
      initialBackgroundColor,
      initialBorderColorIcon,
    } = this.props;
    const AnimateOpacityTitle = AnimatedHeaderValue.interpolate({
      inputRange: [inputRange[1] + 20, inputRange[1] + 30],
      outputRange: [this.props.initialTitleOpacity, 1],
      extrapolate: 'clamp',
    });
    const AnimateBackgroundView = AnimatedHeaderValue.interpolate({
      inputRange: [inputRange[1] - 0.42, inputRange[1] - 0.1],
      outputRange: [initialBackgroundColor, colors.white],
      extrapolate: 'clamp',
    });
    const borderWidth = AnimatedHeaderValue.interpolate({
      inputRange: inputRange,
      outputRange: [initialBorderWidth ? initialBorderWidth : 0, 1],
      extrapolate: 'clamp',
    });
    const borderColorIcon = AnimatedHeaderValue.interpolate({
      inputRange: inputRange,
      outputRange: [initialBorderColorIcon, colors.white],
      extrapolate: 'clamp',
    });
    const borderColorView = AnimatedHeaderValue.interpolate({
      inputRange: inputRange,
      outputRange: [
        initialBorderColorHeader ? initialBorderColorHeader : colors.white,
        colors.off,
      ],
      extrapolate: 'clamp',
    });
    return {
      AnimateOpacityTitle,
      AnimateBackgroundView,
      borderWidth,
      borderColorIcon,
      borderColorView,
    };
  }
  button1() {
    const {
      icon1,
      backgroundColorIcon1,
      colorIcon1,
      sizeIcon1,
      typeIcon1,
      nobackgroundColorIcon1,
      onPressColorIcon1,
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (icon1)
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              backgroundColor: backgroundColorIcon1
                ? backgroundColorIcon1
                : colors.white,
              borderColor: borderColorIcon,
            },
          ]}>
          <ButtonColor
            view={() => {
              return typeIcon1 === 'image' ? (
                <AsyncImage
                  mainImage={icon1}
                  style={{
                    width: sizeIcon1,
                    height: sizeIcon1,
                    borderRadius: sizeIcon1 / 2,
                  }}
                />
              ) : (
                <AllIcons
                  name={icon1}
                  color={colorIcon1 ? colorIcon1 : colors.title}
                  size={sizeIcon1 ? sizeIcon1 : 15}
                  type={typeIcon1 ? typeIcon1 : 'font'}
                />
              );
            }}
            click={() => this.props.clickButton1()}
            color={backgroundColorIcon1 ? backgroundColorIcon1 : 'white'}
            style={[styles.buttonRight]}
            onPressColor={onPressColorIcon1 ? onPressColorIcon1 : colors.off}
          />
        </Animated.View>
      );
    return null;
  }
  button11() {
    const {
      icon11,
      backgroundColorIcon1,
      colorIcon11,
      sizeIcon11,
      typeIcon11,
      nobackgroundColorIcon1,
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (icon11)
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              backgroundColor: backgroundColorIcon1
                ? backgroundColorIcon1
                : colors.white,
              borderColor: borderColorIcon,
            },
          ]}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name={icon11}
                  color={colorIcon11 ? colorIcon11 : colors.title}
                  size={sizeIcon11 ? sizeIcon11 : 15}
                  type={typeIcon11 ? typeIcon11 : 'font'}
                />
              );
            }}
            click={() => this.props.clickButton11()}
            color={nobackgroundColorIcon1 ? null : 'white'}
            style={[styles.buttonRight]}
            onPressColor={colors.off}
          />
        </Animated.View>
      );
    return null;
  }
  buttonOffset() {
    const styleButton = {
      height: 48,
      width: 48,
      borderRadius: 23.8,
      borderWidth: 1,
      overFlow: 'hidden',
    };
    const {
      clickButtonOffset,
      backgroundColorIconOffset,
      iconOffset,
      textOffset,
      colorIconOffset,
      sizeIconOffset,
      typeIconOffset,
      nobackgroundColorIcon1,
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (iconOffset)
      return (
        <Animated.View
          style={[
            styleButton,
            {
              borderColor: borderColorIcon,
              backgroundColor: backgroundColorIconOffset
                ? backgroundColorIconOffset
                : colors.white,
            },
          ]}>
          <ButtonColor
            color={nobackgroundColorIcon1 ? null : 'white'}
            view={() => {
              return iconOffset === 'text' ? (
                <Text style={styleApp.textBold}>{textOffset}</Text>
              ) : (
                <AllIcons
                  name={iconOffset}
                  color={colorIconOffset ? colorIconOffset : colors.title}
                  size={sizeIconOffset}
                  type={typeIconOffset}
                />
              );
            }}
            click={() => clickButtonOffset()}
            style={styles.buttonRight}
            onPressColor={colors.off}
          />
        </Animated.View>
      );
  }
  buttonOffset2() {
    const styleButton = {
      height: 48,
      width: 48,
      borderRadius: 23.8,
      borderWidth: 1,
      overFlow: 'hidden',
    };
    const {
      clickButtonOffset2,
      backgroundColorIcon1,
      iconOffset2,
      textOffset2,
      colorIconOffset2,
      sizeIconOffset2,
      typeIconOffset2,
      nobackgroundColorIcon1,
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (iconOffset2)
      return (
        <Animated.View
          style={[
            styleButton,
            {
              borderColor: borderColorIcon,
              backgroundColor: backgroundColorIcon1
                ? backgroundColorIcon1
                : colors.white,
            },
          ]}>
          <ButtonColor
            color={nobackgroundColorIcon1 ? null : 'white'}
            view={() => {
              return iconOffset2 === 'text' ? (
                <Text style={styleApp.textBold}>{textOffset2}</Text>
              ) : (
                <AllIcons
                  name={iconOffset2}
                  color={colorIconOffset2 ? colorIconOffset2 : colors.title}
                  size={sizeIconOffset2}
                  type={typeIconOffset2}
                />
              );
            }}
            click={() => clickButtonOffset2()}
            style={[styleApp.center, styleApp.fullSize]}
            onPressColor={colors.off}
          />
        </Animated.View>
      );
  }
  button2() {
    const {
      loader,
      icon2,
      colorLoader,
      sizeLoader,
      backgroundColorIcon2,
      colorIcon2,
      clickButton2,
      sizeIcon2,
      typeIcon2,
      text2Off,
      text2,
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (loader)
      return (
        <Loader
          color={colorLoader ? colorLoader : colors.green}
          size={sizeLoader ? sizeLoader : 35}
        />
      );
    if (icon2)
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              borderColor: borderColorIcon,
              backgroundColor: backgroundColorIcon2
                ? colors.transparent
                : colors.white,
            },
          ]}>
          <ButtonColor
            view={() => {
              return loader ? (
                <Loader size={30} color={colors.primary} />
              ) : icon2 === 'text' ? (
                <Text
                  style={[
                    styleApp.textBold,
                    {
                      color: text2Off ? colors.off : colors.title,
                    },
                  ]}>
                  {text2}
                </Text>
              ) : (
                <AllIcons
                  name={icon2}
                  color={colorIcon2 ? colorIcon2 : colors.title}
                  size={sizeIcon2}
                  type={typeIcon2}
                />
              );
            }}
            click={() => clickButton2()}
            color={backgroundColorIcon2 ? backgroundColorIcon2 : colors.white}
            style={styles.buttonRight}
            onPressColor={
              backgroundColorIcon2 ? backgroundColorIcon2 : colors.off
            }
          />
        </Animated.View>
      );
  }
  render() {
    const {
      imgHeader,
      currentScreenSize,
      opacityHeader,
      textHeader,
    } = this.props;
    const {portrait} = currentScreenSize;
    const marginTop = portrait ? marginTopApp : marginTopAppLandscape;

    const {
      AnimateOpacityTitle,
      AnimateBackgroundView,
      borderColorView,
      borderWidth,
    } = this.animatedValues();

    const styleHeader = {
      ...styles.header,
      backgroundColor: AnimateBackgroundView,
      marginTop: marginTop,
      opacity: opacityHeader ? opacityHeader : 1,
      borderBottomWidth: borderWidth,
      borderColor: borderColorView,
      width: '100%',
    };

    return (
      <Animated.View style={styleHeader}>
        <Row>
          <View style={styles.rowTextHeader}>
            <Animated.Text
              style={[styleApp.textHeader, {opacity: AnimateOpacityTitle}]}>
              {textHeader}
            </Animated.Text>
          </View>
          <Col size={15} style={styleApp.center2} activeOpacity={0.4}>
            {this.button1()}
          </Col>
          <Col size={15} style={styleApp.center}>
            {imgHeader ? imgHeader : this.button11()}
          </Col>
          <Col size={11} style={styles.center} />
          <Col size={18} style={[styleApp.center3]}>
            {this.buttonOffset2()}
          </Col>
          <Col size={18} style={[styleApp.center3]}>
            {this.buttonOffset()}
          </Col>
          <Col size={18} style={[styleApp.center3]}>
            {this.button2()}
          </Col>
        </Row>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: sizes.heightHeaderHome,
    paddingLeft: '5%',
    paddingRight: '5%',
    borderBottomWidth: 1,
    position: 'absolute',
    zIndex: 10,
  },
  buttonRight: {
    ...styleApp.center,
    height: 46,
    width: 46,
    borderRadius: 23,
    borderWidth: 0,
  },
  animatedButtonStyle: {
    height: 48,
    width: 48,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: 'white',
    // overFlow: 'hidden',
  },
  rowTextHeader: {
    ...styleApp.center,
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderBackButton);
