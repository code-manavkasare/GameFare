import React, {Component, PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Animated,
  Easing,
  Dimensions,
  RefreshControl,
} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';

const {height, width} = Dimensions.get('screen');

export default class ScrollViewPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  getAnimateHeader() {
    return this.AnimatedHeaderValue;
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  scrollToEnd(data) {
    this.scrollRef.props.scrollToEnd({animated: false});
  }
  styleScrollView() {
    return {
      marginTop: this.props.marginTop,
      marginBottom:
        this.props.marginBottomScrollView
          ? this.props.marginBottomScrollView
          : 0,
    };
  }
  styleInsideView() {
    if (this.props.fullWidth) return {paddingTop: 0};
    return {marginLeft: 20, width: width - 40, paddingTop: 20};
  }
  async refresh() {
    this.setState({refreshing: true});
    await this.props.refresh();
    this.setState({refreshing: false});
  }
  refreshControl() {
    if (this.props.refreshControl) {
      return (
        <RefreshControl
          tintColor={
            this.props.colorRefresh
              ? this.props.colorRefresh
              : colors.title
          }
          refreshing={this.state.refreshing}
          onRefresh={() => this.refresh()}
          size={'small'}
        />
      );
    }
    return null;
  }
  render() {
    const {scrollDisabled} = this.props
    return (
      <View>
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          extraScrollHeight={30}
          keyboardOpeningTime={120}
          bounces={true}
          enableResetScrollToCoords={false}
          scrollEnabled={!scrollDisabled}
          refreshControl={this.refreshControl()}
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode={'none'}
          stickyHeaderIndices={this.props.stickyHeaderIndices}
          // onRef={ref => (this.scrollViewRef = ref)}
          innerRef={(ref) => {
            this.scrollRef = ref;
          }}
          extraHeight={100}
          showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            {
              nativeEvent: {
                contentOffset: {
                  y: this.props.AnimatedHeaderValue
                    ? this.props.AnimatedHeaderValue
                    : this.AnimatedHeaderValue,
                },
              },
            },
          ])}
          style={this.styleScrollView()}>
          {this.props.contentScrollView()}

          <View style={{height: this.props.offsetBottom}} />
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    height: height,
    width: width,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2: {
    justifyContent: 'center',
  },
});
