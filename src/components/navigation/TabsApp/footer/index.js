import React from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import {connect} from 'react-redux';

import ButtonFooter from './components/Button';
import colors from '../../../style/colors';
import {width, heightFooter} from '../../../style/sizes';
import {native} from '../../../animations/animations';
import styleApp from '../../../style/style';

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.translateYFooter = new Animated.Value(0);
  }
  componentDidUpdate = (prevProps, prevState) => {
    // if (prevProps.footerIsVisible !== this.props.footerIsVisible) {
    //   console.log('translate footer !!!!!!');
    //   return this.translateFooter(this.props.footerIsVisible);
    // }
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
        <Row style={{overflow: 'hidden'}}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const {icon, label, signInToPass} = options;
            const isFocused = state.index === index;
            return (
              <Col style={styleApp.center}>
                <ButtonFooter
                  navigation={navigation}
                  focused={isFocused}
                  tintColor={isFocused ? colors.active : colors.inactive}
                  routeName={route.name}
                  signInToPass={signInToPass}
                  icon={icon}
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
    ...styleApp.shade,
    flexDirection: 'row',
    backgroundColor: 'white',
    height: heightFooter,
    position: 'absolute',
    bottom: 30,
    zIndex: 0,
    width: width - 100,
    marginLeft: 50,
    borderWidth: 1,
    borderRadius: 35,
    // overflow: 'hidden',
    borderColor: colors.off,
  },
});

const mapStateToProps = (state) => {
  return {
    // footerIsVisible: state.user.layoutSettings.footerIsVisible,
  };
};

export default connect(mapStateToProps, {})(Footer);
