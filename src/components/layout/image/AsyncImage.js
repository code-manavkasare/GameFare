import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {View, ActivityIndicator, Image, Animated, Easing} from 'react-native';
import FastImage from 'react-native-fast-image';
import ls from 'react-native-local-storage';

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
    // TODO restructure component
    // try {
    //   if (this.props.mainImage) {
    //     var tokenImg = this.props.mainImage.split('token=')[1];
    //     if (tokenImg) {
    //       var checkToken = await ls.get(tokenImg);
    //       if (checkToken == null) checkToken = 'null';
    //     }
    //   } else {
    //     var checkToken = 'null';
    //   }
    //   await this.setState({checkToken: checkToken});
    //   this.setState({initialLoader: false});
    // } catch (err) {
    //   console.log('error image cached', err);
    // }
    this.setState({checkToken: true, initialLoader: false});
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
    const {mainImage, image} = this.props;
    if (!mainImage) return image;
    return mainImage;
  }
  imgDisplay() {
    const {style, mainImage} = this.props;
    if (this.state.checkToken == 'null') {
      return (
        <Animated.View
          style={{
            opacity: this.opacityFastImageCached,
            height: style.height,
            width: style.width,
          }}>
          <FastImage
            resizeMode={'cover'}
            onLoadEnd={() => {
              this.enterPictureCached();
              // if (mainImage) {
              //   try {
              //     var tokenImg = mainImage.split('token=')[1];
              //     if (tokenImg) ls.save(tokenImg, tokenImg);
              //   } catch (err) {
              //     true;
              //   }
              // }
            }}
            style={[style, {zIndex: 10, position: 'absolute', top: 0}]}
            source={{
              uri: this.getMainImage(),
            }}
          />
        </Animated.View>
      );
    } else {
      return (
        <FastImage
          source={{
            cache: FastImage.cacheControl.web,
            uri: this.getMainImage(),
          }}
          onLoadEnd={() => {
            // this.enterPictureCached()
          }}
          style={[style, {zIndex: this.state.zIndexInitial}]}
        />
      );
    }
  }
  render() {
    return (
      <View style={[this.props.style]}>
        {!this.state.initialLoader ? this.imgDisplay() : null}
      </View>
    );
  }
}

AsyncImage.propTypes = {
  mainImage: PropTypes.string.isRequired,
};
