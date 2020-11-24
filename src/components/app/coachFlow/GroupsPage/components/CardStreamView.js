import React, {Component} from 'react';
import {View, StyleSheet, Animated, InteractionManager} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import PropTypes from 'prop-types';

import {navigate} from '../../../../../../NavigationService';
import PlaceHolder from '../../../../placeHolders/CardStream';
import {logMixpanel} from '../../../../functions/logs';
import {boolShouldComponentUpdate} from '../../../../functions/redux';

import {sessionOpening} from '../../../../functions/coach';
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
import {
  bindSession,
  bindConversation,
} from '../../../../database/firebase/bindings';
import AllIcon from '../../../../layout/icons/AllIcons';

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
  componentDidMount = async () => {
    this.bindSession();
  };
  bindSession() {
    InteractionManager.runAfterInteractions(async () => {
      const {coachSessionID} = this.props;
      bindSession(coachSessionID);
      bindConversation(coachSessionID);
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardStreamView',
    });
  }

  loading() {
    return <View>{<Loader size={55} color={colors.greyDark} />}</View>;
  }
  buttonCard({style}) {
    const {
      coachSessionID,
      session,
      conversation,
      recentView,
      onClick,
      key,
      selected,
      notifications,
      unselectable,
    } = this.props;

    const checkButtonContainerStyle = {
      ...styleApp.center,
      ...styleApp.fullSize,
      right: '10%',
      position: 'absolute',
      opacity: this.selectionIndication,
    };
    const hasNotification = conversationIsInNotification(
      coachSessionID,
      notifications,
    );
    return (
      <ButtonColor
        click={() => {
          logMixpanel({
            label: 'Click session ' + coachSessionID,
            params: {coachSessionID},
          });
          if (onClick) {
            onClick(session);
          } else {
            navigate('Conversation', {coachSessionID: coachSessionID});
          }
        }}
        color={colors.white}
        onPressColor={colors.off}
        style={[
          styleApp.fullSize,
          {
            paddingVertical: 0,
            ...style,
            width: '100%',
            borderWidth: selected ? 2 : 0,
            borderColor: unselectable ? colors.off : colors.green,
          },
        ]}
        view={() =>
          !session ? (
            <PlaceHolder />
          ) : (
            <View style={{...styleApp.fullSize, ...styleApp.center}}>
              <Row style={{paddingTop: 5, paddingBottom: 5}}>
                <Col size={30}>
                  {imageCardTeam(session)}
                  {!recentView
                    ? viewLive(session, {
                        position: 'absolute',
                        left: 10,
                        top: -4,
                      })
                    : null}
                </Col>
                <Col size={50} style={[styleApp.center2, {paddingRight: 6}]}>
                  {sessionTitle(session, {}, false)}
                  {!recentView
                    ? lastMessage(conversation?.messages, hasNotification)
                    : null}
                </Col>
                {!recentView ? (
                  <Col size={20} style={styleApp.center}>
                    <View style={[styleApp.center, {marginTop: 0}]}>
                      {hasNotification
                        ? blueBadge()
                        : sessionDate({
                            session,
                            messages: conversation?.messages,
                          })}
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
          )
        }
      />
    );
  }

  cardStream() {
    const {
      coachSessionID,
      currentSessionID,
      session,
      recentView,
      showCallButton,
      showAddMemberButton,
      key,
      selected,
      style,
    } = this.props;

    const animatedReverse = this.selectionIndication.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    const callButtonContainerStyle = {
      height: '100%',
      width: 40,
      ...styleApp.center,
      position: 'absolute',
      right: 0,
      opacity: animatedReverse,
    };

    if (!session) return <PlaceHolder />;
    return (
      <Animated.View style={styles.card} key={key}>
        {this.buttonCard({style})}
        {recentView && showCallButton ? (
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
        ) : null}
        {recentView && showAddMemberButton ? (
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
        ) : null}
      </Animated.View>
    );
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
  return {
    userID: state.user.userID,
    session: state.coachSessions[props.coachSessionID],
    conversation: state.conversations[props.coachSessionID],
    currentSessionID: state.coach.currentSessionID,
    notifications: state.user.infoUser.notifications,
  };
};

export default connect(
  mapStateToProps,
  {},
)(CardStream);
