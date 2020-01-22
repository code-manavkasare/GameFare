import React, {Component} from 'react';
import {Platform, StyleSheet, View, Text} from 'react-native';
import AsyncImage from './AsyncImage';
import styleApp from '../../style/style';
import colors from '../../style/colors';

export default class ImageConversation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
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
  multipleUserView(conversation, userID, style, sizeSmallImg) {
    return (
      <View
        style={{
          height: style.height,
          width: style.width,
        }}>
        {this.imageMember(
          Object.values(conversation.members).filter(
            (member) => member.id !== userID,
          )[0],
          [
            styles.imgSmall,
            {bottom: 0, zIndex: 30, width: sizeSmallImg, height: sizeSmallImg},
          ],
        )}
        {this.imageMember(
          Object.values(conversation.members).filter(
            (member) => member.id !== userID,
          )[1],
          [
            styles.imgSmall,
            {top: 0, right: 0, width: sizeSmallImg, height: sizeSmallImg},
          ],
        )}
      </View>
    );
  }
  image(conversation, userID, style, sizeSmallImg) {
    if (conversation.type === 'group')
      return (
        <AsyncImage
          style={style}
          mainImage={conversation.image}
          imgInitial={conversation.image}
        />
      );
    if (conversation.numberMembers === 2)
      return this.imageMember(
        Object.values(conversation.members).filter(
          (member) => member.id !== userID,
        )[0],
        style,
      );
    return this.multipleUserView(conversation, userID, style, sizeSmallImg);
  }
  render() {
    const {style, sizeSmallImg} = this.props;
    return this.image(
      this.props.conversation,
      this.props.userID,
      style,
      sizeSmallImg,
    );
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
