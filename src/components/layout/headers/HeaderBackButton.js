import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  BackHandler,
  Easing,
  View,
  Dimensions,
} from 'react-native';
import {Grid, Row, Col} from 'react-native-easy-grid';

import sizes from '../../style/sizes';
import Loader from '../loaders/Loader';
import colors from '../../style/colors';
import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';
import styleApp from '../../style/style';
import AsyncImage from '../image/AsyncImage';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);
const {height, width} = Dimensions.get('screen');

export default class HeaderFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableClickButton: true,
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
  }
  componentWillMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    if (this.props.loaderOn) {
      this.props.onRef(this);
    }
  }
  handleBackPress = () => {
    if (this.props.enableClickButton && this.state.enableClickButton) {
      this.close();
    }
  };
  componentWillUnmount() {
    this.backHandler.remove();
  }
  async close() {
    this.setState({enableClickButton: false});
    if (this.props.enableClickButton && this.state.enableClickButton) {
      this.props.close();
      var that = this;
      setTimeout(function() {
        that.setState({enableClickButton: true});
      }, 1500);
    }
  }
  sizeColTitle() {
    if (this.props.headerType) return 25;
    return 70;
  }
  render() {
    const AnimateOpacityTitle = this.props.AnimatedHeaderValue.interpolate({
      inputRange: [
        this.props.inputRange[1] + 20,
        this.props.inputRange[1] + 30,
      ],
      outputRange: [this.props.initialTitleOpacity, 1],
      extrapolate: 'clamp',
    });
    const AnimateBackgroundView = this.props.AnimatedHeaderValue.interpolate({
      inputRange: [
        this.props.inputRange[1] - 0.42,
        this.props.inputRange[1] - 0.1,
      ],
      outputRange: [this.props.initialBackgroundColor, 'white'],
      extrapolate: 'clamp',
    });
    const borderWidth = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [
        this.props.initialBorderWidth ? this.props.initialBorderWidth : 0,
        0.3,
      ],
      extrapolate: 'clamp',
    });
    const AnimateColorIcon = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [colors.title, colors.title],
      extrapolate: 'clamp',
    });
    const borderColorIcon = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [this.props.initialBorderColorIcon, 'white'],
      extrapolate: 'clamp',
    });
    const borderColorView = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [
        this.props.initialBorderColorHeader
          ? this.props.initialBorderColorHeader
          : 'white',
        colors.grey,
      ],
      extrapolate: 'clamp',
    });

    const {
      sizeLoader,
      colorLoader,
      colorIcon1,
      nobackgroundColorIcon1,
      sizeIcon1,
      backgroundColorIcon1,
      backgroundColorIcon2,
      colorIcon2,
    } = this.props;
    return (
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: AnimateBackgroundView,
            borderBottomWidth: borderWidth,
            borderColor: borderColorView,
            width: width,
          },
        ]}>
        <Row>
          <View style={styles.rowTextHeader}>
            <Animated.Text
              style={[styleApp.textHeader, {opacity: AnimateOpacityTitle}]}>
              {this.props.textHeader}
            </Animated.Text>
          </View>
          <Col size={15} style={styles.center2} activeOpacity={0.4}>
            {this.props.icon1 && (
              <Animated.View
                style={[
                  styles.animatedButtonStyle,
                  {
                    backgroundColor: backgroundColorIcon1
                      ? backgroundColorIcon1
                      : 'white',
                  },
                  {
                    borderColor: borderColorIcon,
                  },
                ]}>
                <ButtonColor
                  view={() => {
                    return (
                      <AllIcons
                        name={this.props.icon1}
                        color={colorIcon1 ? colorIcon1 : colors.title}
                        size={sizeIcon1 ? sizeIcon1 : 15}
                        type="font"
                      />
                    );
                  }}
                  click={() => this.props.clickButton1()}
                  color={nobackgroundColorIcon1 ? null : 'white'}
                  style={[styles.buttonRight]}
                  onPressColor={colors.off}
                />
              </Animated.View>
            )}
          </Col>
          <Col size={15} style={styleApp.center}>
            {this.props.imgHeader ? this.props.imgHeader : null}
          </Col>
          <Col size={35} style={styles.center} />
          <Col size={15} style={[styleApp.center3]}>
            {this.props.loader ? null : this.props.clickButtonOffset ? (
              <Animated.View
                style={[
                  {
                    borderColor: borderColorIcon,
                    height: 48,
                    width: 48,
                    borderRadius: 23.8,
                    borderWidth: 1,
                    backgroundColor: 'white',
                    overFlow: 'hidden',
                  },
                ]}>
                <ButtonColor
                  view={() => {
                    return this.props.loader ? (
                      <Loader
                        size={sizeLoader ? sizeLoader : 20}
                        color={colorLoader ? colorLoader : 'primary'}
                      />
                    ) : this.props.iconOffset === 'text' ? (
                      <Text style={styleApp.text}>{this.props.textOffset}</Text>
                    ) : (
                      <AllIcons
                        name={this.props.iconOffset}
                        color={
                          this.props.colorIconOffset === colors.white
                            ? colors.title
                            : colors.white
                        }
                        size={this.props.sizeIcon2}
                        type={this.props.typeIconOffset}
                      />
                    );
                  }}
                  click={() => this.props.clickButtonOffset()}
                  color={this.props.colorIconOffset}
                  style={[
                    styleApp.center,
                    {
                      height: 46,
                      width: 46,
                      borderRadius: 23,
                      borderWidth: 0,
                      overFlow: 'hidden',
                    },
                  ]}
                  onPressColor={colors.off}
                />
              </Animated.View>
            ) : null}
          </Col>
          <Col size={2} style={styles.center} />
          <Col size={15} style={[styleApp.center3]}>
            {this.props.loader ? (
              <Loader
                color={colorLoader ? colorLoader : 'green'}
                size={sizeLoader ? sizeLoader : 24}
              />
            ) : (
              this.props.icon2 && (
                <Animated.View
                  style={[
                    styles.animatedButtonStyle,
                    {
                      borderColor: borderColorIcon,
                      backgroundColor: backgroundColorIcon2
                        ? 'transparent'
                        : 'white',
                    },
                  ]}>
                  <ButtonColor
                    view={() => {
                      return this.props.loader ? (
                        <Loader size={20} color={'primary'} />
                      ) : this.props.icon2 == 'text' ? (
                        <Text
                          style={[
                            styleApp.text,
                            {
                              color: this.props.text2Off
                                ? colors.off
                                : colors.title,
                            },
                          ]}>
                          {this.props.text2}
                        </Text>
                      ) : (
                        <AllIcons
                          name={this.props.icon2}
                          color={colorIcon2 ? colorIcon2 : colors.title}
                          size={this.props.sizeIcon2}
                          type={this.props.typeIcon2}
                        />
                      );
                    }}
                    click={() => this.props.clickButton2()}
                    color={
                      backgroundColorIcon2 ? backgroundColorIcon2 : colors.white
                    }
                    style={styles.buttonRight}
                    onPressColor={
                      backgroundColorIcon2 ? backgroundColorIcon2 : colors.off
                    }
                  />
                </Animated.View>
              )
            )}
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
  center2: {
    justifyContent: 'center',
  },
  header: {
    height: sizes.heightHeaderHome,
    paddingTop: sizes.marginTopHeader - 5,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 1,
    position: 'absolute',
    zIndex: 10,
  },
  title: {
    fontSize: 15,
    paddingLeft: 7,
    color: '#4B4B4B',
  },
  textTitleHeader: {
    color: colors.title,
    fontSize: 17,
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
    borderRadius: 23.8,
    borderWidth: 1,
    backgroundColor: 'white',
    // overFlow: 'hidden',
  },
  rowTextHeader: {
    ...styleApp.center,
    height: '100%',
    marginLeft: -20,
    position: 'absolute',
    width: width,
  },
});
