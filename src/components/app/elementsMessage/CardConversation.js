import React from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import {Col, Row, Grid} from 'react-native-easy-grid';
import NavigationService from '../../../../NavigationService';
import firebase from 'react-native-firebase';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import AsyncImage from '../../layout/image/AsyncImage';
import AllIcons from '../../layout/icons/AllIcons';

class CardConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      lastMessage: null,
    };
  }
  async componentDidMount() {
    var lastMessage = await firebase
      .database()
      .ref('discussions/' + this.props.discussion.objectID + '/messages')
      .limitToLast(1)
      .once('value');
    lastMessage = lastMessage.val();

    if (lastMessage === null) lastMessage = [{text: 'Write the first message'}];
    await this.props.messageAction('setConversation', {
      ...this.props.discussion,
      lastMessage: lastMessage,
      lastMessageRead: this.checkLastMessageRead(),
    });
    return this.setState({lastMessage: Object.values(lastMessage)[0]});
  }

  imageCard(conversation) {
    if (this.props.discussion.type === 'group') {
      return (
        <AsyncImage
          style={styles.roundImage}
          mainImage={conversation.image}
          imgInitial={conversation.image}
        />
      );
    }
    if (this.infoOtherMember(conversation).picture) {
      return (
        <AsyncImage
          style={styles.roundImage}
          mainImage={this.infoOtherMember(conversation).picture}
          imgInitial={this.infoOtherMember(conversation).picture}
        />
      );
    }
    return (
      <View style={styles.roundImage}>
        {this.infoOtherMember(conversation).firstname ? (
          <Text style={[styleApp.text, {fontSize: 13}]}>
            {this.infoOtherMember(conversation).firstname[0] +
              this.infoOtherMember(conversation).lastname[0]}
          </Text>
        ) : (
          <Text style={[styleApp.text, {fontSize: 13}]}>GF</Text>
        )}
      </View>
    );
  }
  infoOtherMember(conversation) {
    if (
      Object.values(conversation.members).filter(
        (user) => user.id !== this.props.userID,
      ).length === 0
    )
      return Object.values(conversation.members)[0].info;
    return Object.values(conversation.members).filter(
      (user) => user.id !== this.props.userID,
    )[0].info;
  }
  titleConversation(conversation) {
    if (conversation.type === 'group') return conversation.title;
    return (
      this.infoOtherMember(conversation).firstname +
      ' ' +
      this.infoOtherMember(conversation).lastname
    );
  }
  lastMessage() {
    if (!this.state.lastMessage)
      return (
        <View
          style={{
            height: 15,
            width: '80%',
            borderRadius: 4,
            marginTop: 4,
            backgroundColor: colors.off2,
          }}
        />
      );

    return (
      <Text
        style={[
          this.checkLastMessageRead() ? styleApp.input : styleApp.smallText,
          {fontSize: 13, marginTop: 2, color: colors.title},
        ]}>
        {this.state.lastMessage.text === '' && this.state.lastMessage.images
          ? Object.values(this.state.lastMessage.images).length + ' file sent'
          : this.state.lastMessage.text}
      </Text>
    );
  }
  checkLastMessageRead() {
    if (!this.props.conversations[this.props.discussion.objectID]) return false;
    else if (
      !this.props.conversations[this.props.discussion.objectID].lastMessageRead
    )
      return true;
    return false;
  }

  cardConversation(conversation, i) {
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center2}>
                {this.imageCard(conversation)}
              </Col>
              <Col size={60} style={[styleApp.center2, {paddingLeft: 5}]}>
                <Text style={[styleApp.text, {fontSize: 18}]}>
                  {this.titleConversation(conversation)}
                </Text>
                {this.lastMessage()}
              </Col>
              <Col size={5} style={styleApp.center2}>
                {this.checkLastMessageRead() && (
                  <View
                    style={{
                      backgroundColor: colors.blue,
                      height: 15,
                      width: 15,
                      borderRadius: 10,
                    }}
                  />
                )}
              </Col>
              {/* <Col size={10} style={styleApp.center3}>
                <AllIcons
                  name="keyboard-arrow-right"
                  type="mat"
                  size={20}
                  color={colors.grey}
                />
              </Col> */}
            </Row>
          );
        }}
        click={() => {
          this.props.messageAction('setConversation', {
            ...this.props.discussion,
            lastMessageRead: true,
          });
          NavigationService.push('Conversation', {
            data: conversation,
          });
        }}
        color="white"
        style={styleApp.cardConversation}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardConversation(this.props.discussion, this.props.index);
  }
}

const mapStateToProps = (state) => {
  return {
    conversations: state.message.conversations,
    userID: state.user.userID,
  };
};

const styles = StyleSheet.create({
  roundImage: {
    ...styleApp.center,
    backgroundColor: colors.off2,
    width: 55,
    height: 55,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
});

export default connect(mapStateToProps, {historicSearchAction, messageAction})(
  CardConversation,
);
