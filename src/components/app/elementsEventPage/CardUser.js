import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import NavigationService from '../../../../NavigationService';
import firebase from 'react-native-firebase';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';

import ButtonColor from '../../layout/Views/Button';
import AsyncImage from '../../layout/image/AsyncImage';
import AllIcons from '../../layout/icons/AllIcons';
import Loader from '../../layout/loaders/Loader';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

import {createDiscussion, searchDiscussion} from '../../functions/message';

export default class CardUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {}
  async onClick(user) {
    // poor solution for the need to remove players from group/event
    // good target for split of UI/logic into different components
    // same for discussions
    if (this.props.removable) {
      const {removeFunc} = this.props;
      removeFunc();
      return;
    }
    if (!this.props.userConnected) return NavigationService.navigate('SignIn');
    if (this.props.userID === user.id) return true;
    await this.setState({loader: true});
    // return true;
    var discussion = await searchDiscussion([this.props.userID, user.id], 2);

    //return false;
    if (!discussion) {
      discussion = await createDiscussion(
        {
          0: {
            id: user.id,
            info: user.info,
          },
          1: {
            id: this.props.userID,
            info: this.props.infoUser,
          },
        },
        'General',
      );
      if (!discussion) {
        await this.setState({loader: false});
        return NavigationService.navigate('Alert', {
          close: true,
          title: 'An unexpected error has occured.',
          subtitle: 'Please contact us.',
          textButton: 'Got it!',
        });
      }
    }
    await NavigationService.navigate('Conversation', {data: discussion});
    await this.setState({loader: false});
    return true;
  }
  button(method, text, color) {
    return (
      <ButtonColor
        view={() => (
          <Text style={[styleApp.text, {color: colors.white}]}>{text}</Text>
        )}
        style={{height: 45, borderRadius: 5}}
        click={() => method()}
        color={color}
        onPressColor={color}
      />
    );
  }

  accept(user, status, verb, textButton) {
    NavigationService.navigate('Alert', {
      title:
        'Do you want to ' + verb + ' ' + user.info.firstname + "'s request?",
      textButton: textButton,
      onGoBack: () => this.confirmAccept(user, status),
    });
  }
  async confirmAccept(user, status) {
    if (this.props.type === 'group') {
      await firebase
        .database()
        .ref('groups/' + this.props.objectID + '/members/' + user.id)
        .update({status: status});
    } else {
      return true;
      await firebase
        .database()
        .ref('events/' + this.props.objectID + '/attendees/' + user.id)
        .update({status: status});
    }
    return NavigationService.goBack();
  }
  rowAcceptRequest(user) {
    return (
      <Row style={{paddingLeft: 20, paddingRight: 20, marginTop: 5}}>
        <Col size={48}>
          {this.button(
            () => this.accept(user, 'declined', 'decline', 'Decline'),
            'Decline',
            colors.red,
          )}
        </Col>
        <Col size={4}></Col>
        <Col size={48}>
          {this.button(
            () => this.accept(user, 'confirmed', 'accept', 'Confirm'),
            'Confirm',
            colors.green,
          )}
        </Col>
      </Row>
    );
  }
  cardUser(user) {
    return (
      <View>
        <ButtonColor
          view={() => {
            return (
              <Row>
                <Col size={15} style={styleApp.center2}>
                  {user.info.picture ? (
                    <AsyncImage
                      style={styleApp.roundView2}
                      mainImage={user.info.picture}
                      imgInitial={user.info.picture}
                    />
                  ) : (
                    <View style={styleApp.roundView2}>
                      <Text style={[styleApp.input, {fontSize: 11}]}>
                        {user.info.firstname[0] + user.info.lastname[0]}
                      </Text>
                    </View>
                  )}
                </Col>
                <Col size={75} style={[styleApp.center2, {paddingLeft: 10}]}>
                  <Text style={styleApp.text}>
                    {user.info.firstname} {user.info.lastname}
                  </Text>
                </Col>
                <Col size={10} style={styleApp.center}>
                  {user.status === 'declined' && (
                    <AllIcons
                      name="times"
                      type="font"
                      color={colors.red}
                      size={17}
                    />
                  )}
                </Col>
                <Col size={10} style={styleApp.center3}>
                  {this.state.loader ? (
                    <Loader size={20} color="green" />
                  ) : this.props.userID !== user.id ? (
                    <AllIcons
                      name="envelope"
                      type="font"
                      color={colors.green}
                      size={17}
                    />
                  ) : user.status === 'pending' ? (
                    <AllIcons
                      name="redo-alt"
                      type="font"
                      color={colors.secondary}
                      size={17}
                    />
                  ) : null}
                </Col>
              </Row>
            );
          }}
          click={() => this.onClick(user)}
          color="white"
          style={{
            width: width,
            height: 55,
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 5,
          }}
          onPressColor={colors.off}
        />
        {this.props.admin &&
          user.status === 'pending' &&
          this.rowAcceptRequest(user)}
      </View>
    );
  }

  render() {
    return this.cardUser(this.props.user, this.props.userID);
  }
}
