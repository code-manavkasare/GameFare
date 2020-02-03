import React, {Component} from 'react';
import {
  StyleSheet,
  Animated,
  BackHandler,
  View,
  Dimensions,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';
const {width} = Dimensions.get('screen');

export default class LiveStreamHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableClickButton: true,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
  }
  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackPress,
    );
    if (this.props.loaderOn === true) {
      this.props.onRef(this);
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.loader !== nextProps.loader ||
      this.state !== nextState ||
      this.props.enableClickButton !== nextProps.enableClickButton
    );
  }
  handleBackPress = () => {
    if (this.props.enableClickButton && this.state.enableClickButton) {
      this.close();
    }
  };
  componentWillUnmount() {
    this.backHandler.remove();
  }
  async close() {
    this.setState({enableClickButton: false});
    if (this.props.enableClickButton && this.state.enableClickButton) {
      this.props.close();
      var that = this;
      setTimeout(function() {
        that.setState({enableClickButton: true});
      }, 1500);
    }
  }
  render() {
    return (
      <Col style={styles.header}>
        <View
          style={styles.buttonStyle}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name="times"
                  color={colors.title}
                  size={15}
                  type="font"
                />
              );
            }}
            click={() => this.props.click()}
            color={'white'}
            style={styles.button}
            onPressColor={colors.off}
          />
        </View>
      </Col>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'flex-start',
    height: '100%',
    width: sizes.heightHeaderHome,
    paddingRight: sizes.marginTopHeader - 5,
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  button: {
    ...styleApp.center,
    height: 46,
    width: 46,
    borderRadius: 23,
    borderWidth: 0,
  },
  buttonStyle: {
    height: 48,
    width: 48,
  },
});
