import React, {Component} from 'react';

import {View, ActivityIndicator, Image, Animated, Easing} from 'react-native';
import FastImage from 'react-native-fast-image';
import ls from 'react-native-local-storage';
import colors from '../../style/colors';

export default class AsyncImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLocalImg: true,
      initialLoader: true,
      zIndexInitial: -1,
      zIndexCached: 10,
      checkToken: '',
    };
    this.AnimatedValue = new Animated.Value(0);
    this.opacityFastImageCached = new Animated.Value(0);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  async componentDidMount() {
    try {
      if (this.props.mainImage) {
        var tokenImg = this.props.mainImage.split('token=')[1];
        if (tokenImg) {
          var checkToken = await ls.get(tokenImg);
          if (checkToken == null) checkToken = 'null';
        }
      } else {
        var checkToken = 'null';
      }
      await this.setState({checkToken: checkToken});
      this.setState({initialLoader: false});
    } catch (err) {
      console.log('error image cached', err);
    }
  }
  enterPictureInitial() {
    Animated.timing(this.AnimatedValue, {
      toValue: 1,
      easing: Easing.linear,
      useNativeDriver: true,
      duration: 40,
    }).start();
  }
  enterPictureCached() {
    Animated.timing(this.opacityFastImageCached, {
      toValue: 1,
      easing: Easing.linear,
      useNativeDriver: true,
      duration: 250,
    }).start();
  }
  getMainImage() {
    if (!this.props.mainImage) return this.props.image;
    return this.props.mainImage;
  }
  imgDisplay() {
    if (this.state.checkToken == 'null') {
      return (
        <Animated.View
          style={{
            opacity: this.opacityFastImageCached,
            height: this.props.style.height,
            width: this.props.style.width,
          }}>
          <FastImage
            resizeMode={'cover'}
            onLoadEnd={() => {
              this.enterPictureCached();
              if (this.props.mainImage) {
                try {
                  var tokenImg = this.props.mainImage.split('token=')[1];
                  if (tokenImg) ls.save(tokenImg, tokenImg);
                } catch (err) {
                  true;
                }
              }
            }}
            style={[
              this.props.style,
              {zIndex: 10, position: 'absolute', top: 0},
            ]}
            source={{
              uri: this.getMainImage(),
            }}
          />
        </Animated.View>
      );
    } else {
      return (
        <FastImage
          resizeMode={'cover'}
          onLoadEnd={() => {
            // this.enterPictureCached()
          }}
          style={[this.props.style, {zIndex: this.state.zIndexInitial}]}
          source={{
            uri: this.getMainImage(),
          }}
        />
      );
    }
  }

  imgDisplay2() {
    var tokenImg = this.props.mainImage.split('token=')[1];
    const checkToken = ls.get(tokenImg);
    return (
      <Animated.View style={[{opacity: this.opacityFastImageCached}]}>
        <FastImage
          resizeMode={'cover'}
          onLoadEnd={() => this.enterPictureCached()}
          style={[this.props.style, {zIndex: this.state.zIndexInitial}]}
          source={{
            uri: this.props.mainImage,
          }}
        />
      </Animated.View>
    );
  }

  componentWillReceiveProps(props) {
    this.props = props;
  }

  styleImg() {}
  render() {
    return (
      <View style={[this.props.style]}>
        {!this.state.initialLoader ? this.imgDisplay() : null}
      </View>
    );
  }
}
