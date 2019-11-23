import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Button,
    RefreshControl,
    Animated,
    Image
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase'

const { height, width } = Dimensions.get('screen')
import colors from '../../style/colors'
import styleApp from '../../style/style'
import sizes from '../../style/sizes'
import {Grid,Row,Col} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import AsyncImage from '../image/AsyncImage'
import AllIcons from '../icons/AllIcons'
import BackButton from '../buttons/BackButton'
import Button2 from '../buttons/Button'
import ButtonColor from '../Views/Button'
import Loader from '../loaders/Loader'
import isEqual from 'lodash.isequal'
import ParallaxScrollView from 'react-native-parallax-scroll-view';


class ParalaxScrollView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed:true,
      loader:false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async refresh() {
    await this.props.setState({loader:true})
    return this.props.setState({loader:false})
  }
  refreshControl() {
    return (
      <RefreshControl
        refreshing={this.state.loader}
        // colors={[this.props.colorRefreshControl]}
        // progressBackgroundColor={'white'}
        tintColor={this.props.colorRefreshControl}
        onRefresh={()=>this.refresh()} size={'small'} />
    )
  }
  render() {
    const AnimateHeaderBackground = this.AnimatedHeaderValue.interpolate(
      {
          inputRange: [ 0, 60 ],
          outputRange: [ 'transparent', 'white' ],
          extrapolate: 'clamp'
    });
    const AnimateHeaderBorder = this.AnimatedHeaderValue.interpolate(
      {
          inputRange: [ 30, 60 ],
          outputRange: [ 'transparent', colors.off ],
          extrapolate: 'clamp'
    });
    const AnimateColorIcon = this.AnimatedHeaderValue.interpolate(
      {
          inputRange: [ 0, 60 ],
          outputRange: [ this.props.initialColorIcon, colors.title ],
          extrapolate: 'clamp'
    });
    return (
      <ParallaxScrollView
              style={{ height:height, backgroundColor: 'white', overflow: 'hidden' ,position:'absolute'}}
              refreshControl={this.refreshControl()}
              showsVerticalScrollIndicator={false}
              stickyHeaderHeight={100}
              outputScaleValue={6}
              fadeOutForeground={true}
              backgroundScrollSpeed={2}
              backgroundColor={'white'}
              onScroll = { 
              Animated.event(
                [{ nativeEvent: { contentOffset: { y: this.props.AnimatedHeaderValue }}}]
              )}
              renderBackground={() => this.props.image}
              renderFixedHeader={null}
              parallaxHeaderHeight={ 280 }>

              {this.props.content()}
          </ParallaxScrollView>
      )
  }
}

const styles = StyleSheet.create({
  viewSport:{
    backgroundColor:colors.greenLight,
    borderRadius:3,
    paddingLeft:10,
    paddingRight:10,
    height:25,
    width:70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport:{
    color:colors.greenStrong,
    fontSize:13,
    fontFamily: 'OpenSans-SemiBold',
  },
});


const  mapStateToProps = state => {
  return {
  };
};

export default connect(mapStateToProps,{})(ParalaxScrollView);
