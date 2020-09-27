import React from 'react';
import {Animated, StyleSheet, View, Text} from 'react-native';
import PropTypes from 'prop-types';
import ButtonColor from '../../../../../layout/Views/Button';
import {Col, Row, Grid} from 'react-native-easy-grid';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';
import AllIcons from '../../../../../layout/icons/AllIcons';

import {heightHeaderHome, marginTopApp} from '../../../../../style/sizes';

export default class RecordingMenu extends React.Component {
  static propTypes = {};
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  button = ({index, backgroundColor, onPressColor, click, text, icon}) => {
    const {name, type, color: colorIcon, size} = icon;
    const style = {
      ...styles.button,
      top: index * 35,
    };
    return (
      <ButtonColor
        color={backgroundColor}
        onPressColor={onPressColor}
        click={click}
        style={style}
        view={() => {
          return (
            <Row style={styleApp.marginView}>
              <Col size={80} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text
                  style={[
                    styleApp.textBold,
                    {color: colors.white, fontSize: 12},
                  ]}>
                  {text}
                </Text>
              </Col>
              <Col size={20} style={styleApp.center}>
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
  render() {
    const {
      previewRecording,
      isEditMode,
      isRecording,
      recordedActions,
      startRecording,
      stopRecording,
      saveReview,
    } = this.props;
    if (!isEditMode) return null;
    return (
      <View style={styles.menu}>
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

        {!isRecording &&
          recordedActions.length > 0 &&
          this.button({
            index: 0,
            backgroundColor: colors.title + '70',
            text: 'Replay',
            onPressColor: colors.grey + '70',
            click: previewRecording,
            icon: {
              name: 'undo-alt',
              type: 'font',
              size: 18,
              color: colors.white,
            },
          })}
        {!isRecording &&
          recordedActions.length > 0 &&
          this.button({
            index: 0,
            backgroundColor: colors.title + '70',
            text: 'Save',
            onPressColor: colors.greyDark + '70',
            click: saveReview,
            icon: {
              name: 'sd-card',
              type: 'font',
              size: 18,
              color: colors.white,
            },
          })}
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
    // backgroundColor: 'red',
    top: heightHeaderHome + marginTopApp,
  },
  button: {
    height: 37,
    width: '100%',
    borderRadius: 20,
    marginBottom: 10,
  },
});
