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
    this.componentWillMount = this.componentWillMount.bind(this);
    this.handleBackPress = this.handleBackPress.bind(this);
  }
  componentWillMount() {
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
  sizeColTitle() {
    if (this.props.headerType) return 25;
    return 70;
  }
  render() {
    return (
      <View
        style={styles.header}>
        <Row>
          <Col size={15} style={styles.center2} activeOpacity={0.4}>
            {this.props.icon1 && (
              <View
                style={styles.buttonStyle}>
                <ButtonColor
                  view={() => {
                    return (
                      <AllIcons
                        name={this.props.icon1}
                        color={colors.title}
                        size={15}
                        type="font"
                      />
                    );
                  }}
                  click={() => this.props.clickButton1()}
                  color={'white'}
                  style={styles.buttonRight}
                  onPressColor={colors.off}
                />
              </View>
            )}
          </Col>
          <Col size={85} />
        </Row>
      </View>
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
  header: {
    height: sizes.heightHeaderHome,
    width: width,
    backgroundColor: 'rgba(0,0,0,0)',
    paddingTop: sizes.marginTopHeader - 5,
    paddingLeft: 20,
    paddingRight: 20,
    position: 'absolute',
    zIndex: 10,
  },
  title: {
    fontSize: 15,
    paddingLeft: 7,
    color: '#4B4B4B',
  },
  textTitleHeader: {
    color: colors.title,
    fontSize: 17,
  },
  buttonRight: {
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
  rowTextHeader: {
    ...styleApp.center,
    height: '100%',
    marginLeft: -20,
    position: 'absolute',
    width: width,
  },
});
