import React, {Component} from 'react';
import {Platform, StyleSheet, View, Text} from 'react-native';
import PropTypes from 'prop-types';

import AsyncImage from './AsyncImage';
import styleApp from '../../style/style';
import colors from '../../style/colors';

export default class ImageUser extends Component {
  constructor(props) {
    super(props);
  }
  image(user) {
    const {styleImgProps} = this.props;

    let styleImg = {
      ...styleApp.roundView2,
      ...styleImgProps,
    };

    if (user.info.picture)
      return (
        <AsyncImage
          style={styleImg}
          mainImage={user.info.picture}
          imgInitial={user.info.picture}
        />
      );
    return (
      <View style={styleImg}>
        <Text style={[styleApp.input, {fontSize: 11}]}>
          {user.info.firstname[0] + user.info.lastname[0]}
        </Text>
      </View>
    );
  }
  render() {
    const {user} = this.props;
    return this.image(user);
  }
}

const styles = StyleSheet.create({});

ImageUser.propTypes = {
  user: PropTypes.object.isRequired,
};
