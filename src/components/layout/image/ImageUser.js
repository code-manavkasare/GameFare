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
    const {user} = this.props;
    if (user.info && user.info.picture)
      return (
        <AsyncImage
          style={styleApp.fullSize}
          mainImage={user.info.picture}
          imgInitial={user.info.picture}
        />
      );
    return (
      <View style={[styleApp.fullSize, styleApp.center]}>
        <Text style={[styleApp.text, {fontSize: 11}]}>
          {user.info && user.info.firstname && user.info.lastname && user?.info?.firstname[0] + user.info.lastname[0]}
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
          else navigate('ProfilePage', {user: user});
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

const styles = StyleSheet.create({});

ImageUser.propTypes = {
  user: PropTypes.object.isRequired,
};
