import React, {Component} from 'react';
import {View, Animated, Text, Keyboard} from 'react-native';
import {connect} from 'react-redux';
import ButtonColor from '../../../../layout/Views/Button';
import {Row, Col} from 'react-native-easy-grid';

import {shareVideosWithTeams} from '../../../../functions/videoManagement';

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

  invite = async (user, init) => {
    const {users, keyboardShown} = this.state;
    const {currentSessionID, sharingVideos} = this.props;
    if (this.reseting) {
      return false;
    }
    let inserted = false;
    if (Object.keys(users).includes(user?.objectID)) {
      if (init) {
        return true;
      }
      delete users[`${user?.objectID}`];
    } else {
      if (init) {
        return false;
      }
      users[`${user?.objectID}`] = {...user, id: user?.objectID};
      inserted = true;
    }
    const prefix = sharingVideos ? 'Share with ' : !currentSessionID ? 'Call ' : 'Invite ';
    const text =
      Object.keys(users).length === 1
        ? prefix + Object.values(users)[0]?.info?.firstname
        : Object.keys(users).length > 1
        ? prefix + Object.keys(users).length + ' people'
        : this.state.text;
    await this.setState({users, text});
    Animated.timing(
      this.buttonReveal,
      native(Object.keys(users).length < 1 ? 0 : keyboardShown ? 2 : 1),
    ).start();
    return inserted;
  };

  resetInvitations = async () => {
    const {resetInvites} = this.props;
    const users = {};
    const text = '';
    this.reseting = true;
    Animated.timing(this.buttonReveal, native(0)).start(() => {
      this.setState({users, text});
      this.reseting = false;
    });
    if (resetInvites) {
      resetInvites();
    }
  };

  confirmButton = async () => {
    const {users} = this.state;
    const {dismiss, currentSessionID, sharingVideos} = this.props;
    this.resetInvitations();
    if (sharingVideos) {
      const {objectID} = await createSession(users);
      shareVideosWithTeams(sharingVideos, [objectID]);
    } else if (!currentSessionID) {
      const session = await createSession(users);
      sessionOpening(session);
    } else {
      updateMembersToSession(currentSessionID, users);
    }
    Animated.timing(this.buttonReveal, native(0)).start();
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
            this.confirmButton();
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
            this.resetInvitations();
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
