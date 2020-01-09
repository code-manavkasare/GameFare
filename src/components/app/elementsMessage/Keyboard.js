import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Image,
} from 'react-native';
import {KeyboardRegistry} from 'react-native-keyboard-input';
import CameraRoll from '@react-native-community/cameraroll';
import {pickLibrary} from '../../functions/pictures';
import {generateID} from '../../functions/createGroup';

import AllIcons from '../../layout/icons/AllIcons';
import ButtonColor from '../../layout/Views/Button';
import StyleApp from '../../style/style';
const {height, width} = Dimensions.get('screen');
import {Col, Row} from 'react-native-easy-grid';

import CardContent from './CardContent';
import colors from '../../style/colors';

class KeyboardView extends Component {
  static propTypes = {
    title: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      pictures: 'loading',
    };
  }

  async componentDidMount() {
    console.log('pictures get 1');
    const pictures = await CameraRoll.getPhotos({
      first: 20,
      assetType: 'All',
    });
    this.setState({pictures: pictures.edges});
    console.log('pictures get', pictures);
  }
  //ph://F784985D-461B-4212-90E1-F01594E29D77/L0/001
  onButtonPress() {
    KeyboardRegistry.onItemSelected('KeyboardView', {
      message: 'item selected from KeyboardView',
    });
  }
  buttonImage(data, i) {
    console.log('image data', data);
    // return null;
    return (
      <CardContent
        style={{
          height: 250,
          width: 240,
          marginRight: 5,
          borderRadius: 0,
          borderColor: colors.grey,
          borderWidth: 0,
          overflow: 'hidden',
        }}
        selectImage={(uri, type, selected, duration) =>
          this.addPicture(uri, type, selected, duration)
        }
        image={data}
        key={i}
        index={i}
      />
    );
  }
  async selectPicture() {
    var picture = await pickLibrary();
    console.log('picture', picture);
    if (picture) return this.addPicture(picture, 'image', true);
    return true
  }
  addPicture(uri, type, selected, duration) {
    console.log('addPicture', {
      id: generateID(),
      type: type,
      duration: duration,
      uploaded: false,
      uri: uri,
    });
    KeyboardRegistry.onItemSelected('KeyboardView', {
      image: {
        id: generateID(),
        type: type,
        duration: duration,
        uploaded: false,
        uri: uri,
      },
      selected: selected,
    });
  }
  render() {
    return (
      <View>
        <ScrollView
          horizontal
          style={[styles.keyboardContainer]}
          showsHorizontalScrollIndicator={false}>
          {this.state.pictures === 'loading' ? (
            <View style={{height: 100, backgroundColor: 'yellow'}}></View>
          ) : (
            this.state.pictures.map((data, i) => this.buttonImage(data, i))
          )}
        </ScrollView>
        <ButtonColor
          view={() => {
            return (
              <AllIcons
                name="dots-menu"
                color={colors.white}
                type="moon"
                size={17}
              />
            );
          }}
          click={() => this.selectPicture()}
          color={colors.title}
          style={StyleApp.buttonRoundLibray}
          onPressColor={colors.off}
        />
      </View>
    );
  }
}

class AnotherKeyboardView extends Component {
  static propTypes = {
    title: PropTypes.string,
  };

  onButtonPress() {
    KeyboardRegistry.toggleExpandedKeyboard('AnotherKeyboardView');
  }

  render() {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.keyboardContainer,
          {backgroundColor: 'orange'},
        ]}>
        <Text>*** ANOTHER ONE ***</Text>
        <Text>{this.props.title}</Text>
        <TouchableOpacity
          testID={'toggle-fs'}
          style={{padding: 20, marginTop: 30, backgroundColor: 'white'}}
          onPress={() => this.onButtonPress()}>
          <Text>Toggle Full-Screen!</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: width,
    height: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor: 'blue',
    //  position: 'absolute',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});

KeyboardRegistry.registerKeyboard('KeyboardView', () => KeyboardView);
KeyboardRegistry.registerKeyboard(
  'AnotherKeyboardView',
  () => AnotherKeyboardView,
);
