import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';

import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import {navigate} from '../../../../NavigationService';
import PlaceHolder from '../../placeHolders/CardConversation';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import {bindConversation} from '../../functions/message';
import ImageUser from '../../layout/image/ImageUser';

class CardConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      lastMessage: null,
      members: {},
      membersFetched: false,
      title: '',
    };
  }
  async componentDidMount() {
    const {objectID} = this.props;
    bindConversation(objectID);
  }

  async clickCard() {
    const {objectID} = this.props;
    navigate('Conversation', {
      coachSessionID: objectID,
    });
  }

  cardConversation(conversation, lastMessage, i) {
    const {messages} = this.props;

    return (
      <ButtonColor
        key={i}
        view={() => {
          if (!messages) return <PlaceHolder />;
          let lastMessage = Object.values(messages)[0];
          const {user, text} = lastMessage;

          return (
            <Row>
              <Col size={30} style={styleApp.center}>
                <ImageUser
                  onClick={() => true}
                  user={user}
                  styleImgProps={{height: 45, width: 45, borderRadius: 30}}
                />
              </Col>
              <Col size={75} style={styleApp.center2}>
                <Text style={[styleApp.title, {fontSize: 17}]}>
                  {user.info.firstname} {user.info.lastname}
                </Text>
                <Text style={styleApp.text}>{lastMessage.text}</Text>
              </Col>
            </Row>
          );
        }}
        click={() => this.clickCard(conversation, lastMessage)}
        color={colors.white}
        style={styleApp.cardConversation}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardConversation();
  }
}

const mapStateToProps = (state, props) => {
  return {
    messages: state.conversations[props.objectID],
    userID: state.user.userID,
  };
};

const styles = StyleSheet.create({});

export default connect(
  mapStateToProps,
  {historicSearchAction, messageAction},
)(CardConversation);
