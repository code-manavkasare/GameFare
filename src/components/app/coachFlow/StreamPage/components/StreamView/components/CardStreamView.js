import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';

import {width, heightCardSession} from '../../../../../../style/sizes';
import {navigate} from '../../../../../../../../NavigationService';
import AllIcons from '../../../../../../layout/icons/AllIcons';
import ButtonColor from '../../../../../../layout/Views/Button';
import colors from '../../../../../../style/colors';
import styleApp from '../../../../../../style/style';
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
        color={colors.blue}
        onPressColor={colors.blueLight}
        click={() => this.deleteSession()}
        style={styles.button}
        view={() => {
          return (
            <AllIcons
              name="trash-alt"
              size={15}
              color={colors.white}
              type="font"
            />
          );
        }}
      />
    );
  }
  cardStream() {
    const {isConnected, open, coachSession, coachSessionID} = this.props;
    const backgroundColor = isConnected ? colors.off + '0' : colors.off + '70';
    return (
      <TouchableOpacity
        onPress={() => open(true)}
        activeOpacity={1}
        style={[
          styles.card,
          {
            backgroundColor: backgroundColor,
            borderColor: isConnected ? colors.greenConfirm : colors.white,
          },
        ]}>
        <MembersView session={coachSession} card={true} />
        <View style={styleApp.fullSize}>
          {!isConnected && (
            <View style={[styleApp.fullSize, styleApp.center]}>
              <Text style={[styleApp.text, {color: colors.white}]}>
                {/* Disconnected {coachSessionID} */}
                Disconnected
              </Text>
            </View>
          )}
          <Row style={styles.rowTools}>
            <Col size={20} style={styleApp.center2}>
              {this.buttonDelete()}
            </Col>
            {isConnected && (
              <Col size={20} style={styleApp.center3}>
                {this.buttonEndCall()}
              </Col>
            )}
          </Row>
        </View>
      </TouchableOpacity>
    );
  }
  render() {
    return this.cardStream();
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 3,
    position: 'relative',
    height: heightCardSession,
    width: width / 2 - 30,
    borderColor: colors.off,
    overflow: 'hidden',
    borderRadius: 5,
  },
  rowTools: {
    paddingLeft: 10,
    // backgroundColor: colors.green + '60',
    height: 65,
    position: 'absolute',
    width: '100%',
    // borderTopWidth: 1,
    borderColor: colors.off,
    paddingRight: 10,
    bottom: 0,
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
