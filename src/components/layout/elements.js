import React from 'react';
import {View, Text} from 'react-native';
import {Col} from 'react-native-easy-grid';

import styleApp from '../style/style';
import AsyncImage from '../layout/image/AsyncImage';
import colors from '../style/colors';

const profilePhoto = ({infoUser, imageStyle, initialsTextStyle}) => {
  const {picture} = infoUser;
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
  return picture ? (
    <AsyncImage style={imageStyle} mainImage={picture} />
  ) : (
    <View style={imageStyle}>
      <Text style={initialsTextStyle}>
        {infoUser?.firstname[0] + infoUser.lastname[0]}
      </Text>
    </View>
  );
};

const profileHeader = ({
  infoUser,
  containerStyle,
  titleStyle,
  subtitleStyle,
  imageStyle,
  initialsTextStyle,
}) => {
  const {firstname, lastname, countryCode, phoneNumber} = infoUser;
  titleStyle = {
    ...styleApp.title,
    titleStyle,
  };
  subtitleStyle = {
    ...styleApp.subtitle,
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
    letterSpacing: 0.3,
    ...subtitleStyle,
  };
  const textStyle = {...styleApp.center, marginTop: 15};
  return (
    <Col style={containerStyle}>
      <Col size={40} style={styleApp.center}>
        {profilePhoto({infoUser, imageStyle, initialsTextStyle})}
      </Col>
      <Col size={60} style={textStyle}>
        <Text style={titleStyle}>{firstname + ' ' + lastname}</Text>
        <Text style={subtitleStyle}>{countryCode + ' ' + phoneNumber}</Text>
      </Col>
    </Col>
  );
};

module.exports = {
  profileHeader,
  profilePhoto,
};
