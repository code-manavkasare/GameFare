import React, {Component} from 'react';
import {Text, StyleSheet, View, Animated} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import colors from '../../../style/colors';
import {marginBottomApp, heightFooter} from '../../../style/sizes';
import ButtonColor from '../../../layout/Views/Button';
import Loader from '../../../layout/loaders/Loader';
import styleApp from '../../../style/style';
import AllIcon from '../../../layout/icons/AllIcons';
import {native} from '../../../animations/animations';
import VideoList from './VideoList';
import sizes from '../../../style/sizes';

const heightFooterFull = sizes.heightFooter + sizes.marginBottomApp;

class ToolRow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.translateXBox = new Animated.Value(0);
    this.translateYBox = new Animated.Value(75 + heightFooterFull);
  }
  async componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.selectedVideos.length !== this.props.selectedVideos.length ||
      prevProps.isButton2Selected !== this.props.isButton2Selected
    ) {
      this.openToolBox(this.props.isButton2Selected);
    }
  };
  openToolBox = (val) => {
    Animated.parallel([
      // Animated.timing(
      //   this.translateXBox,
      //   native(this.props.isButton2Selected ? 0 : 210),
      // ),
      Animated.timing(
        this.translateYBox,
        native(val ? 0 : 75 + heightFooterFull),
      ),
    ]).start();
  };
  button = ({
    icon,
    backgroundColor,
    onPressColor,
    style,
    click,
    label,
    isSelected,
    badge,
    buttonDisabled,
  }) => {
    const {name, size, type, color} = icon;
    return (
      <ButtonColor
        view={() => {
          return (
            <View style={styleApp.center}>
              <AllIcon
                name={name}
                size={size}
                color={isSelected ? color : colors.greyDark}
                type={type}
              />
              {label && (
                <Text
                  style={[
                    styleApp.textBold,
                    styleApp.smallText,
                    {color: isSelected ? color : colors.greyDark, marginTop: 3},
                  ]}>
                  {label} {badge && badge !== 0 ? `(${badge})` : ''}
                </Text>
              )}
            </View>
          );
        }}
        style={style}
        click={() => !buttonDisabled && click()}
        color={backgroundColor}
        onPressColor={onPressColor}
      />
    );
  };

  render() {
    const {
      clickButton2,
      clickButton3,
      clickButton4,
      clickButton1,
      isButton3Selected,
      isButton2Selected,
      selectedVideos,
      selectVideo,
      displayButton0,
      clickButton0,
      position,
    } = this.props;

    // const translateYFooter = position.interpolate({
    //   inputRange: [0, 1],
    //   extrapolate: 'clamp',
    //   outputRange: [0, 100],
    // });

    return (
      <View style={styles.tool} pointerEvents="box-none">
        {isButton2Selected && (
          <VideoList
            selectedVideos={selectedVideos}
            selectVideo={selectVideo}
          />
        )}
        <Animated.View
          style={[
            styles.animatedToolBox,
            {
              transform: [
                {translateX: this.translateXBox},
                {translateY: this.translateYBox},
              ],
            },
          ]}>
          <Row style={{overflow: 'hidden'}}>
            <Col size={25} style={styleApp.center3}>
              {this.button({
                icon: {
                  name: isButton2Selected ? 'close' : 'chevron-left',
                  type: isButton2Selected ? 'mat' : 'font',
                  color: colors.greyDark,
                  size: isButton2Selected ? 20 : 20,
                },

                isSelected: isButton2Selected,
                onPressColor: colors.off,
                style: styles.button,
                click: () => clickButton1({forceSelect: true}),
              })}
            </Col>
            {displayButton0 && (
              <Col size={25} style={styleApp.center3}>
                {this.button({
                  icon: {
                    name: 'play',
                    type: 'moon',
                    color: colors.white,
                    size: 20,
                  },
                  label: 'Share live',
                  backgroundColor: colors.primary,

                  isSelected: selectedVideos.length > 0,
                  buttonDisabled: selectedVideos.length === 0,
                  onPressColor: colors.primaryLight,
                  style: styles.button,
                  click: () => clickButton0({}),
                })}
              </Col>
            )}

            <Col size={25} style={styleApp.center3}>
              {this.button({
                icon: {
                  name: 'play',
                  type: 'moon',
                  color: colors.primary,
                  size: 20,
                },
                label: 'Play',
                backgroundColor: colors.white,

                isSelected: selectedVideos.length > 0,
                buttonDisabled: selectedVideos.length === 0,
                onPressColor: colors.off,
                style: styles.button,
                click: () => clickButton2({forceSelect: true}),
              })}
            </Col>

            <Col size={25} style={styleApp.center}>
              {this.button({
                icon: {
                  name: 'user-plus',
                  type: 'font',
                  color: colors.primary,
                  size: 20,
                },
                buttonDisabled: selectedVideos.length === 0,
                label: 'Share',
                backgroundColor: colors.white,
                isSelected: selectedVideos.length > 0,
                onPressColor: colors.off2,
                style: styles.button,
                click: () => clickButton3({}),
              })}
            </Col>
            <Col size={25} style={styleApp.center}>
              {this.button({
                icon: {
                  name: 'trash-alt',
                  type: 'font',
                  color: colors.primary,
                  size: 20,
                },
                label: 'Remove',
                buttonDisabled: selectedVideos.length === 0,
                backgroundColor: colors.white,
                isSelected: selectedVideos.length > 0,
                onPressColor: colors.off2,
                style: styles.button,
                click: () => clickButton4({}),
              })}
            </Col>
          </Row>
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tool: {
    position: 'absolute',
    height: 75,
    width: '100%',
    ...styleApp.shade,
    bottom: heightFooter + marginBottomApp + 0,
    right: 0,
    zIndex: 12,
  },
  animatedToolBox: {
    // borderLeftWidth: 1,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: '100%',
    position: 'absolute',
    height: '100%',
    right: 0,
    // borderTopLeftRadius: 35,
    // borderBottomLeftRadius: 35,
    borderColor: colors.off,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  button: {
    height: '100%',
    width: '100%',
  },
});

const mapStateToProps = (state, props) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ToolRow);
