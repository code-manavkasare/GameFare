import React, {Component} from 'react';
import {object, string} from 'prop-types';
import {View, Animated} from 'react-native';
import FastImage from 'react-native-fast-image';

import {native} from '../../animations/animations';
import {sentryCaptureException} from '../../functions/logs.js';

export default class AsyncImage extends Component {
  static propTypes = {
    mainImage: string,
    imgInitial: string,
    style: object,
  };
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
    const {mainImage, imgInitial} = this.props;
    if (!mainImage) {
      return imgInitial;
    }
    return mainImage;
  }
  imgDisplay() {
    const {style, resizeMode, onError} = this.props;
    const mainImage = this.getMainImage();
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
            this.enterPictureCached();
          }}
          style={[style, {zIndex: 10, position: 'absolute', top: 0}]}
          source={{
            cache: FastImage.cacheControl.web,
            uri: mainImage,
          }}
          onError={(response) => {
            if (onError) onError();
            sentryCaptureException({
              event: 'FastImageError',
              props: this.props,
              state: this.state,
            });
          }}
        />
      </Animated.View>
    );
  }
  render() {
    return <View style={[this.props.style]}>{this.imgDisplay()}</View>;
  }
}
