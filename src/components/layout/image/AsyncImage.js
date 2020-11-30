import React, {Component} from 'react';
import {object, oneOfType, string, array} from 'prop-types';
import {View, Animated, Image} from 'react-native';

import {native} from '../../animations/animations';
import {timeout} from '../../functions/coach';

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
    this.opacityFastImageCached = new Animated.Value(0);
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.mainImage !== prevProps.mainImage) {
      this.preloadImage();
    }
  }
  async preloadImage() {
    const {mainImage} = this.props;
    await Image.prefetch(mainImage);
    await timeout(1000);
    this.setState({imagePath: mainImage});
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
    const {style} = this.props;
    const {imagePath} = this.state;
    return (
      <Animated.View
        style={{
          opacity: this.opacityFastImageCached,
          height: style.height,
          width: style.width,
        }}>
        <Image
          onLoadEnd={() => {
            this.enterPictureCached();
          }}
          source={{uri: imagePath, cache: 'force-cache'}}
          style={[style, {zIndex: 10, position: 'absolute', top: 0}]}
        />
      </Animated.View>
    );
  }
  render() {
    const {style} = this.props;
    return <View style={style}>{this.imgDisplay()}</View>;
  }
}
