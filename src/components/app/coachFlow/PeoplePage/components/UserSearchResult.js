import React, {Component} from 'react';
import {View, Animated, Text} from 'react-native';
import {connect} from 'react-redux';

import ButtonColor from '../../../../layout/Views/Button';
import {Row, Col} from 'react-native-easy-grid';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import {native} from '../../../../animations/animations';
import AsyncImage from '../../../../layout/image/AsyncImage';
import AllIcon from '../../../../layout/icons/AllIcons';
import {openSession} from '../../../../functions/coach';
import {navigate} from '../../../../../../NavigationService';

class UserSearchResult extends Component {
  constructor(props) {
    super(props);
    this.state = {loader: false};
    this.selectionIndication = new Animated.Value(0);
  }

  componentDidMount = async () => {
    const {invite, onRef, user} = this.props;
    if (onRef) {
      this.index = onRef(this);
    }
    this.selected = await invite({user, init: true});
    if (this.selected) {
      Animated.timing(this.selectionIndication, native(1, 50)).start();
    }
  };

  componentWillUnmount() {
    const {offRef} = this.props;
    if (offRef) {
      offRef(this.index);
    }
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
  styleCard = () => {
    const callButtonStyle = {
      borderRadius: 25,
      height: 40,
      width: 40,
    };
    const buttonStyle = {
      ...styleApp.fullSize,
      borderRadius: 15,
      marginLeft: '5%',
      marginRight: '5%',
      width: '90%',
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
    };
    const usernameStyle = {
      ...styleApp.textBold,
      fontSize: 17,
    };
    const userIconStyle = {
      ...styleApp.textBold,
      color: colors.white,
      letterSpacing: 1,
      textAlign: 'center',
      marginLeft: 3,
      marginTop: 1,
      fontSize: 20,
    };
    const imageStyle = {
      ...styleApp.shadowWeak,
      ...styleApp.center,
      height: 45,
      width: 45,
      borderRadius: 25,
      backgroundColor: colors.greyDark,
    };
    const userCardStyle = {
      ...styleApp.center1,
      height: 65,
      width: '100%',
      marginBottom: 15,
    };
    return {
      buttonStyle,
      selectionIndicationOverlayStyle,
      usernameStyle,
      userIconStyle,
      imageStyle,
      userCardStyle,
      callButtonStyle,
    };
  };
  isUserInvitable = () => {
    const {silentFriends, user} = this.props;
    const {isPrivate} = user.info;
    if (!isPrivate) {
      return true;
    }
    if (silentFriends[user.id]) {
      return true;
    }
    return false;
  };
  userCard = (user) => {
    const {invite, userID, infoUser} = this.props;
    const animatedReverse = this.selectionIndication.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    const isUserInvitable = this.isUserInvitable();

    const {
      buttonStyle,
      selectionIndicationOverlayStyle,
      usernameStyle,
      userIconStyle,
      imageStyle,
      userCardStyle,
      callButtonStyle,
    } = this.styleCard();

    return (
      <View style={userCardStyle} key={user?.objectID}>
        <ButtonColor
          color={colors.white}
          onPressColor={colors.white}
          click={async () => {
            if (!isUserInvitable) {
              const session = await openSession(
                {id: userID, info: infoUser},
                {[user.objectID]: {...user, id: user.objectID}},
              );
              return navigate('Conversation', {
                coachSessionID: session.objectID,
              });
            }

            const status = await invite({
              user,
              init: false,
              insert: !this.selected,
            });
            this.toggleSelected(status);
          }}
          style={buttonStyle}
          view={() => {
            return (
              <Row style={styleApp.center}>
                <Col size={30} style={[styleApp.center, styleApp.fullSize]}>
                  {user?.info?.picture !== undefined ? (
                    <AsyncImage
                      style={imageStyle}
                      mainImage={user?.info?.picture}
                      onError={(err) => {
                        console.log('image error', err);
                      }}
                    />
                  ) : (
                    <View style={imageStyle}>
                      <Text style={userIconStyle}>
                        {user?.info?.firstname[0] + user?.info?.lastname[0]}
                      </Text>
                    </View>
                  )}
                </Col>
                <Col size={55}>
                  <Text style={usernameStyle}>
                    {user?.info?.firstname} {user?.info?.lastname}
                  </Text>
                </Col>
                <Col size={15} style={styleApp.center}>
                  <Animated.View
                    style={{
                      position: 'absolute',
                      opacity: this.selectionIndication,
                      right: '40%',
                    }}>
                    <AllIcon
                      type={'font'}
                      color={colors.green}
                      size={18}
                      name={'check'}
                    />
                  </Animated.View>
                </Col>
                <Animated.View style={selectionIndicationOverlayStyle} />
              </Row>
            );
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            right: '7%',
            opacity: animatedReverse,
            height: '100%',
            ...styleApp.center,
          }}>
          <ButtonColor
            color={!isUserInvitable ? colors.white : colors.greyLight}
            onPressColor={!isUserInvitable ? colors.white : colors.grey}
            click={() => {
              invite({user, immediatelyOpen: true});
            }}
            style={callButtonStyle}
            view={() => {
              return (
                <AllIcon
                  type={'font'}
                  color={!isUserInvitable ? colors.grey : colors.greyDarker}
                  size={18}
                  name={!isUserInvitable ? 'lock' : 'video'}
                />
              );
            }}
          />
        </Animated.View>
      </View>
    );
  };

  render() {
    const {user} = this.props;
    return this.userCard(user);
  }
}

const mapStateToProps = (state) => {
  let {silentFriends} = state.user.infoUser;
  if (silentFriends) {
    silentFriends = {};
  }
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    silentFriends,
  };
};

export default connect(
  mapStateToProps,
  {},
)(UserSearchResult);
