import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';
import PropTypes from 'prop-types';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {generateID} from '../../../../../../../functions/utility.js';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

export default class AddFlagButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  addFlag = () => {
    const {coachSessionID, member} = this.props;
    const flagID = generateID();
    let updates = {};
    updates[
      `coachSessions/${coachSessionID}/members/${
        member.id
      }/recording/flags/${flagID}/id`
    ] = flagID;
    updates[
      `coachSessions/${coachSessionID}/members/${
        member.id
      }/recording/flags/${flagID}/time`
    ] = Date.now() - member.recording.startTimestamp;

    database()
      .ref()
      .update(updates);
  };

  numberFlags = (props) => {
    const {member} = props;
    const {recording} = member;
    if (!recording?.flags) return false;
    return Object.values(recording.flags).filter((f) => f?.id !== undefined)
      .length;
  };

  buttonAddFlag() {
    const {recording} = this.props.member;
    const numberFlags = this.numberFlags(this.props);
    if (!recording?.isRecording || !recording?.startTimestamp)
      return <Col size={10} />;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              {numberFlags && recording.isRecording ? (
                <Col size={30} style={styleApp.center3}>
                  <Text style={[styleApp.textBold, {fontSize: 13}]}>
                    {numberFlags}
                  </Text>
                </Col>
              ) : null}

              <Col size={60} style={styleApp.center}>
                <AllIcons
                  name="flag"
                  size={20}
                  color={colors.title}
                  type="font"
                />
                <View
                  style={[
                    styles.plusIcon,
                    {
                      right: numberFlags ? 2 : 6,
                    },
                  ]}>
                  <AllIcons
                    name="plus"
                    size={7}
                    color={colors.title}
                    type="font"
                  />
                </View>
              </Col>
            </Row>
          );
        }}
        click={() => this.addFlag()}
        color={colors.white}
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }

  render() {
    return this.buttonAddFlag();
  }
}

const styles = StyleSheet.create({
  button: {
    height: 55,
    width: 55,
    borderRadius: 30,
    borderWidth: 0,
    borderColor: colors.off,
  },
  plusIcon: {
    ...styleApp.center,

    position: 'absolute',
    top: 6,

    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: colors.off,
  },
});

AddFlagButton.propTypes = {
  member: PropTypes.object,
  coachSessionID: PropTypes.string,
};
