import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import ButtonFooter from './components/Button';
import colors from '../../../style/colors';
import {width} from '../../../style/sizes';
import {native} from '../../../animations/animations';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.translateYFooter = new Animated.Value(0);
  }
  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.footerIsVisible !== this.props.footerIsVisible) {
      console.log('translate footer !!!!!!');
      return this.translateFooter(this.props.footerIsVisible);
    }
  };
  translateFooter = (open) => {
    return Animated.parallel([
      Animated.timing(this.translateYFooter, native(open ? 0 : 200, 200)),
    ]).start();
  };
  footer = () => {
    const {state, descriptors, navigation, colors} = this.props;
    return (
      <Animated.View
        style={[
          styles.footer,
          {transform: [{translateY: this.translateYFooter}]},
        ]}>
        <Row>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const {icon, label, signInToPass} = options;
            const isFocused = state.index === index;
            return (
              <Col>
                <ButtonFooter
                  navigation={navigation}
                  focused={isFocused}
                  tintColor={isFocused ? colors.active : colors.inactive}
                  routeName={route.name}
                  signInToPass={signInToPass}
                  iconName={icon.name}
                  label={label}
                />
              </Col>
            );
          })}
        </Row>
      </Animated.View>
    );
  };
  render() {
    // return null;
    return this.footer();
  }
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    height: 90,
    position: 'absolute',
    bottom: 0,
    width: width,
    borderTopWidth: 1,
    borderColor: colors.grey,
  },
});

const mapStateToProps = (state) => {
  return {
    footerIsVisible: state.user.layoutSettings.footerIsVisible,
  };
};

export default connect(mapStateToProps, {})(Footer);
