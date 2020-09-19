import React, {Component} from 'react';
import {View, Animated, Text, Keyboard} from 'react-native';
import {connect} from 'react-redux';
import ButtonColor from '../../../../layout/Views/Button';
import {Row, Col} from 'react-native-easy-grid';

import {shareVideosWithTeams} from '../../../../functions/videoManagement';
import {navigate} from '../../../../../../NavigationService';
import sizes from '../../../../style/sizes';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import {native} from '../../../../animations/animations';
import AsyncImage from '../../../../layout/image/AsyncImage';
import AllIcon from '../../../../layout/icons/AllIcons';
import {
  createSession,
  sessionOpening,
  updateMembersToSession,
} from '../../../../functions/coach';
import {titleSession} from '../../../TeamPage/components/elements';

class InvitationManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      users: {},
    };
    this.buttonReveal = new Animated.Value(0);
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  componentWillMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow.bind(this),
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide.bind(this),
    );
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  _keyboardWillShow() {
    const {users} = this.state;
    if (Object.keys(users).length > 0) {
      Animated.timing(this.buttonReveal, native(2)).start();
    }
    this.setState({keyboardShown: true});
  }

  _keyboardWillHide() {
    const {users} = this.state;
    if (Object.keys(users).length > 0) {
      Animated.timing(this.buttonReveal, native(1)).start();
    }
    this.setState({keyboardShown: false});
  }

  invite = async (payload) => {
    const {user, init, immediatelyOpen, session} = payload;
    const {keyboardShown} = this.state;
    const {currentSessionID, sharingVideos, actionText} = this.props;
    let {users, selectedSession} = this.state;
    if (this.reseting) {
      return false;
    }
    if (init && session && session?.objectID === selectedSession?.objectID) {
      return true;
    } else if (init && Object.keys(users).includes(user?.objectID)) {
      return true;
    } else if (init) {
      return false;
    }

    if (immediatelyOpen) {
      users = {};
      users[`${user?.objectID}`] = user ? {...user, id: user?.objectID} : {};
      if (session) {
        return sessionOpening(session);
      }
      console.log('\n\n\nUSERS', users);
      await this.setState({users});
      return this.confirmInvite();
    }

    let inserted = false;
    if (session) {
      users = {};
      await this.resetInvitations({resetState: false});
      if (selectedSession?.objectID !== session?.objectID && session?.members) {
        users = {...session?.members};
        selectedSession = session;
        inserted = true;
      } else if (selectedSession?.objectID === session?.objectID) {
        selectedSession = undefined;
        inserted = false;
      }
    } else {
      if (selectedSession) {
        await this.resetInvitations({resetState: false});
        selectedSession = undefined;
        users = {};
      }
      if (Object.keys(users).includes(user?.objectID)) {
        delete users[`${user?.objectID}`];
        inserted = false;
      } else {
        users[`${user?.objectID}`] = {...user, id: user?.objectID};
        inserted = true;
      }
    }
    const prefix = actionText + ' ';
    // ? 'Share with '
    // : !currentSessionID
    // ? 'Call '
    // : 'Invite ';
    const text = selectedSession
      ? prefix + titleSession(session, false, true)
      : Object.keys(users).length === 1
      ? prefix + Object.values(users)[0]?.info?.firstname
      : Object.keys(users).length > 1
      ? prefix + Object.keys(users).length + ' people'
      : this.state.text;
    await this.setState({users, text, selectedSession});
    Animated.timing(
      this.buttonReveal,
      native(Object.keys(users).length < 1 ? 0 : keyboardShown ? 2 : 1),
    ).start();
    return inserted;
  };

  resetInvitations = async (options) => {
    const {resetInvites} = this.props;
    const {resetState} = options;
    const users = {};
    this.reseting = true;
    await Animated.timing(this.buttonReveal, native(0)).start(() => {
      resetState && this.setState({users});
      this.reseting = false;
    });
    if (resetInvites) {
      resetInvites();
    }
  };

  confirmInvite = async () => {
    const {users, selectedSession} = this.state;
    const {dismiss, currentSessionID, sharingVideos, action} = this.props;
    Animated.timing(this.buttonReveal, native(0)).start();
    this.resetInvitations({resetState: true});
    if (action === 'shareVideos' && sharingVideos) {
      const session = selectedSession
        ? selectedSession
        : await createSession(users);
      shareVideosWithTeams(sharingVideos, [session.objectID]);
      navigate('Conversation', {coachSessionID: session.objectID});
    } else if (action === 'message') {
      const session = selectedSession
        ? selectedSession
        : await createSession(users);
      navigate('Conversation', {coachSessionID: session.objectID});
    } else {
      if (!currentSessionID) {
        const session = selectedSession
          ? selectedSession
          : await createSession(users);
        sessionOpening(session);
      } else {
        updateMembersToSession(currentSessionID, users);
      }
    }
    if (dismiss) {
      dismiss();
    }
  };

  button = () => {
    const {text} = this.state;
    const {sharingVideos} = this.props;
    const translateY = this.buttonReveal.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [260, -65, -sizes.keyboardOffset - 5],
    });
    const userCardStyle = {
      flex: 1,
      flexDirection: 'row',
      position: 'absolute',
      bottom: 10 + sizes.marginBottomApp,
      height: 50,
      width: '100%',
      ...styleApp.center1,
      marginBottom: 5,
      transform: [{translateY}],
      zIndex: 100,
    };
    const inviteButtonStyle = {
      ...styleApp.fullSize,
      ...styleApp.shadowWeak,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 15,
      marginLeft: '5%',
      marginRight: '4%',
      width: sizes.width * 0.76,
    };
    const cancelButtonStyle = {
      ...styleApp.shadowWeak,
      borderRadius: 50,
      marginRight: '5%',
      width: 40,
      height: 40,
      marginTop: 5,
    };
    const buttonTextStyle = {
      ...styleApp.textBold,
      color: colors.white,
      marginLeft: 15,
      marginTop: 3,
      fontSize: 17,
    };
    return (
      <Animated.View style={userCardStyle}>
        <ButtonColor
          color={colors.green}
          onPressColor={colors.greenLight}
          style={inviteButtonStyle}
          click={async () => {
            this.confirmInvite();
          }}
          view={() => {
            return (
              <View style={styleApp.fullSize}>
                <Row style={styleApp.center}>
                  <AllIcon
                    type={'font'}
                    color={colors.white}
                    size={18}
                    name={sharingVideos ? 'share' : 'video'}
                  />
                  <Text style={buttonTextStyle}>{text}</Text>
                </Row>
              </View>
            );
          }}
        />
        <ButtonColor
          color={colors.greyLight}
          onPressColor={colors.greyLight}
          style={cancelButtonStyle}
          click={() => {
            this.resetInvitations({resetState: true});
          }}
          view={() => {
            return (
              <View style={styleApp.fullSize}>
                <Row style={styleApp.center}>
                  <AllIcon
                    type={'font'}
                    color={colors.greyDark}
                    size={18}
                    name={'times'}
                  />
                </Row>
              </View>
            );
          }}
        />
      </Animated.View>
    );
  };

  render() {
    return this.button();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(InvitationManager);
