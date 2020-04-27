import React, {Component} from 'react';
import {View, Animated} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import LocationSearchBar from './LocationSearchBar';
import ScrollView from '../../layout/scrollViews/ScrollView2';

import {heightHeaderHome} from '../../style/sizes';
import styleApp from '../../style/style';
import colors from '../../style/colors';

class LocationSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.setLocation.bind(this);
  }
  async setLocation(location) {
    await this.props.historicSearchAction('setLocationSearch', location);
    return this.props.navigation.navigate('TabsApp');
  }
  render() {
    const {loader} = this.state;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Pick your location'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          initialBorderColorHeader={colors.off}
          // initialBorderWidth={0.3}
          loader={loader}
          icon1="arrow-left"
          clickButton1={() => this.props.navigation.goBack()}
          icon2="text"
          text2={'Skip'}
          clickButton2={() => this.props.navigation.navigate('TabsApp')}
        />

        <View style={{marginTop: heightHeaderHome}}>
          <LocationSearchBar
            setState={this.setState.bind(this)}
            loader={loader}
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            selectLocation={(location) => this.setLocation(location)}
          />
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {historicSearchAction},
)(LocationSelect);
