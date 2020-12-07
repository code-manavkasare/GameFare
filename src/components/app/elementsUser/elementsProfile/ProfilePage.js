import React, {Component} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import {blockUnblockUser} from '../../../database/firebase/users';

import AsyncImage from '../../../layout/image/AsyncImage';
import Button from '../../../layout/buttons/Button';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {heightHeaderHome} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView2';
import {capitalize} from '../../../functions/coach';

import {
  BadgesView,
  PriceView,
  FocusView,
} from '../../coachingTab/components/ComponentsCard';

import {
  infoUserByIdSelector,
  userIDSelector,
} from '../../../../store/selectors/user';
import {isUserBlockedSelector} from '../../../../store/selectors/blockedUsers';
import {
  bindUserInfo,
  unbindUserInfo,
} from '../../../database/firebase/bindings';

class ProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      initialLoader: true,
      isBlocked: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount = () => {
    const {route} = this.props;
    const {id} = route.params;
    console.log('id', id);
    bindUserInfo(id);
  };
  componentWillUnmount = () => {
    const {route} = this.props;
    const {id} = route.params;
    unbindUserInfo(id);
  };

  blockUnblockUser = async (block) => {
    const {userID, route} = this.props;
    const {id} = route.params;
    await blockUnblockUser(block, userID, id);
    this.setState({isBlocked: block});
  };

  picture = (pictureUrl, firstname, lastname) => {
    if (pictureUrl) {
      return <AsyncImage style={styles.asyncImage} mainImage={pictureUrl} />;
    } else
      return (
        <View style={styles.asyncImage}>
          <Text style={styleApp.textBold}>{firstname[0] + lastname[0]}</Text>
        </View>
      );
  };

  blockButton = () => {
    const {route, isUserBlocked} = this.props;
    const {id} = route.params;
    const {userID} = this.props;
    if (userID !== id) {
      return (
        <Button
          text={isUserBlocked ? 'Unblock' : 'Block user'}
          icon={{
            name: 'hand-paper',
            size: 22,
            type: 'font',
            color: colors.title,
          }}
          textButton={{color: colors.title}}
          color={colors.white}
          onPressColor={colors.off}
          click={() => this.blockUnblockUser(!isUserBlocked)}
        />
      );
    }
  };

  profilePage() {
    const {infoUser} = this.props;
    if (!infoUser) return null;
    const {
      firstname,
      lastname,
      picture,
      coach,
      focusAreas,
      hourlyRate,
      gender,
      badges,
      biography,
      levelCoached,
    } = infoUser;
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
            {BadgesView({badges})}
            {coach
              ? PriceView({
                  hourlyRate,
                })
              : null}
          </Col>
        </Row>
        {coach ? <View style={styleApp.divider} /> : null}
        {FocusView({
          list: focusAreas,
          icon: {
            name: 'address-card',
            color: colors.title,
            size: 18,
            type: 'font',
          },
        })}
        {gender
          ? FocusView({
              list: [capitalize(gender)],
              icon: {
                name: gender === 'male' ? 'mars' : 'venus',
                color: colors.title,
                size: 23,
                type: 'font',
              },
            })
          : null}
        {levelCoached
          ? FocusView({
              list: [capitalize(levelCoached)],
              icon: {
                name: 'balance-scale',
                color: colors.title,
                size: 21,
                type: 'font',
              },
            })
          : null}
        {biography
          ? FocusView({
              list: [biography],
              icon: {
                name: 'align-left',
                color: colors.title,
                size: 23,
                type: 'font',
              },
            })
          : null}
        <View style={styleApp.divider} />

        <View style={[{height: 10}]} />

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
          initialBorderColorHeader={colors.white}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          icon1={'times'}
          sizeIcon1={21}
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

const mapStateToProps = (state, props) => {
  const {id} = props.route.params;
  return {
    infoUser: infoUserByIdSelector(state, {id}),
    userID: userIDSelector(state),
    isUserBlocked: isUserBlockedSelector(state, {id}),
  };
};

export default connect(mapStateToProps)(ProfilePage);
