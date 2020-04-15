import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';

import {
  width,
  heightCardSession,
  widthCardSession,
} from '../../../../../../style/sizes';
import {navigate} from '../../../../../../../../NavigationService';
import AllIcons from '../../../../../../layout/icons/AllIcons';
import ButtonColor from '../../../../../../layout/Views/Button';
import colors from '../../../../../../style/colors';
import styleApp from '../../../../../../style/style';
import {date, time} from '../../../../../../layout/date/date';
import MembersView from './MembersView';

class CardStream extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  deleteSession = (objectID) => {
    const {userID, coachSessionID} = this.props;
    navigate('Alert', {
      title: 'Do you want to delete this session?',
      textButton: 'Delete',
      onGoBack: async () => {
        let updates = {};
        console.log('delete user from', coachSessionID);
        updates[`users/${userID}/coachSessions/${coachSessionID}`] = null;
        updates[`coachSessions/${coachSessionID}/members/${userID}`] = null;
        updates[`coachSessions/${coachSessionID}/allMembers/${userID}`] = null;
        console.log('updates', updates);
        await firebase
          .database()
          .ref()
          .update(updates);

        return true;
      },
    });
  };
  buttonEndCall() {
    const {endCoachSession} = this.props;
    return (
      <ButtonColor
        color={colors.red}
        onPressColor={colors.redLight}
        click={() => endCoachSession()}
        style={styles.button}
        view={() => {
          return (
            <Image
              source={require('../../../../../../../img/icons/endCall.png')}
              style={{width: 17, height: 17}}
            />
          );
        }}
      />
    );
  }
  buttonDelete() {
    return (
      <ButtonColor
        // color={colors.blue}
        onPressColor={colors.blueLight}
        click={() => this.deleteSession()}
        style={styles.button}
        view={() => {
          return (
            <AllIcons
              name="trash-alt"
              size={15}
              color={colors.title}
              type="font"
            />
          );
        }}
      />
    );
  }
  cardStream() {
    const {
      isConnected,
      open,
      coachSession,
      coachSessionID,
      timestamp,
    } = this.props;
    const backgroundColor = isConnected
      ? colors.white + '0'
      : colors.white + '0';
    const dateFormat = new Date(timestamp).toString();
    return (
      <TouchableOpacity
        onPress={() => open(true)}
        activeOpacity={1}
        style={[
          styles.card,
          {
            backgroundColor: backgroundColor,
            borderColor: colors.off,
          },
        ]}>
        <Row style={styles.rowTools}>
          <Col size={40} style={styleApp.center2}>
            <Text style={[styleApp.text, {fontSize: 13}]}>
              {date(dateFormat)} at {time(dateFormat)}
            </Text>

            <Text
              style={[
                styleApp.text,
                {color: colors.greyDark, fontSize: 13, marginTop: 5},
              ]}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>

            <MembersView session={coachSession} card={true} />
          </Col>
          <Col size={30} />
          {isConnected ? (
            <Col size={15} style={styleApp.center3}>
              {this.buttonEndCall()}
            </Col>
          ) : (
            <Col size={15} />
          )}
          <Col size={15} style={styleApp.center3}>
            {this.buttonDelete()}
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
  render() {
    return this.cardStream();
  }
}

const styles = StyleSheet.create({
  card: {
    //   borderTopWidth: 1,
    //  borderBottomWidth: 1,
    position: 'absolute',
    borderTopWidth: 1,
    zIndex: -1,
    height: heightCardSession,
    width: widthCardSession,
    borderColor: colors.off,
    //  backgroundColor: 'red',
    // overflow: 'hidden',
  },
  rowTools: {
    paddingRight: 20,

    paddingLeft: 20,
  },
  button: {
    ...styleApp.center,
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(CardStream);
