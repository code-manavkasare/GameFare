import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import FadeInView from 'react-native-fade-in-view';
import {Col, Row} from 'react-native-easy-grid';

import {
  takePicture,
  getPhotoUser,
  pickLibrary,
  permission,
} from '../../functions/pictures';
import {generateID} from '../../functions/utility.js';
import {
  sendNewMessage,
  nameOtherMemberConversation,
} from '../../functions/message';
import {selectVideosFromLibrary} from '../../functions/coach';

import styleApp from '../../style/style';
import colors from '../../style/colors';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import ListPhotos from './ListPhotos';
import NavigationService from '../../../../NavigationService';

class InputMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: this.props.initialMessage,
      images: {},
      imagesUser: [],
      showImages: false,
    };
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    const {initialMessage} = this.props;
    if (initialMessage !== '') {
      this.textInputRef.focus();
    }
  }

  async sendNewMessage() {
    const {inputValue, images} = this.state;
    const {user, discussion} = this.props;
    const {objectID} = discussion;

    await this.setState({inputValue: '', images: {}});
    await sendNewMessage({objectID, user, text: inputValue, images});

    return true;
  }
  async openPicturesView() {
    if (!this.state.showImages) {
      await this.textInputRef.blur();
      const imagesUser = await getPhotoUser();
      return this.setState({imagesUser: imagesUser, showImages: true});
    }
    return this.setState({showImages: false});
  }
  addImage(image, val) {
    if (!val) {
      var images = this.state.images;
      delete images[image.id];
      return this.setState({
        images: images,
      });
    }
    return this.setState({
      images: {
        ...this.state.images,
        [image.id]: image,
      },
    });
  }
  async takePicture() {
    const picture = await takePicture();
    if (picture) {
      return this.addImage(
        {uri: picture, type: 'image', id: generateID(), uploaded: false},
        true,
      );
    }
    return true;
  }
  async selectPicture() {
    const permissionLibrary = await permission('library');
    if (!permissionLibrary) {
      return this.setState({showImages: true, imagesUser: false});
    }
    var picture = await pickLibrary();
    if (picture) {
      return this.addImage(
        {
          uri: picture,
          type: 'image',
          id: generateID(),
          uploaded: false,
          duration: 0,
        },
        true,
      );
    }
    return true;
  }
  conditionInputOn() {
    if (
      this.state.inputValue === '' &&
      Object.values(this.state.images).length === 0
    ) {
      return false;
    }
    return true;
  }
  placeholderInput = () => {
    const {discussion, userID} = this.props;
    let placeholderInput = '';
    if (discussion.members) {
      placeholderInput = `Send a message to ${nameOtherMemberConversation(
        userID,
        discussion.members,
      )}`;
    } else {
      placeholderInput = 'Send a message';
    }
    return placeholderInput;
  };
  renderInput() {
    const {showImages} = this.state;
    const {discussion} = this.props;
    const {objectID} = discussion;
    return (
      <View style={styles.keyboardContainer}>
        <AutoGrowingTextInput
          maxHeight={200}
          style={styles.textInput}
          ref={(r) => {
            this.textInputRef = r;
          }}
          placeholderTextColor={colors.greyDark}
          enableScrollToCaret
          value={this.state.inputValue}
          placeholder={this.placeholderInput()}
          onChangeText={(text) => this.setState({inputValue: text})}
          underlineColorAndroid="transparent"
        />

        {Object.values(this.state.images).length !== 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scrollViewImages}>
            {Object.values(this.state.images).map((image, i) => (
              <FadeInView duration={250} style={{marginRight: 10}}>
                <TouchableOpacity
                  style={styles.buttonCloseImg}
                  activeOpacity={0.8}
                  onPress={() => this.addImage(image, false)}>
                  <AllIcons name="times" type="font" color="white" size={8} />
                </TouchableOpacity>
                <Image
                  source={{uri: image.uri}}
                  key={i}
                  style={{height: 45, width: 45, borderRadius: 5}}
                />
              </FadeInView>
            ))}
            <View style={{width: 30}} />
          </ScrollView>
        ) : null}

        <Row style={styles.rowUtils}>
          {/* <Col
            size={12}
            style={styleApp.center2}
            activeOpacity={0.7}
            onPress={() => this.takePicture()}>
            <AllIcons
              name="camera"
              color={colors.title}
              type="moon"
              size={24}
            />
          </Col> */}
          <Col
            size={12}
            style={styleApp.center2}
            activeOpacity={0.7}
            onPress={() => selectVideosFromLibrary(objectID)}>
            <AllIcons
              name="galery"
              color={!this.state.showImages ? colors.title : colors.primary}
              type="moon"
              size={24}
            />
          </Col>
          {/* <Col
            size={12}
            style={styleApp.center2}
            activeOpacity={0.7}
            onPress={() => this.selectPicture()}>
            <AllIcons
              name="dots-menu"
              color={colors.title}
              type="moon"
              size={20}
            />
          </Col> */}
          <Col size={50} style={styleApp.center2} />

          <Col
            size={20}
            style={styleApp.center3}
            onPress={() => this.conditionInputOn() && this.sendNewMessage()}>
            <AllIcons
              name={!this.conditionInputOn() ? 'send' : 'sendFull'}
              color={!this.conditionInputOn() ? colors.title : colors.primary}
              type="moon"
              size={24}
            />
          </Col>
        </Row>

        {showImages && (
          <View style={{height: 120, width: '100%'}}>
            <ListPhotos
              addImage={this.addImage.bind(this)}
              images={this.state.imagesUser}
              imagesSelected={this.state.images}
            />
          </View>
        )}
      </View>
    );
  }
  render() {
    return this.renderInput();
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    borderTopWidth: 1,
    borderColor: colors.off,
    ...Platform.select({
      ios: {
        flex: 1,
        backgroundColor: colors.white,
      },
    }),
  },
  scrollViewImages: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: '5%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  textInput: {
    flex: 1,
    ...styleApp.text,
    marginLeft: '5%',
    marginTop: 10,
    marginBottom: 10,
    paddingRight: '2.5%',
    paddingTop: 2,
    paddingBottom: 5,
    fontSize: 16,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 18,
  },
  buttonSend: {
    borderWidth: 0,
    height: 40,
    width: '100%',
    borderRadius: 20,
    alignSelf: 'center',
  },
  buttonCloseImg: {
    ...styleApp.center,
    position: 'absolute',
    height: 22,
    width: 22,
    borderRadius: 12.5,
    right: -7,
    top: -7,
    zIndex: 40,
    backgroundColor: colors.title,
    borderWidth: 2,
    borderColor: colors.white,
  },
  rowUtils: {
    paddingLeft: '5%',
    paddingRight: '5%',

    height: 50,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(InputMessage);
