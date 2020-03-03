import React, {Component} from 'react';
import {
  StyleSheet,
  Animated,
  BackHandler,
  View,
  Dimensions,
  Text,
} from 'react-native';
import {Row, Col} from 'react-native-easy-grid';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import styleApp from '../../style/style';
const {width} = Dimensions.get('screen');

export default class CalibrationHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableClickButton: true,
      errClicked: false,
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
      <Row style={styles.header}>
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
          click={() => this.props.close()}
          color={'white'}
          style={styles.button}
          onPressColor={colors.off}
        />

        {this.props.nextVis ? (
          <View style={[styles.buttonStyle, { transform: [{ rotate: '90deg' }] }]}>
            {
              // rotation of this view discriminates against left handed ppl :(
            }
            <ButtonColor
              view={() => {
                return (
                  <AllIcons
                    name="check"
                    color={'colors.title'}
                    size={15}
                    type="font"
                  />
                );
              }}
              click={() => {
                this.props.next();
              }}
              color={'white'}
              style={styles.button}
              onPressColor={colors.off}
            />
          </View>
        ) : null}
      </Row>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'space-between',
    height: sizes.heightHeaderHome,
    width: '100%',
    paddingTop: sizes.marginTopHeader,
    paddingRight: 20,
    paddingLeft: 20,
    backgroundColor: 'rgba(0,0,0,0)',
    position: 'absolute',
    zIndex: 10,
  },
  button: {
    ...styleApp.center,
    height: 46,
    width: 46,
    borderRadius: 23,
    borderWidth: 0,
  },
});
