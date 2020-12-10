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
    const {info} = this.props;
    const {picture, firstname, lastname} = info;
    if (picture)
      return (
        <AsyncImage
          style={styleApp.fullSize}
          mainImage={picture}
          imgInitial={picture}
        />
      );
    return (
      <View style={[styleApp.fullSize, styleApp.center]}>
        <Text style={[styleApp.textBold, {fontSize: 10, color: colors.white}]}>
          {firstname && lastname ? firstname[0] + lastname[0] : null}
        </Text>
      </View>
    );
  }
  button() {
    const {onClick, styleImgProps, user} = this.props;

    let styleImg = {
      ...styleApp.roundView2,
      ...styleImgProps,
      overflow: 'hidden',
    };
    return (
      <TouchableOpacity
        onPress={() => {
          if (onClick) return onClick();
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
