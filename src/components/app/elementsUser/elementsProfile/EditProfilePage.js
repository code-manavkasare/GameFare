import React, {Component} from 'react';
import {Animated, Text, TextInput, View, ScrollView} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {uploadPictureFirebase} from '../../../functions/pictures';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {heightHeaderModal, heightFooter} from '../../../style/sizes';

import Button from '../../../layout/buttons/Button';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ButtonAddImage from '../../../layout/buttons/ButtonAddImage';
import {
  userIDSelector,
  userInfoSelector,
} from '../../../../store/selectors/user';

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
  static getDerivedStateFromProps(props, state) {
    const {firstname, lastname, picture} = props.infoUser;
    return {
      firstname,
      lastname,
      pictureUrl: picture ? picture : false,
    };
  }

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

    await database()
      .ref('users/' + userID + '/userInfo/')
      .update({
        firstname,
        lastname,
        picture: newProfilePictureUrl ? newProfilePictureUrl : pictureUrl,
      });
    this.setState({loader: false});
    this.props.navigation.goBack();
  }
  buttonPicture(pictureUrl, pictureUri) {
    const {navigation} = this.props;
    return (
      <ButtonAddImage
        title={'Add profile'}
        title2={'picture'}
        img={pictureUri ? pictureUri : pictureUrl}
        setState={(uri) => this.setState({pictureUri: uri})}
        styleImg={{height: 70, width: 70, borderRadius: 35}}
        closeAddImage={() => navigation.navigate('EditProfilePage')}
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
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Edit Profile'}
          inputRange={[0, 50]}
          initialBorderColorIcon={colors.white}
          initialBackgroundColor={'white'}
          icon1={'chevron-left'}
          sizeIcon1={17}
          initialBorderColorHeader={colors.off}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          clickButton1={() => navigation.goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginBottomScrollView={0}
          marginTop={heightHeaderModal + 20}
          showsVerticalScrollIndicator={true}>
          <Row style={{paddingLeft: 20, paddingRight: 20, marginTop: 40}}>
            <Col size={20} style={styleApp.center2}>
              {this.buttonPicture(pictureUrl, pictureUri, loaderPhoto)}
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

        <View
          style={[
            styleApp.footerBooking,
            styleApp.marginView,
            {bottom: heightFooter + 20},
          ]}>
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

const mapStateToProps = (state) => {
  return {
    infoUser: userInfoSelector(state),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(EditProfilePage);
