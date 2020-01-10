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

export default class ListPhotos extends Component {
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
    console.log('list photo mount', this.props);
  }

  buttonImage(data, i) {
    console.log('image data', data);
    // return null;
    return (
      <CardContent
        style={{
          height: '100%',
          width: 200,
          borderRadius: 4,
          marginRight: 10,
          borderColor: colors.grey,
          borderWidth: 0,
          overflow: 'hidden',
        }}
        selectImage={(uri, type, duration, selected) =>
          this.addPicture(uri, type, selected, duration)
        }
        image={data}
        imagesSelected={this.props.imagesSelected}
        key={i}
        index={i}
      />
    );
  }
  addPicture(uri, type, selected, duration) {
    console.log('selecteed', selected);
    this.props.addImage(
      {
        id: !selected ? uri : generateID(),
        type: type,
        duration: duration,
        uploaded: false,
        uri: uri,
      },
      selected,
    );
  }
  render() {
    return (
      <View>
        <ScrollView
          horizontal
          keyboardShouldPersistTaps={'always'}
          style={[styles.keyboardContainer]}
          showsHorizontalScrollIndicator={false}>
          {this.props.images === 'loading' ? (
            <View style={{height: 100, backgroundColor: 'yellow'}}></View>
          ) : (
            this.props.images.map((data, i) => this.buttonImage(data, i))
          )}
          <View style={{width: 20}}></View>
        </ScrollView>
        {/* <ButtonColor
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
        /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: width,
    height: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor: 'blue',
    //  position: 'absolute',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
