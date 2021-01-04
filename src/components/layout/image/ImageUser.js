import React, {Component} from 'react';
import {Platform, StyleSheet, View, Text} from 'react-native';
import PropTypes from 'prop-types';

import {navigate} from '../../../../NavigationService';

import AsyncImage from './AsyncImage';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import {TouchableOpacity} from 'react-native-gesture-handler';

export default class ImageUser extends Component {
  constructor(props) {
    super(props);
  }
  image() {
    const {info, hideProfileInitials, profileInitialsStyle} = this.props;
    const picture = info.picture;
    const firstname = info.firstname;
    const lastname = info.lastname;
    if (picture)
      return (
        <AsyncImage
          style={styleApp.fullSize}
          mainImage={picture}
          imgInitial={picture}
        />
      );
    if (hideProfileInitials) return null;
    return (
      <View style={[styleApp.fullSize, styleApp.center]}>
        <Text
          style={[
            styleApp.textBold,
            {fontSize: 10, color: colors.white},
            profileInitialsStyle,
          ]}>
          {firstname && lastname ? firstname[0] + lastname[0] : null}
        </Text>
      </View>
    );
  }
  button() {
    const {onClick, styleImgProps, user, disableClick} = this.props;

    let styleImg = {
      ...styleApp.roundView2,
      overflow: 'hidden',
      backgroundColor: colors.greyDark,
      ...styleImgProps,
    };
    return (
      <TouchableOpacity
        onPress={() => {
          if (disableClick) return null;
          else if (onClick) return onClick();
          else navigate('ProfilePage', {id: user.id});
        }}
        activeOpacity={0.9}
        style={styleImg}>
        {this.image()}
      </TouchableOpacity>
    );
  }
  render() {
    return this.button();
  }
}

ImageUser.propTypes = {
  info: PropTypes.object.isRequired,
};
