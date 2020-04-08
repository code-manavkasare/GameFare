import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  View,
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';

const {height, width} = Dimensions.get('screen');

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Button from '../buttons/Button';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import {timing} from '../../animations/animations';
import {timeout} from '../../functions/coach';

import {marginBottomApp} from '../../style/sizes';

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.opacityVoile = new Animated.Value(0);
  }
  async componentDidMount() {
    await timeout(230);
    this.openVoile(true);
  }
  componentWillUnmount() {
    this.openVoile(false);
  }
  openVoile(val) {
    Animated.timing(this.opacityVoile, timing(val ? 1 : 0, 200)).start();
  }
  title() {
    const {title} = this.props.route.params;
    return <Text style={styleApp.title}>{title}</Text>;
  }
  subtitle() {
    const {subtitle} = this.props.route.params;
    if (subtitle)
      return <Text style={[styleApp.text, {fontSize: 15}]}>{subtitle}</Text>;
    return null;
  }
  click() {
    const {navigation, route} = this.props;
    const {close, onGoBack} = route.params;
    if (!close) {
      this.setState({loader: true});
      return onGoBack();
    }
    return navigation.goBack();
  }
  async close() {
    this.openVoile(false);
    await timeout(130);
    const {navigation} = this.props;
    navigation.goBack();
  }
  render() {
    const {navigation} = this.props;
    const {
      colorButton,
      onPressColor,
      icon,
      textButton,
    } = this.props.route.params;

    return (
      <View style={[styleApp.stylePage, {backgroundColor: 'transparent'}]}>
        <Animated.View
          style={[
            styleApp.stylePage,
            {backgroundColor: colors.title + '80', opacity: this.opacityVoile},
          ]}>
          <TouchableOpacity
            onPress={() => this.close()}
            activeOpacity={1}
            style={styleApp.fullSize}
          />
        </Animated.View>
        <View style={styles.viewModal}>
          <TouchableOpacity
            style={styles.buttonClose}
            activeOpacity={0.5}
            onPress={() => this.close()}>
            <MatIcon name="close" color={'#4a4a4a'} size={24} />
          </TouchableOpacity>

          {icon && <View style={styles.viewIcon}>{icon}</View>}

          <Row style={styles.rowTitleSubtitle}>
            <Col>
              {this.title()}
              {this.subtitle()}
            </Col>
          </Row>

          <View style={styles.viewButton}>
            <Button
              backgroundColor={colorButton ? colorButton : 'green'}
              disabled={false}
              onPressColor={onPressColor ? onPressColor : colors.greenClick}
              text={textButton}
              click={() => this.click()}
              loader={this.state.loader}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewModal: {
    bottom: 0,
    position: 'absolute',
    flex: 1,
    backgroundColor: 'white',
    borderTopWidth: 0.3,
    borderColor: colors.borderColor,
    width: width,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 10,
    shadowOpacity: 0.2,
  },
  rowTitleSubtitle: {
    flex: 1,
    marginLeft: 20,
    width: width - 110,
    marginBottom: 9,
    marginTop: 17,
  },
  buttonClose: {
    position: 'absolute',
    width: 26,
    height: 26,
    right: 15,
    top: 20,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  viewIcon: {
    position: 'absolute',
    width: 26,
    height: 26,
    right: 55,
    top: 20,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  viewButton: {
    marginTop: 25,
    marginLeft: 20,
    marginBottom: marginBottomApp,
    alignItems: 'center',
    justifyContent: 'center',
    width: width - 40,
    height: 50,
  },
});
