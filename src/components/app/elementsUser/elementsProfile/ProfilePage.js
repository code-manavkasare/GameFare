import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import {blockUnblockUser} from '../../../database/firebase/users';

import AsyncImage from '../../../layout/image/AsyncImage';
import ButtonColor from '../../../layout/Views/Button';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {heightHeaderHome} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import {openDiscussion} from '../../../functions/message';

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      userProfile: {
        info: {
          firstname: '',
          lastname: '',
          picture: false,
        },
        id: '',
      },
      isBlocked: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount = () => {
    const {infoUser, route} = this.props;
    const userProfile = route.params.user;
    let isBlocked = false;
    if (infoUser.blockedUsers && infoUser.blockedUsers[userProfile.id]) {
      isBlocked = true;
    }
    this.setState({userProfile, isBlocked});
  };

  blockUnblockUser = async (block) => {
    await blockUnblockUser(block, this.props.userID, this.state.userProfile.id);
    this.setState({isBlocked: block});
  };

  picture = (pictureUrl, firstname, lastname) => {
    if (pictureUrl) {
      return <AsyncImage style={styles.asyncImage} mainImage={pictureUrl} />;
    } else
      return (
        <View style={styles.asyncImage}>
          <Text style={styleApp.text}>{firstname[0] + lastname[0]}</Text>
        </View>
      );
  };

  button = (text, color, block) => {
    return (
      <ButtonColor
        view={() => (
          <Text style={[styleApp.textBold, {color: colors.white}]}>{text}</Text>
        )}
        style={{height: 45, borderRadius: 5}}
        click={() => this.blockUnblockUser(block)}
        color={color}
        onPressColor={color}
      />
    );
  };

  blockButton = () => {
    const {isBlocked, userProfile} = this.state;
    const {userID} = this.props;
    if (userID !== userProfile.id) {
      return isBlocked
        ? this.button('Unblock User', colors.green, false)
        : this.button('Block User', colors.red, true);
    }
  };
  async requestSession() {
    const {userID, navigation, infoUser} = this.props;
    const {objectID: profileUserID, info} = this.state.userProfile;
    await this.setState({loader: true});

    const discussion = await openDiscussion([
      {id: userID, info: infoUser.userInfo},
      {id: profileUserID, info},
    ]);
    console.log('nim discussion', discussion);
    await navigation.navigate('Conversation', {
      data: discussion,
      myConversation: true,
      back: true,
    });
    return this.setState({loader: false});
  }
  profilePage() {
    const {
      firstname,
      lastname,
      picture,
      coach,
      currencyRate,
      hourlyRate,
    } = this.state.userProfile.info;
    return (
      <View style={styleApp.marginView}>
        <Row>
          <Col style={styleApp.center2} size={35}>
            {this.picture(picture, firstname, lastname)}
          </Col>
          <Col size={65}>
            <Text style={[styleApp.title, {fontSize: 22}]}>
              {firstname} {lastname}
            </Text>
            {coach && (
              <Text style={[styleApp.subtitle, {fontSize: 15}]}>
                {currencyRate} ${hourlyRate} / hour
              </Text>
            )}
          </Col>
        </Row>
        <View style={{height: 40}} />
        {coach && (
          <ButtonColor
            view={() => (
              <Text style={[styleApp.textBold, {color: colors.white}]}>
                Request a session
              </Text>
            )}
            style={{height: 45, borderRadius: 5, marginBottom: 20}}
            click={() => this.requestSession()}
            color={colors.primary}
            onPressColor={colors.primary2}
          />
        )}

        {this.blockButton()}
      </View>
    );
  }

  render() {
    const {loader} = this.state;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialBorderColorHeader={colors.grey}
          initialTitleOpacity={1}
          icon1={'arrow-left'}
          clickButton1={() => this.props.navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.profilePage()}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={90}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  asyncImage: {
    ...styleApp.center,
    width: 110,
    height: 110,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: colors.off2,
  },
});

const mapStateToProps = (state) => {
  return {
    infoUser: state.user.infoUser,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(ProfilePage);
