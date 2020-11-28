import React, {Component} from 'react';
import {connect} from 'react-redux';

import {StyleSheet, Text, Animated, View, TouchableOpacity} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';

import sizes, {
  marginTopApp,
  marginTopAppLandscape,
  width,
} from '../../style/sizes';
import Loader from '../loaders/Loader';
import colors from '../../style/colors';
import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';
import styleApp from '../../style/style';
import AsyncImage from '../image/AsyncImage';
import {logMixpanel} from '../../functions/logs';
import {boolShouldComponentUpdate} from '../../functions/redux';
import {currentScreenSizeSelector} from '../../../store/selectors/layout';

class HeaderBackButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableClickButton: true,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }
  componentDidMount() {
    const {loaderOn, onRef} = this.props;
    if (loaderOn && onRef) {
      onRef(this);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'HeaderBackButton',
    });
  }
  animatedValues() {
    const {
      AnimatedHeaderValue,
      inputRange,
      initialTitleOpacity,
      initialBorderColorHeader,
      initialBorderWidth,
      initialBackgroundColor,
      initialBorderColorIcon,
    } = this.props;
    const AnimateOpacityTitle = AnimatedHeaderValue?.interpolate({
      inputRange: [inputRange[1] - 20, inputRange[1] + 20],
      outputRange: [initialTitleOpacity, 1],
      extrapolate: 'clamp',
    });
    const AnimateOpacityBackground = AnimatedHeaderValue?.interpolate({
      inputRange: [inputRange[1] - 20, inputRange[1] + 20],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    const AnimateBackgroundView = AnimatedHeaderValue?.interpolate({
      inputRange: [inputRange[1] - 20, inputRange[1] + 20],
      outputRange: [initialBackgroundColor, colors.white],
      extrapolate: 'clamp',
    });
    const borderWidth = AnimatedHeaderValue?.interpolate({
      inputRange: inputRange,
      outputRange: [initialBorderWidth ? initialBorderWidth : 0, 1],
      extrapolate: 'clamp',
    });
    const borderColorIcon = initialBorderColorIcon;
    const borderColorView = AnimatedHeaderValue?.interpolate({
      inputRange: [inputRange[1] - 20, inputRange[1] + 20],
      outputRange: [
        initialBorderColorHeader ? initialBorderColorHeader : colors.white,
        colors.off,
      ],
      extrapolate: 'clamp',
    });
    return {
      AnimateOpacityBackground,
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
      onPressColorIcon1,
      badgeIcon1,
      animateIcon1,
    } = this.props;
    const {borderColorIcon, AnimateOpacityTitle} = this.animatedValues();
    if (icon1) {
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              opacity: animateIcon1 ? AnimateOpacityTitle : 1,
              backgroundColor: backgroundColorIcon1
                ? backgroundColorIcon1
                : 'transparent',
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
                  size={sizeIcon1 ? sizeIcon1 : 21}
                  type={typeIcon1 ? typeIcon1 : 'font'}
                />
              );
            }}
            click={() => {
              logMixpanel({label: 'Click Header: ' + icon1});
              this.props.clickButton1();
            }}
            color={backgroundColorIcon1 ? backgroundColorIcon1 : 'transparent'}
            style={[styles.buttonRight]}
            onPressColor={onPressColorIcon1 ? onPressColorIcon1 : colors.off}
          />
          {badgeIcon1 ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -0,
                left: -5,
              }}>
              {badgeIcon1}
            </View>
          ) : null}
        </Animated.View>
      );
    }
    return null;
  }
  button11() {
    const {
      icon11,
      backgroundColorIcon11,
      colorIcon11,
      sizeIcon11,
      typeIcon11,
      nobackgroundColorIcon1,
      animateIcon11,
    } = this.props;
    const {borderColorIcon, AnimateOpacityTitle} = this.animatedValues();
    if (icon11) {
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              opacity: animateIcon11 ? AnimateOpacityTitle : 1,
              backgroundColor: backgroundColorIcon11
                ? backgroundColorIcon11
                : 'transparent',
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
            click={() => {
              logMixpanel({label: 'Click Header: ' + icon11});
              this.props.clickButton11();
            }}
            color={
              backgroundColorIcon11 ? backgroundColorIcon11 : 'transparent'
            }
            style={[styles.buttonRight]}
            onPressColor={colors.off}
          />
        </Animated.View>
      );
    }
    return null;
  }
  button12() {
    const {
      icon12,
      backgroundColorIcon12,
      colorIcon12,
      sizeIcon12,
      typeIcon12,
      animateIcon12,
    } = this.props;
    const {borderColorIcon, AnimateOpacityTitle} = this.animatedValues();
    if (icon12) {
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              opacity: animateIcon12 ? AnimateOpacityTitle : 1,
              backgroundColor: backgroundColorIcon12
                ? backgroundColorIcon12
                : 'transparent',
              borderColor: borderColorIcon,
            },
          ]}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name={icon12}
                  color={colorIcon12 ? colorIcon12 : colors.title}
                  size={sizeIcon12 ? sizeIcon12 : 15}
                  type={typeIcon12 ? typeIcon12 : 'font'}
                />
              );
            }}
            click={() => {
              logMixpanel({label: 'Click Header: ' + icon12});
              this.props.clickButton12();
            }}
            color={
              backgroundColorIcon12 ? backgroundColorIcon12 : 'transparent'
            }
            style={[styles.buttonRight]}
            onPressColor={colors.off}
          />
        </Animated.View>
      );
    }
    return null;
  }

  buttonOffset() {
    const styleButton = {
      height: 48,
      width: 48,
      borderRadius: 23.8,
      borderWidth: 1,
      overFlow: 'hidden',
      ...styleApp.center,
    };
    const {
      clickButtonOffset,
      backgroundColorIconOffset,
      iconOffset,
      textOffset,
      colorIconOffset,
      sizeIconOffset,
      typeIconOffset,
      customOffset,
      animateIconOffset,
    } = this.props;
    const {borderColorIcon, AnimateOpacityTitle} = this.animatedValues();
    if (iconOffset) {
      return (
        <Animated.View
          style={[
            styleButton,
            {
              opacity: animateIconOffset ? AnimateOpacityTitle : 1,
              borderColor: borderColorIcon,
              backgroundColor: backgroundColorIconOffset
                ? backgroundColorIconOffset
                : 'transparent',
            },
          ]}>
          {iconOffset === 'custom' ? (
            customOffset
          ) : (
            <ButtonColor
              view={() => {
                return iconOffset === 'text' ? (
                  <Text
                    style={[
                      styleApp.textBold,
                      {
                        fontSize: 14,
                        color: colorIconOffset ? colorIconOffset : colors.title,
                      },
                    ]}>
                    {textOffset}
                  </Text>
                ) : (
                  <AllIcons
                    name={iconOffset}
                    color={colorIconOffset ? colorIconOffset : colors.title}
                    size={sizeIconOffset ? sizeIconOffset : 15}
                    type={typeIconOffset ? typeIconOffset : 'font'}
                  />
                );
              }}
              click={() => {
                logMixpanel({label: 'Click Header: ' + iconOffset});
                clickButtonOffset();
              }}
              style={styles.buttonRight}
              onPressColor={colors.off}
              color={
                backgroundColorIconOffset
                  ? backgroundColorIconOffset
                  : 'transparent'
              }
            />
          )}
        </Animated.View>
      );
    }
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
      backgroundColorIconOffset,
      iconOffset2,
      textOffset2,
      colorIconOffset2,
      sizeIconOffset2,
      typeIconOffset2,
      nobackgroundColorIcon1,
      animateIconOffset2,
    } = this.props;
    const {borderColorIcon, AnimateOpacityTitle} = this.animatedValues();
    if (iconOffset2) {
      return (
        <Animated.View
          style={[
            styleButton,
            {
              opacity: animateIconOffset2 ? AnimateOpacityTitle : 1,
              borderColor: borderColorIcon,
              backgroundColor: backgroundColorIconOffset
                ? backgroundColorIconOffset
                : 'transparent',
            },
          ]}>
          <ButtonColor
            color={
              backgroundColorIconOffset
                ? backgroundColorIconOffset
                : 'transparent'
            }
            // color={nobackgroundColorIcon1 ? null : 'white'}
            view={() => {
              return iconOffset2 === 'text' ? (
                <Text style={styleApp.textBold}>{textOffset2}</Text>
              ) : (
                <AllIcons
                  name={iconOffset2}
                  color={colorIconOffset2 ? colorIconOffset2 : colors.title}
                  size={sizeIconOffset2 ? sizeIconOffset2 : 15}
                  type={typeIconOffset2 ? typeIconOffset2 : 'font'}
                />
              );
            }}
            click={() => {
              logMixpanel({label: 'Click Header: ' + iconOffset2});
              clickButtonOffset2();
            }}
            style={[styles.buttonRight]}
            onPressColor={colors.off}
          />
        </Animated.View>
      );
    }
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
      badgeIcon2,
      animateIcon2,
    } = this.props;
    const {borderColorIcon, AnimateOpacityTitle} = this.animatedValues();
    if (loader) {
      return (
        <Loader
          color={colorLoader ? colorLoader : colors.green}
          size={sizeLoader ? sizeLoader : 35}
        />
      );
    }
    if (icon2) {
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              opacity: animateIcon2 ? AnimateOpacityTitle : 1,
              borderColor: borderColorIcon,
              backgroundColor: backgroundColorIcon2
                ? colors.transparent
                : 'transparent',
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
                      color: colorIcon2
                        ? colorIcon2
                        : text2Off
                        ? colors.off
                        : colors.title,
                      fontSize: 14,
                    },
                  ]}>
                  {text2}
                </Text>
              ) : (
                <AllIcons
                  name={icon2}
                  color={colorIcon2 ? colorIcon2 : colors.title}
                  size={sizeIcon2 ? sizeIcon2 : 15}
                  type={typeIcon2 ? typeIcon2 : 'font'}
                />
              );
            }}
            click={() => {
              logMixpanel({label: 'Click Header: ' + icon2});
              clickButton2();
            }}
            color={backgroundColorIcon2 ? backgroundColorIcon2 : 'transparent'}
            style={styles.buttonRight}
            onPressColor={
              backgroundColorIcon2 ? backgroundColorIcon2 : colors.off
            }
          />
          {badgeIcon2 ? (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -0,
                left: -5,
              }}>
              {badgeIcon2}
            </View>
          ) : null}
        </Animated.View>
      );
    }
  }
  clickImgHeader = () => {
    const {clickImgHeader} = this.props;
    logMixpanel({label: 'Click Img header', params: {}});
    clickImgHeader();
  };
  render() {
    const {
      imgHeader,
      currentScreenSize,
      opacityHeader,
      textHeader,
      clickImgHeader,
      searchBar,
      containerStyle,
      marginTop: marginTopProp,
      searchBarStyle,
      initialBackgroundColor,
    } = this.props;
    const {portrait} = currentScreenSize;
    const marginTop =
      marginTopProp !== undefined
        ? marginTopProp
        : portrait
        ? marginTopApp
        : marginTopAppLandscape;
    const {
      AnimateOpacityTitle,
      AnimateOpacityBackground,
    } = this.animatedValues();
    const styleHeader = {
      ...styles.header,
      backgroundColor: initialBackgroundColor,
      opacity: opacityHeader ? opacityHeader : 1,
      width: '100%',
      ...containerStyle,
    };
    const styleRowHeader = {
      ...styles.rowHeader,
      marginTop,
    };
    const styleBackdrop = {
      ...styleApp.fullSize,
      width: '100%',
      position: 'absolute',
      zIndex: -5,
      opacity: AnimateOpacityBackground,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderColor: colors.off,
    };

    return (
      <Animated.View style={styleHeader}>
        <Row style={styleRowHeader}>
          {searchBar ? (
            <View style={{...styles.rowTextImgHeader, ...searchBarStyle}}>
              {searchBar}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => clickImgHeader && this.clickImgHeader()}
              activeOpacity={0.7}
              style={
                imgHeader ? styles.rowTextImgHeader : styles.rowTextHeader
              }>
              <Row>
                {imgHeader ? (
                  <Col size={25} style={styleApp.center2}>
                    {imgHeader}
                  </Col>
                ) : null}
                <Col
                  size={70}
                  style={imgHeader ? styleApp.center2 : styleApp.center}>
                  <Animated.Text
                    style={[styleApp.textBold, {opacity: AnimateOpacityTitle}]}>
                    {textHeader}
                  </Animated.Text>
                </Col>
              </Row>
            </TouchableOpacity>
          )}

          <Col size={15} style={styleApp.center2} activeOpacity={0.4}>
            {this.button1()}
          </Col>
          <Col size={15} style={[styleApp.center2]}>
            {this.button11()}
          </Col>
          <Col size={15} style={[styleApp.center2]}>
            {this.button12()}
          </Col>

          <Col size={15} style={[styleApp.center3]}>
            {this.buttonOffset2()}
          </Col>
          <Col size={15} style={[styleApp.center3]}>
            {this.buttonOffset()}
          </Col>
          <Col size={15} style={[styleApp.center3]}>
            {this.button2()}
          </Col>
        </Row>
        <Animated.View style={styleBackdrop} />
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
    position: 'absolute',
    zIndex: 9,
  },
  rowHeader: {
    height: sizes.heightHeaderHome,
    paddingLeft: '5%',
    paddingRight: '5%',
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
  },
  rowTextHeader: {
    height: '100%',
    position: 'absolute',
    width: width,
    zIndex: -1,
  },
  rowTextImgHeader: {
    height: '100%',
    position: 'absolute',
    width: '65%',
    marginLeft: '17.5%',
    zIndex: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    currentScreenSize: currentScreenSizeSelector(state),
  };
};

export default connect(mapStateToProps)(HeaderBackButton);
