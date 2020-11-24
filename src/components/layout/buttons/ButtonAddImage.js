import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  Animated,
  Image,
  Keyboard,
  ActivityIndicator,
  View,
} from 'react-native';
import {navigate} from '../../../../NavigationService';
import colors from '../../style/colors';

import AllIcons from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';

import {takePicture, pickLibrary, resize} from '../../functions/pictures';
import AsyncImage from '../image/AsyncImage';
import ButtonColor from '../Views/Button';

export default class Button extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedButton = new Animated.Value(1);
  }
  async click(val) {
    const {closeAddImage} = this.props;
    await this.setState({loader: true});
    if (val === 'take') {
      var uri = await takePicture();
    } else if (val === 'pick') {
      var uri = await pickLibrary();
    }
    if (!uri) return this.setState({loader: false});
    const uriResized = await resize(uri);
    if (!uriResized) return this.setState({loader: false});

    await this.props.setState(uriResized);
    await this.setState({loader: false});
    await closeAddImage();
    return true;
  }
  render() {
    const {loader} = this.state;
    const {img, title, title2, styleImg} = this.props;

    return (
      <ButtonColor
        view={() => {
          return (
            <View style={[styleApp.center, styleApp.fullSize]}>
              {loader ? (
                <ActivityIndicator size="small" color={colors.title} />
              ) : img === '' || !img ? (
                <View style={styleApp.center}>
                  <AllIcons
                    name={'image'}
                    size={18}
                    color={colors.greyDark}
                    type="font"
                  />
                  <Text style={styles.text}>{title}</Text>
                  {title2 ? (
                    <Text style={[styles.text, {marginTop: 1}]}>{title2}</Text>
                  ) : null}
                </View>
              ) : (
                <AsyncImage mainImage={img} style={styleImg} />
              )}
            </View>
          );
        }}
        click={() => {
          Keyboard.dismiss();
          navigate('Alert', {
            title: 'Add picture',
            displayList: 'addImage',
            onGoBack: (val) => {
              return this.click(val);
            },
          });
        }}
        color={'white'}
        style={styles.buton}
        onPressColor={colors.off}
      />
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 190,
    width: '100%',
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
    borderColor: colors.grey,
  },
  text: {
    ...styleApp.text,
    marginTop: 8,
    fontSize: 12,
  },
});
