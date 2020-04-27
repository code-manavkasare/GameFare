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
import NavigationService from '../../../../NavigationService';
import database from '@react-native-firebase/database';

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
import {TouchableOpacity} from 'react-native-gesture-handler';

export default class CardUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {}
  async onClick(user) {
    if (this.props.removable) {
      const {removeFunc} = this.props;
      removeFunc(user);
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
      await database()
        .ref('groups/' + this.props.objectID + '/members/' + user.id)
        .update({status: status});
    } else {
      await database()
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
        <Col size={4} />
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
    let {status} = this.props;
    if (!status) status = user.status;
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
                  {status === 'declined' ? (
                    <Col
                      size={10}
                      style={styleApp.center}
                      activeOpacity={0.7}
                      onPress={() =>
                        NavigationService.navigate('Alert', {
                          close: true,
                          textButton: 'Got it!',
                          title:
                            'You have declined this player’s joining request.',
                        })
                      }>
                      <Image
                        source={require('../../../img/icons/traffic.png')}
                        style={{width: 17, height: 17}}
                      />
                    </Col>
                  ) : status === 'pending' && this.props.userID !== user.id ? (
                    <Col
                      size={10}
                      style={styleApp.center}
                      activeOpacity={0.7}
                      onPress={() =>
                        NavigationService.navigate('Alert', {
                          close: true,
                          textButton: 'Got it!',
                          title:
                            'Your joining request is pending admin approval.',
                        })
                      }>
                      <AllIcons
                        name="redo-alt"
                        type="font"
                        color={colors.secondary}
                        size={17}
                      />
                    </Col>
                  ) : (
                    <Col size={10} />
                  )}
                </Col>
                <Col size={10} style={styleApp.center3}>
                  {this.state.loader ? (
                    <Loader size={20} color="green" />
                  ) : this.props.removable ? (
                    <AllIcons
                      name="minus"
                      type="font"
                      color={colors.red}
                      size={17}
                    />
                  ) : this.props.userID !== user.id ? (
                    <AllIcons
                      name="envelope"
                      type="font"
                      color={colors.green}
                      size={17}
                    />
                  ) : status === 'pending' ? (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        NavigationService.navigate('Alert', {
                          close: true,
                          textButton: 'Got it!',
                          title:
                            'Your joining request is pending admin approval.',
                        })
                      }>
                      <AllIcons
                        name="redo-alt"
                        type="font"
                        color={colors.secondary}
                        size={17}
                      />
                    </TouchableOpacity>
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
          status === 'pending' &&
          this.rowAcceptRequest(user)}
      </View>
    );
  }

  render() {
    const {user, userID} = this.props;
    return this.cardUser(user, userID);
  }
}
