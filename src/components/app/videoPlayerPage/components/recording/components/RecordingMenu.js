import React from 'react';
import {Animated, StyleSheet, View, Text} from 'react-native';
import ButtonColor from '../../../../../layout/Views/Button';
import {Col, Row, Grid} from 'react-native-easy-grid';

import {navigate} from '../../../../../../../NavigationService';
import {store} from '../../../../../../store/reduxStore';
import {boolShouldComponentUpdate} from '../../../../../functions/redux';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import AllIcons from '../../../../../layout/icons/AllIcons';

import {heightHeaderHome, marginTopApp} from '../../../../../style/sizes';

export default class RecordingMenu extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.state = {
      isMicrophoneMuted: false,
      isMicrophoneMutedLastValue: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount = () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  };
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'RecordingMenu',
    });
  }
  getState = () => {
    return this.state;
  };
  button = ({
    index,
    backgroundColor,
    onPressColor,
    click,
    text,
    icon,
    width,
  }) => {
    const {name, type, color: colorIcon, size} = icon;
    const style = {
      ...styles.button,
    };
    return (
      <ButtonColor
        color={backgroundColor}
        onPressColor={onPressColor}
        click={click}
        style={[style, width]}
        view={() => {
          return (
            <Row style={styleApp.marginView}>
              {text ? (
                <Col size={75} style={[styleApp.center3, {paddingLeft: 10}]}>
                  <Text
                    style={[
                      styleApp.textBold,
                      {color: colors.white, fontSize: 12},
                    ]}>
                    {text}
                  </Text>
                </Col>
              ) : null}
              <Col size={25} style={styleApp.center}>
                <AllIcons
                  solid
                  name={name}
                  size={size}
                  color={colorIcon}
                  type={type}
                />
              </Col>
              <Col />
            </Row>
          );
        }}
      />
    );
  };
  clickSaveReview = () => {
    const {saveReview} = this.props;
    const {userConnected} = store.getState().user;
    if (!userConnected) return navigate('SignIn');
    return saveReview();
  };
  render() {
    const {
      isEditMode,
      isRecording,
      recordedActions,
      startRecording,
      stopRecording,
    } = this.props;
    const {isMicrophoneMuted} = this.state;
    if (!isEditMode) return null;
    return (
      <View style={[styles.menu, styleApp.center3]}>
        {this.button({
          index: 0,
          backgroundColor: isRecording ? colors.red : colors.green,
          onPressColor: isRecording ? colors.redLight : colors.greenLight,
          click: isRecording ? stopRecording : startRecording,
          text: isRecording ? 'Stop Recording' : 'Start Recording',
          icon: {
            name: 'microphone-alt',
            type: 'font',
            size: 18,
            color: colors.white,
          },
        })}

        {this.button({
          index: 1,
          backgroundColor: isMicrophoneMuted ? colors.red : colors.green,
          width: {width: 40, position: 'absolute', right: 160, top: -0},
          onPressColor: isMicrophoneMuted ? colors.redLight : colors.greenLight,
          click: () => {
            if (isRecording) return;
            this.setState({isMicrophoneMuted: !isMicrophoneMuted});
          },
          icon: {
            name: isMicrophoneMuted ? 'microphone-slash' : 'microphone',
            type: 'font',
            size: 18,
            color: colors.white,
          },
        })}

        {!isRecording && recordedActions.length > 0
          ? this.button({
              index: 2,
              backgroundColor: colors.title + '70',
              text: 'Save',
              onPressColor: colors.greyDark + '70',
              click: this.clickSaveReview,
              icon: {
                name: 'sd-card',
                type: 'font',
                size: 18,
                color: colors.white,
              },
            })
          : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    zIndex: 20,
    flex: 1,
    width: 150,
    right: '5%',
    top: heightHeaderHome + marginTopApp + 10,
  },
  button: {
    height: 40,
    width: '100%',
    borderRadius: 20,
    marginBottom: 10,
  },
});
