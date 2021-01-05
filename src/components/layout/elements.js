import React from 'react';
import {View, Text} from 'react-native';
import {Col} from 'react-native-easy-grid';

import styleApp from '../style/style';
import AsyncImage from '../layout/image/AsyncImage';
import AllIcons from '../layout/icons/AllIcons';
import colors from '../style/colors';
import {store} from '../../store/reduxStore';

const profilePhoto = ({infoUser, imageStyle, initialsTextStyle}) => {
  const {picture} = infoUser;
  const {userConnected} = store.getState().user;
  imageStyle = {
    width: 130,
    height: 130,
    borderColor: colors.greyMidDark,
    borderRadius: 30,
    backgroundColor: colors.greyMidDark,
    ...styleApp.shadowWeak,
    ...styleApp.center,
    ...imageStyle,
  };
  initialsTextStyle = {
    ...styleApp.textBold,
    color: colors.greyLighter,
    fontSize: 33,
    letterSpacing: 1,
    marginLeft: 4,
    ...initialsTextStyle,
  };
  return !userConnected ? (
    <View style={imageStyle}>
      <AllIcons
        type={'font'}
        color={colors.white}
        size={60}
        name={'user'}
        solid
      />
    </View>
  ) : picture ? (
    <AsyncImage style={imageStyle} mainImage={picture} />
  ) : (
    <View style={imageStyle}>
      <Text style={initialsTextStyle}>
        {infoUser.firstname && infoUser.lastname
          ? infoUser?.firstname[0] + infoUser.lastname[0]
          : null}
      </Text>
    </View>
  );
};

const userTitle = ({
  infoUser,
  textContainerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  const {firstname, lastname, countryCode, phoneNumber} = infoUser;
  const {userConnected} = store.getState().user;
  textContainerStyle = {
    ...styleApp.center,
    marginTop: !userConnected ? 5 : 15,
    ...textContainerStyle,
  };
  titleStyle = {
    ...styleApp.title,
    ...titleStyle,
  };
  subtitleStyle = {
    ...styleApp.subtitle,
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
    letterSpacing: 0.3,
    ...subtitleStyle,
  };
  const title = !userConnected ? '' : firstname + ' ' + lastname;
  const subtitle = !userConnected
    ? 'Sign Into GameFare'
    : countryCode + ' ' + phoneNumber;
  return (
    <View style={textContainerStyle}>
      <Text style={titleStyle}>{title}</Text>
      <Text style={subtitleStyle}>{subtitle}</Text>
    </View>
  );
};

const profileHeader = ({
  infoUser,
  containerStyle,
  textContainerStyle,
  titleStyle,
  subtitleStyle,
  imageStyle,
  initialsTextStyle,
}) => {
  containerStyle = {
    ...styleApp.center,
    ...containerStyle,
  };
  return (
    <Col style={containerStyle}>
      {profilePhoto({infoUser, imageStyle, initialsTextStyle})}
      {userTitle({infoUser, textContainerStyle, titleStyle, subtitleStyle})}
    </Col>
  );
};

module.exports = {
  profileHeader,
  profilePhoto,
};
