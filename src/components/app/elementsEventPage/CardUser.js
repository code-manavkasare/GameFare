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
  async openDiscussion(user) {
    if (!this.props.userConnected) return NavigationService.navigate('SignIn');
    if (this.props.userID === user.id) return true;
    await this.setState({loader: true});
    // return true;
    var discussion = await searchDiscussion([this.props.userID, user.id]);

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
  }
  cardUser(user) {
    return (
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
              <Col size={65} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text style={styleApp.text}>
                  {user.info.firstname} {user.info.lastname}
                </Text>
              </Col>
              <Col size={20} style={styleApp.center3}>
                {this.state.loader ? (
                  <Loader size={20} color="green" />
                ) : this.props.userID !== user.id ? (
                  <AllIcons
                    name="envelope"
                    type="font"
                    color={colors.green}
                    size={17}
                  />
                ) : null}
              </Col>
            </Row>
          );
        }}
        click={() => this.openDiscussion(user)}
        color="white"
        style={{width: width, height: 55, paddingLeft: 20, paddingRight: 20}}
        onPressColor={colors.off}
      />
    );
  }

  render() {
    return this.cardUser(this.props.user, this.props.userID);
  }
}
