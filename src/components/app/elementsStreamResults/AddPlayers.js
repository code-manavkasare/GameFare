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

class AddPlayers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  render() {
    const {dismiss, navigate} = this.props.navigation;
    const stream = this.props.navigation.getParam('stream');
    const event = this.props.navigation.getParam('event');
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
          icon2="check"
          typeIcon2="font"
          sizeIcon2={17}
          clickButton2={() =>
            navigate('MatchPictures', {stream: stream, event: event})
          }
          clickButton1={() => dismiss()}
        />


        <View style={styles.container}>
          <Text>Add Players</Text>
        </View>
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

AddPlayers.PropTypes = {};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps)(AddPlayers);
