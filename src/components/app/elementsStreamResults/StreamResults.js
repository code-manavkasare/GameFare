import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

const {height, width} = Dimensions.get('screen');

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';

class StreamResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    const {navigate} = this.props.navigation;
    return (
      <View style={{flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Stream Results'}
          inputRange={[50, 80]}
          initialBorderColorIcon={colors.grey}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={0}
          icon1="arrow-left"
          clickButton1={() => navigate('Event')}
        />
        <View style={styles.container}><Text>Stream Results</Text></View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      height: height,
      backgroundColor: 'white',
      overflow: 'hidden',
      position: 'absolute',
      paddingLeft: 10,
      paddingTop: sizes.heightHeaderHome,
    },
});

StreamResults.PropTypes = {
    stream: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps)(StreamResults);
