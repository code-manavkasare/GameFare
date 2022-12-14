import React, {Component} from 'react';
import {View, Animated, Text, Keyboard, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import isEqual from 'lodash.isequal';

import {navigate, goBack} from '../../../NavigationService';

import {marginBottomApp, keyboardOffset, width} from '../style/sizes';
import styleApp from '../style/style';
import colors from '../style/colors';

import {native} from '../animations/animations';

import {userObject} from '../functions/users';
import {
  openSession,
  sessionOpening,
  addMembersToSession,
  timeout,
} from '../functions/coach';
import {shareVideosWithTeams} from '../functions/videoManagement';
import {getSelectionActionDecorations} from '../functions/utility';

import AllIcon from '../layout/icons/AllIcons';
import ButtonColor from '../layout/Views/Button';

import {titleSession} from '../app/TeamPage/components/elements';
import {
  userConnectedSelector,
  userIDSelector,
  userInfoSelector,
} from '../../store/selectors/user';
import {currentSessionIDSelector} from '../../store/selectors/sessions';

class InvitationManager extends Component {
  static propTypes = {
    action: PropTypes.string.isRequired,
    selectedSessions: PropTypes.object.isRequired,
    selectedUsers: PropTypes.object.isRequired,
    archivesToShare: PropTypes.array,
    sessionToInvite: PropTypes.string,
    onClearInvites: PropTypes.func,
    onConfirmInvites: PropTypes.func,
  };

  static defaultProps = {
    action: 'call',
    selectedSessions: {},
    selectedUsers: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      buttonText: '',
      keyboardVisible: false,
      animationState: 0,
    };
    this.buttonReveal = new Animated.Value(0);
    this.keyboardWillShowListener = null;
    this.keyboardWillHideListener = null;
  }

  _keyboardWillShow() {
    this.setState({keyboardVisible: true});
  }

  _keyboardWillHide() {
    this.setState({keyboardVisible: false});
  }

  componentDidMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow.bind(this),
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide.bind(this),
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const {selectedSessions, selectedUsers} = this.props;
    const {
      selectedSessions: prevSelectedSessions,
      selectedUsers: prevSelectedUsers,
    } = prevProps;
    const {keyboardVisible, animationState} = this.state;
    const {keyboardVisible: prevKeyboardVisible} = prevState;
    const numSessions = Object.keys(selectedSessions).length;
    const numUsers = Object.keys(selectedUsers).length;
    const someSelected = numSessions > 0 || numUsers > 0;
    const needToShowButton = animationState === 0 && someSelected;
    const needToHideButton =
      animationState > 0 && numSessions === 0 && numUsers === 0;
    const invitesChanged =
      !isEqual(selectedSessions, prevSelectedSessions) ||
      !isEqual(selectedUsers, prevSelectedUsers);
    if (needToShowButton) {
      this.showButton(keyboardVisible);
    } else if (needToHideButton) {
      this.hideButton();
    } else if (prevKeyboardVisible !== keyboardVisible && someSelected) {
      this.showButton(keyboardVisible);
    }
    if (invitesChanged) {
      this.updateText();
    }
  }

  componentWillUnmount() {
    Keyboard.removeListener('keyboardWillShow');
    Keyboard.removeListener(
      'keyboardWillHide',
      this._keyboardWillHide.bind(this),
    );
  }

  hideButton() {
    Animated.timing(this.buttonReveal, native(0)).start(() =>
      this.setState({animationState: 0}),
    );
  }

  showButton(keyboard) {
    const to = keyboard ? 2 : 1;
    Animated.timing(this.buttonReveal, native(to)).start(() =>
      this.setState({animationState: to}),
    );
  }

  getSessionText(sessionArray) {
    const {action} = this.props;
    const {actionText} = getSelectionActionDecorations(action);
    const firstSession = sessionArray[0];
    if (sessionArray.length === 1) {
      return `${actionText} ${titleSession(firstSession, 20, true)}`;
    } else {
      return `${actionText} ${sessionArray.length} groups`;
    }
  }

  getUserText(userArray) {
    const {action} = this.props;
    const {actionText} = getSelectionActionDecorations(action);
    const firstUser = userArray[0];
    if (userArray.length === 1) {
      return `${actionText} ${firstUser.info.firstname ??
        firstUser.info.title}`;
    } else {
      return `${actionText} ${firstUser.info.firstname ??
        firstUser.info.title} and ${userArray.length - 1} others`;
    }
  }

  updateText() {
    const {selectedSessions, selectedUsers} = this.props;
    const sessionArray = Object.values(selectedSessions);
    const userArray = Object.values(selectedUsers);
    if (sessionArray.length > 0) {
      const buttonText = this.getSessionText(sessionArray);
      this.setState({buttonText});
    } else if (userArray.length > 0) {
      const buttonText = this.getUserText(userArray);
      this.setState({buttonText});
    }
  }

  clearInvites = async () => {
    const {onClearInvites} = this.props;
    onClearInvites && onClearInvites();
    this.hideButton();
  };

  confirmUserInvites = async () => {
    const {
      selectedUsers,
      userID,
      archivesToShare,
      sessionToInvite,
      currentSessionID,
      action,
    } = this.props;
    if (action === 'invite') {
      if (sessionToInvite && sessionToInvite !== '') {
        await addMembersToSession(sessionToInvite, selectedUsers);
        navigate('Conversation', {id: sessionToInvite});
      } else if (currentSessionID && currentSessionID !== '') {
        await addMembersToSession(currentSessionID, selectedUsers);
        navigate('Session');
      } else {
        console.log(
          'ERROR InvitationManager, action is "invite" but empty/no prop "sessionToInvite" provided and no currentSessionID',
        );
      }
    } else {
      const session = await openSession(userObject(userID), selectedUsers);
      if (action === 'shareArchives') {
        if (archivesToShare && archivesToShare.length > 0) {
          shareVideosWithTeams(archivesToShare, [session.objectID]);
          navigate('Conversation', {id: session.objectID});
        } else {
          console.log(
            'ERROR InvitationManager, action is "shareVideos" but empty/no prop "archivesToShare" provided',
          );
        }
      } else if (action === 'message') {
        navigate('Conversation', {id: session.objectID});
      } else if (action === 'call') {
        sessionOpening(session);
      }
    }
  };

  confirmSessionInvites = async () => {
    const {
      selectedSessions,
      archivesToShare,
      sessionToInvite,
      action,
    } = this.props;
    const sessionIDs = Object.keys(selectedSessions);
    if (action === 'shareArchives') {
      if (archivesToShare && archivesToShare.length > 0) {
        shareVideosWithTeams(archivesToShare, sessionIDs);
        if (sessionIDs.length === 1) {
          await goBack();
          await timeout(100);
          navigate('Conversation', {id: sessionIDs[0]});
        } else {
          goBack();
        }
      } else {
        console.log(
          'ERROR InvitationManager, action is "shareVideos" but empty/no prop "archivesToShare" provided',
        );
      }
    } else if (action === 'invite') {
      if (sessionToInvite && sessionToInvite !== '') {
        console.log(
          'ERROR InvitationManager, cannot add session to another session. (action "invite")',
        );
      } else {
        console.log(
          'ERROR InvitationManager, action is "invite" but empty/no prop "sessionToInvite" provided',
        );
      }
    } else if (action === 'message') {
      navigate('Conversation', {id: sessionIDs[0]});
    } else if (action === 'call') {
      sessionOpening(Object.values(selectedSessions)[0]);
    }
  };

  confirmInvites() {
    const {
      selectedSessions,
      selectedUsers,
      onConfirmInvites,
      onClearInvites,
    } = this.props;
    if (onConfirmInvites) {
      return onConfirmInvites({
        sessions: selectedSessions,
        users: selectedUsers,
      });
    }
    const sessionArray = Object.values(selectedSessions);
    const userArray = Object.values(selectedUsers);
    if (sessionArray.length > 0) {
      this.confirmSessionInvites();
    } else if (userArray.length > 0) {
      this.confirmUserInvites();
    }
    onClearInvites();
  }

  button = () => {
    const {bottomOffset, action} = this.props;
    const {buttonText} = this.state;
    const {icon} = getSelectionActionDecorations(action);
    const translateY = this.buttonReveal.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [
        75,
        -(marginBottomApp + bottomOffset),
        -(keyboardOffset + bottomOffset + 25),
      ],
    });
    const buttonContainerStyle = {
      flex: 1,
      flexDirection: 'row',
      position: 'absolute',
      bottom: 10,
      height: 50,
      width: '100%',
      ...styleApp.center1,
      marginBottom: 5,
      transform: [{translateY}],
    };
    return (
      <Animated.View style={buttonContainerStyle}>
        <ButtonColor
          color={colors.green}
          onPressColor={colors.greenLight}
          style={styles.inviteButtonStyle}
          loaderColor={colors.white}
          onRef={(ref) => {
            this.quickCallButtonRef = ref;
          }}
          click={async () => {
            this.quickCallButtonRef?.setLoading(true);
            setTimeout(async () => {
              await this.confirmInvites();
              this.quickCallButtonRef?.setLoading(false);
            }, 50);
          }}
          view={() => {
            return (
              <View style={styleApp.fullSize}>
                <Row style={styleApp.center}>
                  <AllIcon
                    type={icon.type}
                    color={icon.color ?? colors.white}
                    size={icon.size ?? 18}
                    name={icon.name}
                    solid
                  />
                  <Text style={styles.buttonTextStyle}>{buttonText}</Text>
                </Row>
              </View>
            );
          }}
        />
        <ButtonColor
          color={colors.greyLight}
          onPressColor={colors.greyLight}
          style={styles.cancelButtonStyle}
          click={() => this.clearInvites()}
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

const styles = StyleSheet.create({
  buttonTextStyle: {
    ...styleApp.textBold,
    color: colors.white,
    marginLeft: 15,
    marginTop: 3,
    fontSize: 17,
  },
  cancelButtonStyle: {
    ...styleApp.shadowWeak,
    borderRadius: 50,
    marginRight: '5%',
    width: 40,
    height: 40,
    marginTop: 5,
  },
  inviteButtonStyle: {
    ...styleApp.fullSize,
    ...styleApp.shadowWeak,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 15,
    marginLeft: '5%',
    marginRight: '4%',
    width: width * 0.76,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
    userConnected: userConnectedSelector(state),
    currentSessionID: currentSessionIDSelector(state),
  };
};

export default connect(mapStateToProps)(InvitationManager);
