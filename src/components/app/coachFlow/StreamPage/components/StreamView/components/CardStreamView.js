import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import {heightCardSession} from '../../../../../../style/sizes';
import {navigate} from '../../../../../../../../NavigationService';
import AllIcons from '../../../../../../layout/icons/AllIcons';
import ButtonColor from '../../../../../../layout/Views/Button';
import colors from '../../../../../../style/colors';
import styleApp from '../../../../../../style/style';
import {date, time} from '../../../../../../layout/date/date';
import ImageUser from '../../../../../../layout/image/ImageUser';
import {timeout} from '../../../../../../functions/coach';
import {TouchableOpacity} from 'react-native-gesture-handler';

class CardStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clickEnabled: true,
    };
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
        database()
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
    const styleText = {...styleApp.text, color: colors.white, fontSize: 10};
    return (
      <View style={styleViewLive}>
        <Text style={styleText}>Live</Text>
      </View>
    );
  }
  viewMembers() {
    const styleRow = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
    };
    const sizeImg = 40;
    const styleText = {...styleApp.text, color: colors.greyDark, fontSize: 13};
    const {userID, coachSession} = this.props;
    if (!coachSession) return null;
    if (!coachSession.members) return null;
    const members = Object.values(coachSession.members).filter(
      (member) => member.id !== userID,
    );
    return (
      <View style={styleRow}>
        {members.length === 0 ? (
          <Text style={styleText}>No one else is part of this room.</Text>
        ) : (
          members.map((member, i) => {
            const styleImg = {
              height: sizeImg,
              width: sizeImg,
              opacity: member.isConnected ? 1 : 0.7,
            };
            const styleImgContainer = {
              height: 40,
              width: 40,
              ...styleApp.center2,
            };
            return (
              <View key={member.id} style={styleImgContainer}>
                <ImageUser
                  key={member.id}
                  user={member}
                  styleImgProps={styleImg}
                />
              </View>
            );
          })
        )}
      </View>
    );
  }
  cardStream() {
    const {
      isConnected,
      open,
      currentScreenSize,
      timestamp,
      opacityCard,
      translateXCard,
      sessionInfo,
      coachSessionID,
      coordinates,
    } = this.props;
    const {clickEnabled} = this.state;

    const dateFormat = new Date(timestamp).toString();
    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: opacityCard,
            top: coordinates.y,
            transform: [{translateX: translateXCard}],
          },
        ]}>
        <ButtonColor
          color={colors.white}
          onPressColor={colors.off}
          click={() => {
            if (clickEnabled) open(true);
            else this.setState({clickEnabled: true});
          }}
          style={[styleApp.fullSize, styleApp.marginView]}
          view={() => {
            return (
              <Row>
                {isConnected && this.viewLive()}
                <Col size={55}>
                  <Text
                    style={[
                      styleApp.text,
                      {fontSize: 14, marginTop: 15, marginBottom: 5},
                    ]}>
                    {date(dateFormat)} at {time(dateFormat)}
                  </Text>

                  {this.viewMembers()}
                </Col>
                {isConnected ? (
                  <Col size={20} style={styleApp.center3}>
                    {this.buttonEndCall()}
                  </Col>
                ) : (
                  <Col size={20} />
                )}
                <Col size={15} style={styleApp.center3}>
                  {this.buttonDelete()}
                </Col>
                <Col size={10} style={styleApp.center3}>
                  <AllIcons
                    name="keyboard-arrow-right"
                    type="mat"
                    color={colors.grey}
                    size={15}
                  />
                </Col>
              </Row>
            );
          }}
        />
      </Animated.View>
    );
  }
  render() {
    return this.cardStream();
  }
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.off,
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
