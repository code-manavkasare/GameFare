import React, {Component} from 'react';
import {
  Animated,
  Dimensions,
  View,
} from 'react-native';

import sizes from '../../../../style/sizes';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';

import Loader from '../../../../layout/loaders/Loader';
import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';
import SnippetsView from './components/SnippetsView';


export default class ExpandedSnippetsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      loader: true,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    const {id} = this.props.route.params;
    if (!id) {
      throw "Error: expandedSnippetsView: !id"
    }
    this.setState({id, loader: false});
  }
  render() {
    const {loader, id} = this.state;
    const {pop} = this.props.navigation;
    return (
      <View style={styleApp.fullView}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          loader={loader}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          icon1={'times'}
          sizeIcon1={22}
          clickButton1={() => pop()}
        />
        {loader && <Loader size={55} color={colors.white} />}
        {!loader && <SnippetsView id={id} />}
      </View>
    );
  }
}

