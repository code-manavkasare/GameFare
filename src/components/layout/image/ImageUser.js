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
    if (user.info.picture) return <AsyncImage
      style={styleApp.roundView2}
      mainImage={user.info.picture}
      imgInitial={user.info.picture}
    />
  return <View style={styleApp.roundView2}>
    <Text style={[styleApp.input, {fontSize: 11}]}>
      {user.info.firstname[0] + user.info.lastname[0]}
    </Text>
  </View>
  }
  render() {
    const {user} = this.props;
    return this.image(user);
  }
}

const styles = StyleSheet.create({

});

ImageUser.propTypes = {
  user: PropTypes.object.isRequired,
};
