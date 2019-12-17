import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import FontIcon from 'react-native-vector-icons/FontAwesome5';

import {Col, Row, Grid} from 'react-native-easy-grid';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import ButtonColor from '../Views/Button';
import NavigationService from '../../../../NavigationService';

const {height, width} = Dimensions.get('screen');
import Icon from '../icons/icons';
import AllIcons from '../icons/AllIcons';
import AsyncImage from '../image/AsyncImage';
import {timing, native} from '../../animations/animations';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);

export default class ExpandableCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      heightCard: new Animated.Value(this.initialHeight()),
      heightDropDown: new Animated.Value(55),
      // listExpend:this.props.option.listExpend
    };
    this.componentWillMount = this.componentWillMount.bind(this);
    this.heightCard = new Animated.Value(this.initialHeight());
    this.heightDropDown = new Animated.Value(55);
    this.rotateIcon = new Animated.Value(0);
    this.opacityExpand = new Animated.Value(0);
    this.open = 0;
  }
  initialHeight() {
    return 60;
  }
  initialList() {
    if (this.props.option.alwaysExpanded) return 1;
    return 0;
  }
  componentWillMount() {}
  componentWillReceiveProps(nextProps) {
    console.log('receiprops card');
    console.log(nextProps);
    console.log(this.props.option);
    if (this.props.option != nextProps.option) {
      console.log('rl');
      Animated.parallel([
        Animated.timing(this.rotateIcon, native(0, 150)),
        Animated.timing(this.state.heightDropDown, timing(55, 130)),
      ]).start(() => (this.open = 0));
    }
  }
  valueOption(option) {
    if (option.value == this.props.providersPreference.type)
      return (
        <Text style={[styles.title, {color: colors.title}]}>
          {this.props.providersPreference.text}
        </Text>
      );
    return <Text style={styles.title}>{option.text}</Text>;
  }
  getColorIcon(option, value) {
    if (option.value == this.props.valueSelected) return colors.title;
    return '#eaeaea';
  }
  getColorIcon2(option) {
    // if (option.value == this.props.providersPreference.type) return colors.primary
    return colors.subtitle;
  }
  getHeightExpand() {
    //return this.props.option.listExpend.length*50 + 50
    return 50;
  }
  async expand(listExpend) {
    if (this.open == 0) {
      await Animated.parallel([
        Animated.timing(this.rotateIcon, native(1, 80)),
        Animated.timing(
          this.state.heightDropDown,
          timing(listExpend.length * 55, 130),
        ),
      ]).start(() => (this.open = 1));
    } else {
      await Animated.parallel([
        Animated.timing(this.rotateIcon, native(0, 80)),
        Animated.timing(this.state.heightDropDown, timing(55, 130)),
      ]).start(() => (this.open = 0));
    }
    return true;
  }
  colorCheck(option, value, colorOff) {
    if (option.expendable == true && option.valueSelected == value)
      return colors.title;
    else if (option.expendable == false && option.selected == value)
      return colors.title;
    return colorOff;
  }
  borderColor() {
    // if (this.state.expanded) return colors.primary
    return colors.borderColor;
  }
  textValue(item) {
    var value = item.text;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
  async expandClose(option) {
    if (option.locked != true) {
      await this.expand();
      if (option.value != this.props.valueSelected) {
        this.props.tickFilter(option);
      }
    }
    return true;
  }
  openAlert(option) {
    NavigationService.navigate('Alert', {
      close: true,
      textButton: 'Close',
      title: option.title,
      subtitle: option.subtitle,
      icon: (
        <AllIcons
          type={'font'}
          name={'info-circle'}
          color={colors.secondary}
          size={17}
        />
      ),
    });
  }
  buttonSport(spin, item, i, click) {
    console.log('item!!!!');
    console.log(this.props.list);
    console.log(this.props.valueSelected);
    console.log(item);
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row style={{height: 55}}>
              <Col size={15} style={styleApp.center}>
                {this.props.image ? (
                  <AsyncImage
                    style={{height: 27, width: 27, borderRadius: 13.5}}
                    mainImage={item.icon}
                    imgInitial={item.icon}
                  />
                ) : item.icon ? (
                  <AllIcons
                    type={item.typeIcon}
                    name={item.icon}
                    color={colors.greyDark}
                    size={17}
                  />
                ) : (
                  <AllIcons
                    type="mat"
                    name="check"
                    color={colors.greyDark}
                    size={17}
                  />
                )}
              </Col>
              <Col size={60} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text
                  style={[
                    styleApp.input,
                    {
                      color:
                        this.props.valueSelected == 'anyone'
                          ? '#C7C7CC'
                          : colors.title,
                    },
                  ]}>
                  {this.textValue(item)}
                </Text>
              </Col>
              <Col
                size={15}
                style={styleApp.center}
                activeOpacity={item.title != undefined ? 0.7 : 1}
                onPress={() =>
                  item.title != undefined ? this.openAlert(item) : null
                }>
                {item.title != undefined ? (
                  <AllIcons
                    type={'font'}
                    name={'info-circle'}
                    color={colors.secondary}
                    size={17}
                  />
                ) : null}
              </Col>

              <Col size={10} style={[styleApp.center]}>
                {i == 0 &&
                this.props.list.filter(
                  option => option.value != this.props.valueSelected,
                ).length != 0 ? (
                  <AnimatedIcon
                    name="caret-down"
                    color={colors.title}
                    style={{transform: [{rotate: spin}]}}
                    size={15}
                  />
                ) : null}
              </Col>
            </Row>
          );
        }}
        click={() => click()}
        color={'white'}
        style={[
          styleApp.center,
          {height: 55, width: width, paddingLeft: 20, paddingRight: 20},
        ]}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    const spin = this.rotateIcon.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    console.log('listExpend');
    console.log(this.props.list);
    console.log(this.props.valueSelected);
    return (
      <Animated.View
        style={[
          {
            borderColor: colors.off,
            height: this.state.heightDropDown,
            borderBottomWidth: 0,
            overflow: 'hidden',
          },
        ]}>
        {this.buttonSport(
          spin,
          this.props.list.filter(
            option => option.value === this.props.valueSelected,
          )[0],
          0,
          () => this.expand(this.props.list),
        )}

        {this.props.list
          .filter(option => option.value !== this.props.valueSelected)
          .map((option, i) =>
            this.buttonSport(spin, option, i + 1, () =>
              this.expandClose(option),
            ),
          )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    //height:150,
    marginTop: 10,
    borderWidth: 1,
    width: '100%',
    zIndex: 200,
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    borderColor: '#eaeaea',
    shadowOpacity: 0.05,
  },
  dropdown: {
    opacity: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    backgroundColor: 'white',
    width: width - 40,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
    left: -1,
    position: 'absolute',
    top: 48,
    zIndex: 999,
  },
  picture: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    height: '100%',
    width: '90%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2: {
    //alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    width: 20,
    borderRadius: 10,
    borderColor: '#C1DACE',
    backgroundColor: '#C1DACE',
    borderWidth: 1.5,
  },
  title: {
    color: '#C7C7CC',
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
  },
  title2: {
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
  },
});
