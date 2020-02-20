import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Keyboard,
  Dimensions,
  InputAccessoryView,
  View,
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';

import NavigationService from '../../../../NavigationService';

import {
  takePicture,
  pickLibrary,
  resize,
  uploadPictureFirebase,
} from '../../functions/pictures';
import AsyncImage from '../../layout/image/AsyncImage';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import AllIcons from '../../layout/icons/AllIcons';
import ButtonColor from '../../layout/Views/Button';
import ButtonFull from '../../layout/buttons/ButtonFull';

const {height, width} = Dimensions.get('screen');

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

    let profilePictureUrl = false;
    if (pictureUri !== '') {
      profilePictureUrl = await uploadPictureFirebase(
        pictureUri,
        'users/' + userID + '/userInfo/',
      );
    }

    await firebase
      .database()
      .ref('users/' + userID + '/userInfo/')
      .update({
        firstname,
        lastname,
        picture: profilePictureUrl,
      });

    await firebase
      .database()
      .ref('users/' + this.props.params.userID)
      .update({profileCompleted: true});
    await Keyboard.dismiss();
    var that = this;
    setTimeout(function() {
      that.props.dismiss();
    }, 550);
  }

  async addPicture(val) {
    await this.setState({loader: true});
    if (val === 'take') {
      var uri = await takePicture();
    } else if (val === 'pick') {
      var uri = await pickLibrary();
    }
    const uriResized = await resize(uri);
    await this.setState({
      pictureUri: uriResized,
      loader: false,
    });
    this.focusOnText();
  }

  focusOnText = () => {
    const {firstname, lastname} = this.state;
    if (firstname === '' && lastname === '') this.firstnameInput.focus();
    if (firstname !== '') this.lastnameInput.focus();
  };

  render() {
    const {firstname, lastname, loader, pictureUri} = this.state;

    return (
      <View style={styles.content}>
        <Text style={[styleApp.title, {marginBottom: 20, fontSize: 21}]}>
          Complete your profile
        </Text>

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
        <Row style={[styleApp.inputForm, {marginTop: 10}]}>
          <Col style={styleApp.center2}>
            <TextInput
              style={styleApp.input}
              placeholder="Last name"
              returnKeyType={'done'}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={true}
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
        <Row>
          <Col style={styleApp.center}>
            {pictureUri === '' ? (
              <ButtonColor
                color={colors.grey}
                onPressColor={colors.off}
                click={() =>
                  NavigationService.navigate('AlertAddImage', {
                    title: 'Add picture',
                    onGoBack: (val) => {
                      this.addPicture(val);
                    },
                  })
                }
                style={[styles.buttonRound]}
                view={() => {
                  return (
                    <View style={styleApp.center}>
                      <AllIcons
                        name={'image'}
                        color={colors.green}
                        size={50}
                        type="font"
                      />
                      <Text style={styles.textButton}>Add Profil Picture</Text>
                      <Text style={styles.textButton}>(optionnal)</Text>
                    </View>
                  );
                }}
              />
            ) : (
              <ButtonColor
                color={colors.grey}
                onPressColor={colors.off}
                click={() =>
                  NavigationService.navigate('AlertAddImage', {
                    title: 'Add picture',
                    onGoBack: (val) => {
                      this.addPicture(val);
                    },
                  })
                }
                style={[styles.buttonRound]}
                view={() => {
                  return (
                    <AsyncImage
                      style={styles.asyncImage}
                      mainImage={pictureUri}
                    />
                  );
                }}
              />
            )}
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
    width: 200,
    height: 200,
    borderRadius: 200,
    marginTop: 80,
  },
  asyncImage: {
    width: 200,
    height: 200,
    borderRadius: 200,
    zIndex: 9,
  },
  textButton: {
    color: colors.green,
    fontSize: 18,
  },
});
