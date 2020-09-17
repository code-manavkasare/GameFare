import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import PropTypes from 'prop-types';

import {coachAction} from '../../.././../../actions/coachActions';
import {navigate} from '../../../../../../NavigationService';
import PlaceHolder from '../../../../placeHolders/CardStream';

import {
  sessionOpening,
  getMember,
  bindSession,
  unbindSession,
} from '../../../../functions/coach';
import {conversationIsInNotification} from '../../../../functions/notifications.js';
import {
  blueBadge,
  imageCardTeam,
  sessionTitle,
  sessionDate,
  viewLive,
  lastMessage,
} from '../../../TeamPage/components/elements';
import CoachPopups from './StreamView/components/CoachPopups';
import AllIcon from '../../../../layout/icons/AllIcons';
import {native} from '../../../../animations/animations';

import ButtonColor from '../../../../layout/Views/Button';
import Loader from '../../../../layout/loaders/Loader';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {
  bindConversation,
  unbindConversation,
} from '../../../../functions/message';

class CardStream extends Component {
  static propTypes = {
    coachSessionID: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      session: false,
      loading: false,
      hasNotification: false,
    };
    this.selectionIndication = new Animated.Value(0);
  }

  static getDerivedStateFromProps(props, state) {
    return {
      hasNotification: conversationIsInNotification(
        props.coachSessionID,
        props.notifications,
      ),
    };
  }

  componentDidMount = async () => {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    const {coachSessionID, invite, session} = this.props;
    bindSession(coachSessionID);
    bindConversation(coachSessionID);
    if (invite) {
      this.selected = await invite({session, init: true});
    }
    if (this.selected) {
      Animated.timing(this.selectionIndication, native(1, 50)).start();
    }
  };
  componentDidUpdate() {}
  componentWillUnmount() {
    const {coachSessionID} = this.props;
    unbindSession(coachSessionID);
    unbindConversation(coachSessionID);
  }

  async openStream() {
    const {session} = this.props;
    sessionOpening(session);
  }

  loading() {
    return <View>{<Loader size={55} color={colors.greyDark} />}</View>;
  }

  async hangup() {
    const {coachAction} = this.props;
    await coachAction('endCurrentSession');
  }

  toggleSelected(override) {
    let toValue = 0;
    if (override !== undefined) {
      toValue = override;
    }
    Animated.timing(this.selectionIndication, native(toValue, 100)).start(
      () => {
        this.selected = this.selected ? false : true;
      },
    );
  }

  cardStream() {
    const {
      coachSessionID,
      currentSessionID,
      userID,
      session,
      messages,
      clickSideEffect,
      recentView,
      invite,
      style,
      key,
    } = this.props;
    const {hasNotification, loading} = this.state;
    const activeSession = coachSessionID === currentSessionID;

    const animatedReverse = this.selectionIndication.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });

    let member = getMember(session, userID);
    if (!member) {
      member = {};
    }
    const callButtonStyle = {
      position: 'absolute',
      right: 10,
      borderRadius: 25,
      height: 40,
      width: 40,
    };
    const selectionIndicationOverlayStyle = {
      ...styleApp.fullSize,
      ...styleApp.shadowWeak,
      position: 'absolute',
      backgroundColor: colors.white,
      borderRadius: 15,
      borderWidth: 2,
      borderColor: colors.green,
      zIndex: -1,
      opacity: this.selectionIndication,
      height: 85,
      marginTop: 13,
    };
    const callButtonContainerStyle = {
      height: '100%',
      width: 40,
      ...styleApp.center,
      position: 'absolute',
      right: 0,
      opacity: animatedReverse,
      // backgroundColor: colors.green,
    };
    const checkButtonContainerStyle = {
      ...styleApp.center,
      ...styleApp.fullSize,
      right: '10%',
      position: 'absolute',
      opacity: this.selectionIndication,
    };
    if (!session) {
      return <PlaceHolder />;
    }
    return session ? (
      <Animated.View style={styles.card} key={key}>
        <ButtonColor
          color={'transparent'}
          onPressColor={'transparent'}
          click={async () => {
            if (!invite && !clickSideEffect) {
              navigate('Conversation', {coachSessionID: coachSessionID});
              return;
            }
            if (invite) {
              const status = await invite({session, insert: true});
              this.toggleSelected(status);
            }
            if (clickSideEffect) {
              clickSideEffect();
            }
          }}
          style={[styleApp.fullSize, {paddingVertical: 10, ...style}]}
          view={() => {
            return loading ? (
              this.loading()
            ) : (
              <View style={{...styleApp.fullSize, ...styleApp.center}}>
                <Row style={{paddingTop: 5, paddingBottom: 5}}>
                  <Col size={30}>
                    {imageCardTeam(session)}
                    {!recentView &&
                      viewLive(session, {
                        position: 'absolute',
                        left: 10,
                        top: -4,
                      })}
                  </Col>
                  <Col size={55} style={[styleApp.center2, {paddingRight: 6}]}>
                    {sessionTitle(session, {}, false)}
                    {!recentView && lastMessage(messages, hasNotification)}
                  </Col>
                  {!recentView ? (
                    <Col size={15}>
                      {sessionDate({session, messages})}
                      <View style={[styleApp.center, {marginTop: 10}]}>
                        {hasNotification && blueBadge()}
                      </View>
                    </Col>
                  ) : (
                    <Col
                      size={15}
                      style={{...styleApp.center, ...styleApp.fullSize}}>
                      <Animated.View style={checkButtonContainerStyle}>
                        <AllIcon
                          type={'font'}
                          color={colors.green}
                          size={18}
                          name={'check'}
                        />
                      </Animated.View>
                    </Col>
                  )}
                </Row>
              </View>
            );
          }}
        />
        <Animated.View style={selectionIndicationOverlayStyle} />
        {recentView && (
          <Animated.View style={callButtonContainerStyle}>
            <ButtonColor
              color={colors.greyLight}
              onPressColor={colors.grey}
              click={async () => {
                if (invite) {
                  const status = await invite({session, immediatelyOpen: true});
                  this.toggleSelected(status);
                }
                if (clickSideEffect) {
                  clickSideEffect();
                }
              }}
              style={callButtonStyle}
              view={() => {
                return (
                  <AllIcon
                    type={'font'}
                    color={colors.greyDarker}
                    size={16}
                    name={'video'}
                  />
                );
              }}
            />
          </Animated.View>
        )}

        <CoachPopups
          isConnected={member.isConnected && activeSession}
          session={session}
          members={session.members}
          card={true}
          coachSessionID={coachSessionID}
          member={getMember(session, userID)}
          open={this.openStream.bind(this)}
          close={this.hangup.bind(this)}
          onRef={(ref) => (this.coachPopupsRef = ref)}
        />
      </Animated.View>
    ) : null;
  }
  render() {
    return this.cardStream();
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flex: 1,
    minHeight: 100,
    ...styleApp.center,
  },
  button: {
    height: 45,
    width: 45,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 9,
  },
});

const mapStateToProps = (state, props) => {
  const {notifications} = state.user.infoUser;
  return {
    userID: state.user.userID,
    session: state.coachSessions[props.coachSessionID],
    messages: state.conversations[props.coachSessionID],
    currentSessionID: state.coach.currentSessionID,
    userConnected: state.user.userConnected,
    notifications: notifications ? Object.values(notifications) : [],
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(CardStream);
