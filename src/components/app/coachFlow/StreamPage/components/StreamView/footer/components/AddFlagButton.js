import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import ButtonColor from '../../../../../../../layout/Views/Button';
import {generateID} from '../../../../../../../functions/createEvent';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class AddFlagButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  addFlag = async () => {
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

    await database()
      .ref()
      .update(updates);
  };

  numberFlags = (props) => {
    const {member} = props;
    const {recording} = member;
    if (!recording?.flags) return false;
    return Object.values(recording.flags).length;
  };

  buttonAddFlag() {
    const {member} = this.props;
    const {recording} = member;
    const numberFlags = this.numberFlags(this.props);
    if (!recording?.isRecording) return <Col size={10} />;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              {numberFlags && recording.isRecording && (
                <Col size={30} style={styleApp.center3}>
                  <Text style={[styleApp.textBold, {fontSize: 13}]}>
                    {numberFlags}
                  </Text>
                </Col>
              )}

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
    // backgroundColor: colors.white,
  },
});

AddFlagButton.propTypes = {
  member: PropTypes.object,
  coachSessionID: PropTypes.string,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(AddFlagButton);
