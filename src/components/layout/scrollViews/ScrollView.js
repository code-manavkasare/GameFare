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
import {marginTopApp, marginTopAppLandscape} from '../../style/sizes';

export default class ScrollViewPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  styleScrollView() {
    let {marginTop} = this.props;
    const marginTopAdded = marginTopApp;
    return {
      marginTop: marginTop + marginTopAdded,
    };
  }
  styleInsideView() {
    if (this.props.fullWidth) {
      return {paddingTop: 0};
    }
    return {marginLeft: '5%', width: '90%', paddingTop: '5%'};
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
          refreshing={this.state.refreshing}
          onRefresh={() => this.refresh()}
        />
      );
    }
    return null;
  }
  render() {
    return (
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={30}
        keyboardOpeningTime={120}
        // enableAutomaticScroll={false}
        enableAutomaticScroll={this.props.keyboardAvoidDisable ? false : true}
        enableResetScrollToCoords={false}
        refreshControl={this.refreshControl()}
        keyboardShouldPersistTaps={'always'}
        keyboardDismissMode={
          this.props.keyboardDismissMode
            ? this.props.keyboardDismissMode
            : 'none'
        }
        extraHeight={100}
        showsVerticalScrollIndicator={this.props.showsVerticalScrollIndicator}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: !this.props.AnimatedHeaderValue
                    ? this.AnimatedHeaderValue
                    : this.props.AnimatedHeaderValue,
                },
              },
            },
          ],
          {useNativeDriver: false},
        )}
        // style={}
        style={this.styleScrollView()}>
        {this.props.contentScrollView()}

        <View style={{height: this.props.offsetBottom}} />
      </KeyboardAwareScrollView>
    );
  }
}

