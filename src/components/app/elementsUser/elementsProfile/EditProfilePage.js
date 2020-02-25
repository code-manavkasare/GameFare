import React, {Component} from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';

import NavigationService from '../../../../../NavigationService';

import {
  takePicture,
  pickLibrary,
  resize,
  uploadPictureFirebase,
} from '../../../functions/pictures';
import AsyncImage from '../../../layout/image/AsyncImage';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import sizes from '../../../style/sizes';
import AllIcons from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import Button from '../../../layout/buttons/Button';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

class EditProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      loaderPhoto: false,
      firstname: '',
      lastname: '',
      pictureUri: false,
      pictureUrl: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount = async () => {
    const {firstname, lastname, picture} = this.props.infoUser;

    await this.setState({
      firstname,
      lastname,
      pictureUrl: picture ? picture : false,
    });
  };

  async updateProfile() {
    this.setState({loader: true});
    const {userID} = this.props;
    const {firstname, lastname, pictureUri, pictureUrl} = this.state;

    let newProfilePictureUrl = false;
    if (pictureUri) {
      newProfilePictureUrl = await uploadPictureFirebase(
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
        picture: newProfilePictureUrl ? newProfilePictureUrl : pictureUrl,
      });
    this.setState({loader: false});
    this.props.navigation.navigate('More');
  }

  async addPicture(val) {
    await this.setState({loaderPhoto: true});
    if (val === 'take') {
      var uri = await takePicture();
    } else if (val === 'pick') {
      var uri = await pickLibrary();
    }
    if (!uri) {
      await this.setState({
        loaderPhoto: false,
      });
    }

    const uriResized = await resize(uri);
    await this.setState({
      pictureUri: uriResized,
      loaderPhoto: false,
    });
  }

  buttonPicture(pictureUrl, pictureUri) {
    return (
      <ButtonColor
        color={colors.white}
        onPressColor={colors.white}
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
          if (pictureUrl && !pictureUri) {
            return (
              <AsyncImage style={styles.asyncImage} mainImage={pictureUrl} />
            );
          }
          return !pictureUri ? (
            <View style={styleApp.center}>
              <AllIcons
                name={'image'}
                color={colors.title}
                size={40}
                type="font"
              />
              <Text style={styleApp.text}>Add profile</Text>
              <Text style={styleApp.text}>picture</Text>
            </View>
          ) : (
            <View style={styleApp.center}>
              <AsyncImage style={styles.asyncImage} mainImage={pictureUri} />
            </View>
          );
        }}
      />
    );
  }
  render() {
    const {
      firstname,
      lastname,
      loader,
      loaderPhoto,
      pictureUri,
      pictureUrl,
    } = this.state;

    return (
      <View style={styles.content}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          close={() => this.props.navigation.navigate('ProfilePage')}
          textHeader={'Edit Profile'}
          inputRange={[5, 10]}
          loader={loaderPhoto}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialBorderColorHeader={colors.grey}
          initialTitleOpacity={1}
          icon1={'arrow-left'}
          clickButton1={() => this.props.navigation.navigate('More')}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          showsVerticalScrollIndicator={true}>
          <Row>
            <Col size={20} style={styleApp.center2}>
              {this.buttonPicture(pictureUrl, pictureUri, loaderPhoto)}
            </Col>
            <Col size={40}>
              <Text style={[styleApp.title, {marginBottom: 0, fontSize: 16}]}>
                First name
              </Text>
              <Row style={styleApp.inputForm}>
                <Col style={styleApp.center2}>
                  <TextInput
                    style={styleApp.input}
                    placeholder="First name"
                    autoCorrect={true}
                    underlineColorAndroid="rgba(0,0,0,0)"
                    blurOnSubmit={true}
                    returnKeyType={'done'}
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
                    blurOnSubmit={true}
                    onChangeText={(text) => this.setState({lastname: text})}
                    value={lastname}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </ScrollView>

        <View style={[styleApp.footerBooking, styleApp.marginView]}>
          <Button
            text="Update Profile"
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            loader={loader}
            click={() => this.updateProfile()}
          />
        </View>
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

const mapStateToProps = (state) => {
  return {
    infoUser: state.user.infoUser.userInfo,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(EditProfilePage);
