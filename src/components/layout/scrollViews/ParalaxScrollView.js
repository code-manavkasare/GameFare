import React, {Component} from 'react';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import {StyleSheet, Dimensions, RefreshControl, Animated} from 'react-native';
import {connect} from 'react-redux';

const {height, width} = Dimensions.get('screen');
import colors from '../../style/colors';

class ParalaxScrollView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed: true,
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async refresh() {
    this.props.refresh();
  }
  refreshControl() {
    return (
      <RefreshControl
        refreshing={this.state.loader}
        // colors={[this.props.colorRefreshControl]}
        // progressBackgroundColor={'white'}
        tintColor={this.props.colorRefreshControl}
        onRefresh={() => this.refresh()}
        size={'small'}
      />
    );
  }
  render() {
    const AnimateHeaderBackground = this.AnimatedHeaderValue.interpolate({
      inputRange: [0, 60],
      outputRange: ['transparent', 'white'],
      extrapolate: 'clamp',
    });
    const AnimateHeaderBorder = this.AnimatedHeaderValue.interpolate({
      inputRange: [30, 60],
      outputRange: ['transparent', colors.off],
      extrapolate: 'clamp',
    });
    const AnimateColorIcon = this.AnimatedHeaderValue.interpolate({
      inputRange: [0, 60],
      outputRange: [this.props.initialColorIcon, colors.title],
      extrapolate: 'clamp',
    });
    return (
      <ParallaxScrollView
        style={{
          height: height,
          backgroundColor: 'white',
          overflow: 'hidden',
          position: 'absolute',
        }}
        refreshControl={this.refreshControl()}
        showsVerticalScrollIndicator={false}
        stickyHeaderHeight={100}
        outputScaleValue={6}
        fadeOutForeground={true}
        backgroundScrollSpeed={2}
        backgroundColor={'white'}
        onScroll={Animated.event([
          {nativeEvent: {contentOffset: {y: this.props.AnimatedHeaderValue}}},
        ])}
        renderBackground={() => this.props.image}
        renderFixedHeader={null}
        parallaxHeaderHeight={280}>
        {this.props.content()}
      </ParallaxScrollView>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(ParalaxScrollView);
