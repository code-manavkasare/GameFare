import React, {Component} from 'react';
import {Platform, StyleSheet, View, Text} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
import PropTypes from 'prop-types';

import AsyncImage from './AsyncImage';
import styleApp from '../../style/style';
import colors from '../../style/colors';

export default class ImageConversation extends Component {
  constructor(props) {
    super(props);
  }

  imageMember(member, style) {
    //TODO remove when no more wrong conversation
    if (!member) {
      return (
        <View style={[style, styleApp.center, {backgroundColor: colors.off}]}>
          <Text style={[styleApp.input, {fontSize: 11}]}></Text>
        </View>
      );
    }
    //End TODO
    if (member.info.picture)
      return (
        <AsyncImage
          style={style}
          mainImage={member.info.picture}
          imgInitial={member.info.picture}
        />
      );
    return (
      <View style={[style, styleApp.center, {backgroundColor: colors.off}]}>
        <Text style={[styleApp.input, {fontSize: 11}]}>
          {member.info.firstname[0] + member.info.lastname[0]}
        </Text>
      </View>
    );
  }
  multipleUserView(style, sizeSmallImg) {
    const {members} = this.props;
    return (
      <View
        style={{
          height: style.height,
          width: style.width,
        }}>
        {this.imageMember(Object.values(members)[0], [
          styles.imgSmall,
          {bottom: 0, zIndex: 30, width: sizeSmallImg, height: sizeSmallImg},
        ])}
        {this.imageMember(Object.values(members)[1], [
          styles.imgSmall,
          {top: 0, right: 0, width: sizeSmallImg, height: sizeSmallImg},
        ])}
      </View>
    );
  }
  image(conversation, style, sizeSmallImg) {
    const {members} = this.props;
    if (conversation.type === 'group')
      return (
        <AsyncImage
          style={style}
          mainImage={conversation.image}
          imgInitial={conversation.image}
        />
      );

    if (conversation.allMembers.length === 2)
      return this.imageMember(Object.values(members)[0], style);
    return this.multipleUserView(style, sizeSmallImg);
  }
  render() {
    const {style, sizeSmallImg} = this.props;
    return this.image(this.props.conversation, style, sizeSmallImg);
  }
}

const styles = StyleSheet.create({
  imgSmall: {
    position: 'absolute',
    height: 35,
    width: 35,
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: colors.white,
  },
});

ImageConversation.propTypes = {
  members: PropTypes.object.isRequired,
};
