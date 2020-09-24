import React, {Component} from 'react';
import {View, Animated, Text, Keyboard, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import {navigate} from '../../../../../NavigationService';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {native} from '../../../animations/animations';

import {
  createSession,
  openSession,
  sessionOpening,
  updateMembersToSession,
} from '../../../functions/coach';
import {shareVideosWithTeams} from '../../../functions/videoManagement';

import AsyncImage from '../../../layout/image/AsyncImage';
import AllIcon from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';

import {titleSession} from '../../TeamPage/components/elements';

class UserInvitationManager extends Component {
  static propTypes = {
    action: PropTypes.string.isRequired,
    actionText: PropTypes.string.isRequired,
    invitedUsers: PropTypes.object.isRequired,
    onClearInvites: PropTypes.func,
    archivesToShare: PropTypes.array,
  };

  static defaultProps = {
    action: 'call',
    actionText: 'Call',
    invitedUsers: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      buttonText: '',
      keyboardVisible: false,
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

  UNSAFE_componentWillMount() {
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
    const {invitedUsers} = this.props;
    const {invitedUsers: prevInvitedUsers} = prevProps;
    const {keyboardVisible} = this.state;
    const {keyboardVisible: prevKeyboardVisible} = prevState;
    const someInvitedUsers = Object.keys(invitedUsers).length > 0;
    const needToShowButton =
      Object.keys(prevInvitedUsers).length === 0 && someInvitedUsers;
    const needToHideButton =
      Object.keys(prevInvitedUsers).length > 0 &&
      Object.keys(invitedUsers).length === 0;
    const invitesChanged =
      Object.keys(invitedUsers).length !== Object.keys(prevInvitedUsers).length;
    if (needToShowButton) {
      this.showButton(keyboardVisible);
    } else if (needToHideButton) {
      this.hideButton();
    } else if (prevKeyboardVisible !== keyboardVisible && someInvitedUsers) {
      this.showButton(keyboardVisible);
    }
    if (invitesChanged) {
      this.updateText();
    }
  }

  componentWillUnmount() {
    if (this.keyboardWillShowListener) {
      this.keyboardWillShowListener.remove();
    }
    if (this.keyboardWillHideListener) {
      this.keyboardWillHideListener.remove();
    }
  }

  hideButton() {
    Animated.timing(this.buttonReveal, native(0)).start();
  }

  showButton(keyboard) {
    const to = keyboard ? 2 : 1;
    Animated.timing(this.buttonReveal, native(to)).start();
  }

  updateText() {
    const {invitedUsers, actionText} = this.props;
    const userArray = Object.values(invitedUsers);
    if (userArray.length > 0) {
      const firstUser = userArray[0];
      if (userArray.length === 1) {
        const buttonText = `${actionText} ${firstUser.info.firstname}`;
        this.setState({buttonText});
      } else {
        const buttonText = `${actionText} ${
          firstUser.info.firstname
        } and ${userArray.length - 1} others`;
        this.setState({buttonText});
      }
    }
  }

  clearInvites = async () => {
    const {onClearInvites} = this.props;
    onClearInvites && onClearInvites();
    this.hideButton();
  };

  confirmInvites = async () => {
    const {invitedUsers, userID, infoUser} = this.props;
    const {archivesToShare, action} = this.props;
    const membersParam = Object.values(invitedUsers).reduce(
      (members, member) => {
        members[member.objectID] = {id: member.objectID, info: member.info};
        return members;
      },
      {},
    );
    const session = await openSession(
      {id: userID, info: infoUser},
      membersParam,
    );
    if (action === 'shareArchives') {
      if (archivesToShare && archivesToShare.length > 0) {
        shareVideosWithTeams(archivesToShare, [session.objectID]);
        navigate('Conversation', {coachSessionID: session.objectID});
      } else {
        console.log(
          'ERROR InvitationManager, action is "shareVideos" but empty/no prop "archivesToShare" provided',
        );
      }
    } else if (action === 'message') {
      navigate('Conversation', {coachSessionID: session.objectID});
    } else if (action === 'call') {
      sessionOpening(session);
    }
  };

  button = () => {
    const {buttonText} = this.state;
    const translateY = this.buttonReveal.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [
        sizes.heightFooter + sizes.marginBottomApp,
        0,
        -(sizes.keyboardOffset + 15),
      ],
    });
    const buttonContainerStyle = {
      flex: 1,
      flexDirection: 'row',
      position: 'absolute',
      bottom: sizes.marginBottomApp,
      height: 50,
      width: '100%',
      ...styleApp.center1,
      marginBottom: 5,
      transform: [{translateY}],
      zIndex: 100,
    };
    return (
      <Animated.View style={buttonContainerStyle}>
        <ButtonColor
          color={colors.green}
          onPressColor={colors.greenLight}
          style={styles.inviteButtonStyle}
          click={() => this.confirmInvites()}
          view={() => {
            return (
              <View style={styleApp.fullSize}>
                <Row style={styleApp.center}>
                  <AllIcon
                    type={'font'}
                    color={colors.white}
                    size={18}
                    name={'video'}
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
    width: sizes.width * 0.76,
  },
});

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
)(UserInvitationManager);
