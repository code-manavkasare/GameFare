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

class ToolRow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.translateXBox = new Animated.Value(240);
  }
  async componentDidMount() {
    this.props.onRef(this);
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.isButton2Selected !== this.props.isButton2Selected) {
      Animated.parallel([
        Animated.timing(
          this.translateXBox,
          native(this.props.isButton2Selected ? 0 : 240),
        ),
      ]).start();
    }
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
    } = this.props;
    return (
      <View style={styles.tool} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.animatedToolBox,
            {
              transform: [{translateX: this.translateXBox}],
            },
          ]}>
          <Row style={{overflow: 'hidden'}}>
            <Col size={25} style={styleApp.center3}>
              {this.button({
                icon: {
                  name: isButton2Selected ? 'close' : 'keyboard-arrow-left',
                  type: isButton2Selected ? 'mat' : 'mat',
                  color: colors.greyDark,
                  size: isButton2Selected ? 35 : 40,
                },
                // label: 'Select',
                // backgroundColor: colors.white,
                isSelected: isButton2Selected,
                onPressColor: colors.off,
                style: styles.button,
                click: () => clickButton1({forceSelect: true}),
              })}
            </Col>
            <Col size={25} style={styleApp.center3}>
              {this.button({
                icon: {
                  name: 'play',
                  type: 'moon',
                  color: colors.primary,
                  size: 25,
                },
                // label: 'Play',
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
                  name: 'trash-alt',
                  type: 'font',
                  color: colors.primary,
                  size: 25,
                },
                // label: 'Remove',
                buttonDisabled: selectedVideos.length === 0,
                backgroundColor: colors.white,
                isSelected: selectedVideos.length > 0,
                onPressColor: colors.off2,
                style: styles.button,
                click: () => clickButton3(),
              })}
            </Col>
            <Col size={25} style={styleApp.center}>
              {this.button({
                icon: {
                  name: 'share',
                  type: 'moon',
                  color: colors.primary,
                  size: 25,
                },
                buttonDisabled: selectedVideos.length === 0,
                // label: selectedVideos.length > 0 && 'Share',
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
    bottom: heightFooter + marginBottomApp + 10,
    right: 0,
    zIndex: 12,
  },
  animatedToolBox: {
    // borderLeftWidth: 1,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    borderWidth: 1,
    width: 320,
    position: 'absolute',
    height: '100%',
    right: 0,
    borderTopLeftRadius: 35,
    borderBottomLeftRadius: 35,
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
