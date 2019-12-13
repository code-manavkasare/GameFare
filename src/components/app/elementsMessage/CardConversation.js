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

import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import AsyncImage from '../../layout/image/AsyncImage';
import AllIcons from '../../layout/icons/AllIcons';
const {height, width} = Dimensions.get('screen');

class CardConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      unreadMessages: 3,
    };
  }
  async componentDidMount() {
    console.log('this.;rops.conversation');
    console.log(this.props.conversation);
  }
  imageCard() {
    if (this.props.conversation.type === 'group') {
      return (
        <AsyncImage
          style={styles.roundImage}
          mainImage={this.props.conversation.image}
          imgInitial={this.props.conversation.image}
        />
      );
    }
    return (
      <View style={styles.roundImage}>
        <Text style={[styleApp.text, {fontSize: 13}]}>NG</Text>
      </View>
    );
  }
  titleConversation() {
    if (this.props.conversation.type === 'group')
      return this.props.conversation.title;
    return 'Name member';
  }
  lastMessage() {
    return (
      <Text
        style={[
          styleApp.smallText,
          {fontSize: 12, marginTop: 2, color: colors.greyDark},
        ]}>
        coucou
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
              <Col size={3} style={styleApp.center2}>
                {/* <Text style={[styleApp.input, {color: colors.green}]}>•</Text> */}
              </Col>
              <Col size={15} style={styleApp.center2}>
                {this.imageCard()}
              </Col>
              <Col size={75} style={[styleApp.center2, {paddingLeft: 5}]}>
                <Text style={styleApp.text}>{this.titleConversation()}</Text>
                {this.lastMessage()}
                {/* <Text
                    style={[
                      styleApp.smallText,
                      {fontSize: 12, marginTop: 2, color: colors.greyDark},
                    ]}>
                    {Object.values(conversation.messages)[0].text.slice(0, 70)}
                    ...
                  </Text> */}
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
          NavigationService.navigate('Conversation', {conversationID: 'convo1'})
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

const mapStateToProps = state => {
  return {
    conversations: state.conversations,
    userID: state.user.userID,
  };
};

const styles = StyleSheet.create({
  roundImage: {
    ...styleApp.center,
    backgroundColor: colors.off2,
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
});

export default connect(mapStateToProps, {historicSearchAction})(
  CardConversation,
);
