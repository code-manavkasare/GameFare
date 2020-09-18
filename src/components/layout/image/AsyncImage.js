import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {View, ActivityIndicator, Image, Animated, Easing} from 'react-native';
import FastImage from 'react-native-fast-image';
import ls from 'react-native-local-storage';
import {native} from '../../animations/animations';

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
    this.opacityFastImageCached = new Animated.Value(1);
  }
  enterPictureCached() {
    Animated.timing(this.opacityFastImageCached, native(1)).start();
  }
  getMainImage() {
    const {mainImage, image} = this.props;
    if (!mainImage) {
      return image;
    }
    return mainImage;
  }
  imgDisplay() {
    const {style, resizeMode, onError} = this.props;
    return (
      <Animated.View
        style={{
          opacity: this.opacityFastImageCached,
          height: style.height,
          width: style.width,
        }}>
        <FastImage
          resizeMode={resizeMode ? resizeMode : 'cover'}
          onLoadEnd={() => {
            // this.enterPictureCached();
          }}
          style={[style, {zIndex: 10, position: 'absolute', top: 0}]}
          source={{
            cache: FastImage.cacheControl.web,
            uri: this.getMainImage(),
          }}
          onError={(err) => {
            if (onError) {
              onError(err);
            }
          }}
        />
      </Animated.View>
    );
  }
  render() {
    return <View style={[this.props.style]}>{this.imgDisplay()}</View>;
  }
}

AsyncImage.propTypes = {
  mainImage: PropTypes.string.isRequired,
};
