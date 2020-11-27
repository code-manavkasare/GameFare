import React, {Component} from 'react';
import {object, oneOfType, string, array} from 'prop-types';
import {View, Animated, Image} from 'react-native';
import FastImage from 'react-native-fast-image';

import {native} from '../../animations/animations';
import {timeout} from '../../functions/coach';
import {sentryCaptureException} from '../../functions/logs.js';

export default class AsyncImage extends Component {
  static propTypes = {
    mainImage: string,
    imgInitial: string,
    style: oneOfType([string, array, object]),
  };
  constructor(props) {
    super(props);
    this.state = {
      imagePath: this.props.mainImage,
      imagePathSmall: this.props.imgInitial,
      showLocalImg: true,
      initialLoader: true,
      zIndexInitial: -1,
      zIndexCached: 10,
      checkToken: '',
    };
    this.opacityFastImageCached = new Animated.Value(1);
  }
  componentDidMount() {
    // this.preloadImage();
  }
  componentDidUpdate(prevProps, prevState) {
    // if (this.props.mainImage !== prevProps.mainImage) {
    //   this.preloadImage();
    // }
  }
  async preloadImage() {
    await FastImage.preload([
      {
        uri: this.props.mainImage,
        cache: FastImage.cacheControl.web,
      },
    ]);
    await timeout(1000);
    this.setState({imagePath: this.props.mainImage});
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
    const {imagePath} = this.state;
    return (
      <Animated.View
        style={{
          opacity: this.opacityFastImageCached,
          height: style.height,
          width: style.width,
        }}>
        <Image
          source={{uri: imagePath}}
          style={[style, {zIndex: 10, position: 'absolute', top: 0}]}
        />
        {/* <FastImage
          resizeMode={resizeMode ? resizeMode : 'cover'}
          onLoadEnd={(callback) => {
            console.log('callback', callback);
            // this.enterPictureCached();
          }}
          style={[style, {zIndex: 10, position: 'absolute', top: 0}]}
          source={{
            cache: FastImage.cacheControl.web,
            uri: imagePath,
          }}
          onError={(response) => {
            if (onError) onError();
            sentryCaptureException({
              event: 'FastImageError',
              error: response,
              props: this.props,
              state: this.state,
            });
          }}
        /> */}
      </Animated.View>
    );
  }
  render() {
    const {style} = this.props;
    return <View style={style}>{this.imgDisplay()}</View>;
  }
}
