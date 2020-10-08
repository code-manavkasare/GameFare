import React, {Component} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import PropTypes from 'prop-types';

import {coachAction} from '../../../../../actions/coachActions';
import {coachSessionsAction} from '../../../../../actions/coachSessionsActions';
import {conversationsAction} from '../../../../../actions/conversationsActions';

import {navigate} from '../../../../../../NavigationService';
import PlaceHolder from '../../../../placeHolders/CardStream';

import {sessionOpening, getMember} from '../../../../functions/coach';
import {conversationIsInNotification} from '../../../../functions/notifications.js';
import {createInviteToSessionBranchUrl} from '../../../../database/branch';

import {
  blueBadge,
  imageCardTeam,
  sessionTitle,
  sessionDate,
  viewLive,
  lastMessage,
} from '../../../TeamPage/components/elements';
// import CoachPopups from './StreamView/components/CoachPopups';
import AllIcon from '../../../../layout/icons/AllIcons';
import {native} from '../../../../animations/animations';

import ButtonColor from '../../../../layout/Views/Button';
import Loader from '../../../../layout/loaders/Loader';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

class CardStream extends Component {
  static propTypes = {
    coachSessionID: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    selected: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      bound: false,
      loading: false,
      hasNotification: false,
    };
    this.selectionIndication = new Animated.Value(0);
  }

  _defaultClick() {
    const {coachSessionID} = this.props;
    navigate('Conversation', {coachSessionID});
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
    const {onRef} = this.props;
    onRef && onRef(this);
    this.bindSession();
    if (this.selected) {
      this.toggleSelected(1);
    }
  };
  componentDidUpdate(prevProps) {
    const {selected} = this.props;
    if (selected !== prevProps.selected) {
      this.toggleSelected(selected ? 1 : 0);
    }
  }
  componentWillUnmount() {
    this.unbindSession();
  }

  bindSession() {
    const {
      coachSessionID,
      coachSessionsAction,
      conversationsAction,
    } = this.props;
    coachSessionsAction('bindSession', coachSessionID);
    conversationsAction('bindConversation', coachSessionID);
  }

  unbindSession() {
    const {
      coachSessionID,
      coachSessionsAction,
      conversationsAction,
    } = this.props;
    coachSessionsAction('unbindSession', coachSessionID);
    conversationsAction('unbindConversation', coachSessionID);
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
    const toValue = override ?? 0;
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
      recentView,
      onClick,
      showCallButton,
      showAddMemberButton,
      style,
      key,
    } = this.props;
    const {hasNotification, loading} = this.state;
    const activeSession = coachSessionID === currentSessionID;
    const animatedReverse = this.selectionIndication.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    const member = getMember(session, userID) ?? {};
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
    return session ? (
      <Animated.View style={styles.card} key={key}>
        <ButtonColor
          color={'transparent'}
          onPressColor={'transparent'}
          click={() => {
            if (onClick) {
              onClick(session);
            } else {
              navigate('Conversation', {coachSessionID: coachSessionID});
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
                  <Col size={50} style={[styleApp.center2, {paddingRight: 6}]}>
                    {sessionTitle(session, {}, false)}
                    {!recentView && lastMessage(messages, hasNotification)}
                  </Col>
                  {!recentView ? (
                    <Col size={20} style={styleApp.center}>
                      <View style={[styleApp.center, {marginTop: 0}]}>
                        {hasNotification
                          ? blueBadge()
                          : sessionDate({session, messages})}
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
        {recentView && showCallButton && (
          <Animated.View style={callButtonContainerStyle}>
            <ButtonColor
              color={colors.greyLight}
              onPressColor={colors.grey}
              onRef={(ref) => {
                this.quickCallButtonRef = ref;
              }}
              click={async () => {
                this.quickCallButtonRef?.setLoading(true);
                setTimeout(async () => {
                  await sessionOpening(session);
                  this.quickCallButtonRef?.setLoading(false);
                }, 50);
              }}
              style={styles.callButtonStyle}
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
        {recentView && showAddMemberButton && (
          <Animated.View style={callButtonContainerStyle}>
            <ButtonColor
              color={colors.greyLight}
              onPressColor={colors.grey}
              click={async () =>
                navigate('UserDirectory', {
                  action: 'invite',
                  sessionToInvite:
                    currentSessionID === coachSessionID
                      ? undefined
                      : coachSessionID,
                  branchLink: await createInviteToSessionBranchUrl(
                    coachSessionID,
                  ),
                })
              }
              style={styles.callButtonStyle}
              view={() => {
                return (
                  <AllIcon
                    type={'font'}
                    color={colors.greyDarker}
                    size={16}
                    name={'user-plus'}
                  />
                );
              }}
            />
          </Animated.View>
        )}
        {/* 
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
        /> */}
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
  callButtonStyle: {
    position: 'absolute',
    right: 10,
    borderRadius: 25,
    height: 40,
    width: 40,
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
  {coachAction, coachSessionsAction, conversationsAction},
)(CardStream);
