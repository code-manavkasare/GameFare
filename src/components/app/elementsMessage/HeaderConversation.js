import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {connect} from 'react-redux';

import styleApp from '../../style/style';
import colors from '../../style/colors';

import {openSession, sessionOpening} from '../../functions/coach';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ImageConversation from '../../layout/image/ImageConversation';
import {titleConversation} from '../../functions/message';

class HeaderConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }

  async openSession() {
    const {conversation, infoUser, userID} = this.props;
    await this.setState({loader: true});

    const session = await openSession(
      {id: userID, info: infoUser},
      conversation.members,
    );

    sessionOpening(session);
    await this.setState({loader: false});
  }
  header() {
    const {
      navigation,
      conversation,
      userID,
      AnimatedHeaderValue,
      loader: propsLoader,
      back,
    } = this.props;
    const {loader} = this.state;
    return (
      <HeaderBackButton
        AnimatedHeaderValue={AnimatedHeaderValue}
        textHeader={
          !propsLoader &&
          titleConversation(conversation, userID, conversation.members)
        }
        imgHeader={
          !propsLoader && (
            <ImageConversation
              members={conversation.members}
              conversation={conversation}
              style={styleApp.roundView2}
              sizeSmallImg={25}
            />
          )
        }
        loader={loader || propsLoader}
        inputRange={[50, 80]}
        initialBorderColorIcon={'white'}
        initialBackgroundColor={'white'}
        typeIcon2={'moon'}
        initialBorderWidth={1}
        initialBorderColorHeader={colors.off}
        sizeIcon2={26}
        initialTitleOpacity={1}
        icon1={'arrow-left'}
        icon2={'film'}
        clickButton1={() =>
          back ? navigation.goBack() : navigation.dangerouslyGetParent().pop()
        }
        clickButton2={() => this.openSession()}
      />
    );
  }
  render() {
    return this.header();
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(HeaderConversation);
