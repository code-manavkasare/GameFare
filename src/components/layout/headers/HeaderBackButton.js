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
      initialBorderColorHeader,
      initialBorderWidth,
      initialBackgroundColor,
      initialBorderColorIcon,
    } = this.props;
    const AnimateOpacityTitle = AnimatedHeaderValue.interpolate({
      inputRange: [inputRange[1] + 10, inputRange[1] + 20],
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
      onPressColorIcon1,
      badgeIcon1,
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (icon1) {
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
            click={() => {
              logMixpanel({label: 'Click Header: ' + icon1});
              this.props.clickButton1();
            }}
            color={backgroundColorIcon1 ? backgroundColorIcon1 : colors.white}
            style={[styles.buttonRight]}
            onPressColor={onPressColorIcon1 ? onPressColorIcon1 : colors.off}
          />
          {badgeIcon1 && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -0,
                left: -5,
              }}>
              {badgeIcon1}
            </View>
          )}
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
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (icon11) {
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              backgroundColor: backgroundColorIcon11
                ? backgroundColorIcon11
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
            click={() => {
              logMixpanel({label: 'Click Header: ' + icon11});
              this.props.clickButton11();
            }}
            color={backgroundColorIcon11 ? backgroundColorIcon11 : colors.white}
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
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (icon12) {
      return (
        <Animated.View
          style={[
            styles.animatedButtonStyle,
            {
              backgroundColor: backgroundColorIcon12
                ? backgroundColorIcon12
                : colors.white,
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
            color={backgroundColorIcon12 ? backgroundColorIcon12 : colors.white}
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
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (iconOffset) {
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
                  : colors.white
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
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
    if (iconOffset2) {
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
            color={
              backgroundColorIconOffset
                ? backgroundColorIconOffset
                : colors.white
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
    } = this.props;
    const {borderColorIcon} = this.animatedValues();
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
            color={backgroundColorIcon2 ? backgroundColorIcon2 : colors.white}
            style={styles.buttonRight}
            onPressColor={
              backgroundColorIcon2 ? backgroundColorIcon2 : colors.off
            }
          />
          {badgeIcon2 && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -0,
                left: -5,
              }}>
              {badgeIcon2}
            </View>
          )}
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
    } = this.props;
    const {portrait} = currentScreenSize;
    const marginTop = marginTopProp
      ? marginTopProp
      : portrait
      ? marginTopApp
      : marginTopAppLandscape;
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
      ...containerStyle,
    };

    return (
      <Animated.View style={styleHeader}>
        <Row>
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
                {imgHeader && (
                  <Col size={25} style={styleApp.center2}>
                    {imgHeader}
                  </Col>
                )}
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
    zIndex: 9,
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
    width: width * 0.9,
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
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderBackButton);
