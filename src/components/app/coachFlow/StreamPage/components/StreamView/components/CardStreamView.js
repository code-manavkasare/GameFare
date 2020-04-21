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
import ImageUser from '../../../../../../layout/image/ImageUser';

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
              color={colors.greyDark}
              type="font"
            />
          );
        }}
      />
    );
  }
  viewLive() {
    const styleViewLive = {
      position: 'absolute',
      top: 0,
      right: '0%',
      height: 20,
      width: 40,
      ...styleApp.center,
      backgroundColor: colors.red,
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
    };
    return (
      <View style={styleViewLive}>
        <Text style={[styleApp.text, {color: colors.white, fontSize: 10}]}>
          Live
        </Text>
      </View>
    );
  }
  viewMembers() {
    const styleRow = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      //   backgroundColor: 'red',
      flex: 1,
    };
    const sizeImg = 40;
    const styleCol = {
      paddingRight: 3,
    };
    const styleVoile = {
      position: 'absolute',
      zIndex: 10,
      borderRadius: sizeImg / 2,
      height: sizeImg,
      width: sizeImg,
    };
    const {userID, coachSession} = this.props;
    if (!coachSession) return null;
    if (!coachSession.members) return null;
    const members = Object.values(coachSession.members).filter(
      (member) => member.id !== userID,
    );
    return (
      <View style={styleRow}>
        {members.length === 0 ? (
          <Text
            style={[
              styleApp.text,
              {color: colors.greyDark, fontSize: 13, marginTop: 5},
            ]}>
            No one else is part of this room.
          </Text>
        ) : (
          members.map((member, i) => {
            const opacityVoile = member.isConnected ? '00' : '90';
            const styleVoileApply = {
              ...styleVoile,
              borderWidth: member.isConnected ? 3 : 2,
              borderColor: member.isConnected
                ? colors.greenConfirm
                : colors.grey,
              backgroundColor: colors.off + opacityVoile,
            };
            return (
              <View style={styleCol} key={member.id}>
                <View style={styleVoileApply} />
                <ImageUser
                  key={member.id}
                  user={member}
                  styleImgProps={{
                    height: sizeImg,
                    width: sizeImg,
                  }}
                />
              </View>
            );
          })
        )}
      </View>
    );
  }
  cardStream() {
    const {isConnected, open, currentScreenSize, timestamp} = this.props;
    const {currentWidth} = currentScreenSize;
    const backgroundColor = isConnected
      ? colors.white + '0'
      : colors.white + '0';
    const dateFormat = new Date(timestamp).toString();
    return (
      <TouchableOpacity
        onPress={() => open(true)}
        activeOpacity={1}
        style={styles.card}>
        <View style={[styleApp.divider2]} />
        <Row>
          {isConnected && this.viewLive()}
          <Col size={70}>
            <Text
              style={[
                styleApp.text,
                {fontSize: 13, marginTop: 10, marginBottom: 10},
              ]}>
              {date(dateFormat)} at {time(dateFormat)}
            </Text>

            {this.viewMembers()}
          </Col>
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
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    paddingRight: '5%',
    paddingLeft: '5%',
    // backgroundColor: 'red',
    height: heightCardSession,
  },
  divider: {
    height: 1,
    backgroundColor: colors.off,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 20,
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
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {},
)(CardStream);
