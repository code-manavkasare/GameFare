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
    console.log('this.;rops.conversation');
    console.log(this.props.conversation);
    var lastMessage = await firebase
      .database()
      .ref('discussions/' + this.props.conversation.objectID + '/messages')
      .limitToLast(1)
      .once('value');
    lastMessage = lastMessage.val();
    console.log('le last message');
    console.log(lastMessage);
    if (lastMessage === null) lastMessage = [{text: 'Write the first message'}];
    return this.setState({lastMessage: Object.values(lastMessage)[0]});
  }
  imageCard(conversation) {
    console.log('conversation');
    console.log(conversation);
    if (this.props.conversation.type === 'group') {
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
    console.log('nggggggfgf');
    console.log(this.infoOtherMember(conversation));
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
    console.log('display last message');
    console.log(this.state.lastMessage);
    return (
      <Text
        style={[
          styleApp.smallText,
          {fontSize: 13, marginTop: 2, color: colors.greyDark},
        ]}>
        {this.state.lastMessage === ''
          ? '...'
          : this.state.lastMessage.type === 'img'
          ? '1 picture sent'
          : this.state.lastMessage.text}
      </Text>
    );
  }
  cardConversation(conversation, i) {
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              {/* <Col size={3} style={styleApp.center2}>
                <Text style={[styleApp.input, {color: colors.green}]}>•</Text>
              </Col> */}
              <Col size={20} style={styleApp.center2}>
                {this.imageCard(conversation)}
              </Col>
              <Col size={70} style={[styleApp.center2, {paddingLeft: 5}]}>
                <Text style={[styleApp.text, {fontSize: 18}]}>
                  {this.titleConversation(conversation)}
                </Text>
                {this.lastMessage()}
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  name="keyboard-arrow-right"
                  type="mat"
                  size={20}
                  color={colors.grey}
                />
              </Col>
            </Row>
          );
        }}
        click={() =>
          NavigationService.push('Conversation', {
            data: conversation,
          })
        }
        color="white"
        style={styleApp.cardConversation}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardConversation(this.props.conversation, this.props.index);
  }
}

const mapStateToProps = (state) => {
  return {
    conversations: state.conversations,
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

export default connect(mapStateToProps, {historicSearchAction})(
  CardConversation,
);
