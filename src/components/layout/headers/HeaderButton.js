import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import {Grid, Row, Col} from 'react-native-easy-grid';

import styleApp from '../../style/style';
import Loader from '../loaders/Loader';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import AllIcons from '../icons/AllIcons';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);
const {height, width} = Dimensions.get('screen');

export default class HeaderButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async close() {
    this.props.close();
  }

  render() {
    const {icon,iconRight} = this.props
    return (
      <Animated.View style={styleApp.headerBooking}>
        <Row
          style={{
            height: 50,
            borderBottomWidth: 0,
            borderColor: this.props.borderColor,
          }}>
          <Col
            size={15}
            style={[styleApp.center2, {paddingLeft: 10}]}
            activeOpacity={0.4}
            onPress={() => this.close()}>
            {icon != '' && (
              <FontIcon size={27} name={icon} color={'white'} />
            )}
          </Col>
          <Col size={70} style={styleApp.center}>
            <Text style={styles.text}>{this.props.title}</Text>
          </Col>
          <Col
            size={15}
            style={[
              styleApp.center2,
              {alignItems: 'flex-end', paddingRight: 10},
            ]}
            activeOpacity={0.7}
            onPress={() => {
              if (iconRight) {
                return this.props.clickIconRight();
              }
            }}>
            {this.props.loader ? (
              <Loader size={20} color="white" />
            ) : iconRight && (
              <AllIcons
                size={20}
                name={iconRight}
                color={'white'}
                type={this.props.typeIconRight}
              />
            )}
          </Col>
        </Row>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2: {
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontFamily: 'OpenSans-Bold',
    color: 'white',
  },
  lineOff: {
    height: 1,
    width: '80%',
    backgroundColor: '#eaeaea',
  },
});
