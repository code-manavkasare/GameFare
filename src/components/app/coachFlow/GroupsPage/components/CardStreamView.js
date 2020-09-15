import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import PropTypes from 'prop-types';

import {coachAction} from '../../.././../../actions/coachActions';
import {navigate} from '../../../../../../NavigationService';

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
  }

  static getDerivedStateFromProps(props, state) {
    return {
      hasNotification: conversationIsInNotification(
        props.coachSessionID,
        props.notifications,
      ),
    };
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    const {coachSessionID} = this.props;
    bindSession(coachSessionID);
    bindConversation(coachSessionID);
  }

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

  cardStream() {
    const {
      coachSessionID,
      currentSessionID,
      userID,
      session,
      messages,
    } = this.props;
    const {hasNotification, loading} = this.state;
    const activeSession = coachSessionID === currentSessionID;

    let member = getMember(session, userID);
    if (!member) {
      member = {};
    }

    return session ? (
      <Animated.View style={styles.card}>
        <ButtonColor
          color={colors.white}
          onPressColor={colors.off}
          click={() => {
            navigate('Conversation', {coachSessionID: coachSessionID});
          }}
          style={[styleApp.fullSize, {paddingTop: 10, paddingBottom: 10}]}
          view={() => {
            return loading ? (
              this.loading()
            ) : (
              <Row style={{paddingTop: 10, paddingBottom: 10}}>
                <Col size={30}>
                  {imageCardTeam(session)}
                  {viewLive(session, {position: 'absolute', left: 10, top: -4})}
                </Col>
                <Col size={55} style={[styleApp.center2, {paddingRight: 6}]}>
                  {sessionTitle(session, {}, false)}
                  {lastMessage(messages)}
                </Col>
                <Col size={20}>
                  {sessionDate({session, messages})}
                  <View style={[styleApp.center, {marginTop: 10}]}>
                    {hasNotification && blueBadge()}
                  </View>
                </Col>
              </Row>
            );
          }}
        />

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
