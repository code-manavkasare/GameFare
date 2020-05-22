import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Keyboard,
  InputAccessoryView,
  View,
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';

import NavigationService from '../../../../NavigationService';

import {uploadPictureFirebase} from '../../functions/pictures';
import {timeout} from '../../functions/coach';

import colors from '../../style/colors';
import styleApp from '../../style/style';

import ButtonFull from '../../layout/buttons/ButtonFull';
import ButtonAddImage from '../../layout/buttons/ButtonAddImage';

export default class CompleteFields extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      firstname: '',
      lastname: '',
      pictureUri: '',
    };
  }

  async confirm() {
    this.setState({loader: true});
    const {userID} = this.props.params;
    const {firstname, lastname, pictureUri} = this.state;

    let profilePictureUrl = null;
    if (pictureUri !== '') {
      profilePictureUrl = await uploadPictureFirebase(
        pictureUri,
        'users/' + userID + '/userInfo/',
      );
    }

    let updates = {};
    updates[`users/${this.props.params.userID}/profileCompleted`] = true;
    updates[`users/${userID}/userInfo/firstname`] = firstname;
    updates[`users/${userID}/userInfo/lastname`] = lastname;
    updates[`users/${userID}/userInfo/picture`] = profilePictureUrl;

    await database()
      .ref()
      .update(updates);

    await Keyboard.dismiss();
    await timeout(550);
    this.props.dismiss();
  }
  focusOnText = () => {
    const {firstname, lastname} = this.state;
    if (firstname === '' && lastname === '') this.firstnameInput.focus();
    if (firstname !== '') this.lastnameInput.focus();
  };
  async closeAddImage() {
    await NavigationService.navigate('Complete');
    return this.focusOnText();
  }
  render() {
    const {firstname, lastname, loader, pictureUri} = this.state;
    return (
      <View style={styles.content}>
        <Text style={[styleApp.title, {marginBottom: 30, fontSize: 21}]}>
          Complete your profile
        </Text>

        <Row>
          <Col size={20} style={styleApp.center2}>
            <ButtonAddImage
              title={'Add profile'}
              title2={'picture'}
              img={pictureUri}
              setState={(uri) => this.setState({pictureUri: uri})}
              styleImg={{height: 70, width: 70, borderRadius: 35}}
              closeAddImage={() => this.closeAddImage()}
            />
          </Col>
          <Col size={3} />
          <Col size={40}>
            <Text style={[styleApp.title, {marginBottom: 0, fontSize: 16}]}>
              First name
            </Text>
            <Row style={styleApp.inputForm}>
              <Col style={styleApp.center2}>
                <TextInput
                  style={styleApp.input}
                  placeholder="First name"
                  autoFocus={true}
                  autoCorrect={true}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  blurOnSubmit={false}
                  returnKeyType={'done'}
                  ref={(input) => {
                    this.firstnameInput = input;
                  }}
                  inputAccessoryViewID={'firstname'}
                  onChangeText={(text) => this.setState({firstname: text})}
                  value={firstname}
                />
              </Col>
            </Row>
            <Text style={[styleApp.title, {marginTop: 20, fontSize: 16}]}>
              Last name
            </Text>
            <Row style={styleApp.inputForm}>
              <Col style={styleApp.center2}>
                <TextInput
                  style={styleApp.input}
                  placeholder="Last name"
                  returnKeyType={'done'}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  autoCorrect={true}
                  blurOnSubmit={false}
                  ref={(input) => {
                    this.lastnameInput = input;
                  }}
                  inputAccessoryViewID={'lastname'}
                  onFocus={() => {
                    this.setState({step: 'last'});
                  }}
                  onChangeText={(text) => this.setState({lastname: text})}
                  value={lastname}
                />
              </Col>
            </Row>
          </Col>
        </Row>

        <InputAccessoryView nativeID={'firstname'}>
          <ButtonFull
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            loader={loader}
            click={() => this.lastnameInput.focus()}
            enable={firstname !== ''}
            text={'Next'}
          />
        </InputAccessoryView>

        <InputAccessoryView nativeID={'lastname'}>
          <ButtonFull
            backgroundColor={'green'}
            onPressColor={colors.greenClick}
            loader={loader}
            click={() => this.confirm()}
            enable={firstname !== '' && lastname !== ''}
            text={'Complete profile'}
            ref={(input) => {
              this.inputLastname = input;
            }}
          />
        </InputAccessoryView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  buttonRound: {
    width: '90%',
    height: 120,
    borderRadius: 10,
  },
  asyncImage: {
    width: 90,
    height: 90,
    borderColor: colors.off,
    borderRadius: 45,
    position: 'absolute',
    zIndex: 0,
  },
});
