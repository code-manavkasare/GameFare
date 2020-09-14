import React, {Component} from 'react';
import {View, Animated, Text} from 'react-native';
import ButtonColor from '../../../../layout/Views/Button';
import {Row, Col} from 'react-native-easy-grid';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import {native} from '../../../../animations/animations';
import AsyncImage from '../../../../layout/image/AsyncImage';
import AllIcon from '../../../../layout/icons/AllIcons';

export default class UserSearchResult extends Component {
  constructor(props) {
    super(props);
    this.selectionIndication = new Animated.Value(0);
  }

  componentDidMount = async () => {
    const {invite, onRef} = this.props;
    if (onRef) {
      this.index = onRef(this);
    }
    this.selected = await invite(true);
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
    let toValue = this.selected ? 0 : 0.8;
    if (override !== undefined) {
      toValue = override;
    }
    Animated.timing(this.selectionIndication, native(toValue, 100)).start(
      () => {
        this.selected = this.selected ? false : true;
      },
    );
  }

  userCard = (user) => {
    const {invite} = this.props;
    const animatedReverse = this.selectionIndication.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    });
    const userCardStyle = {
      ...styleApp.center1,
      height: 65,
      width: '100%',
      marginBottom: 15,
    };
    const imageStyle = {
      ...styleApp.shadowWeak,
      ...styleApp.center,
      height: 45,
      width: 45,
      borderRadius: 25,
      backgroundColor: colors.greyDark,
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
    const usernameStyle = {
      ...styleApp.textBold,
      fontSize: 17,
    };
    const imageContainer = {
      ...styleApp.center,
      ...styleApp.fullSize,
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
    const rowStyle = {
      ...styleApp.center,
    };
    return (
      <View style={userCardStyle}>
        <ButtonColor
          color={colors.white}
          onPressColor={colors.white}
          click={async () => {
            const status = await invite(false);
            this.toggleSelected(status);
          }}
          style={buttonStyle}
          view={() => {
            return (
              <Row style={rowStyle}>
                <Col size={30} style={imageContainer}>
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
                <Col size={15}>
                  <Animated.View
                    style={{
                      opacity: animatedReverse,
                    }}>
                    <AllIcon
                      type={'font'}
                      color={colors.grey}
                      size={18}
                      name={user?.isPrivate ? 'lock' : 'video'}
                    />
                  </Animated.View>
                  <Animated.View
                    style={{
                      position: 'absolute',
                      opacity: this.selectionIndication,
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
      </View>
    );
  };

  render() {
    const {user} = this.props;
    return this.userCard(user);
  }
}
