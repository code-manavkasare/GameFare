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

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import Button from '../buttons/Button';
import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';
import Loader from '../loaders/Loader';
import AlertAddImage from './AlertAddImage';

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
    await timeout(300);
    this.openVoile(true);
    const {navigation, coachAction} = this.props;
  }

  openVoile(val) {
    Animated.timing(
      this.opacityVoile,
      timing(val ? 1 : 0, val ? 200 : 30),
    ).start();
  }
  title() {
    const {title} = this.props.route.params;
    return <Text style={styleApp.title}>{title}</Text>;
  }
  subtitle() {
    const {subtitle} = this.props.route.params;
    if (subtitle)
      return (
        <Text style={[styleApp.text, {fontSize: 15, marginTop: 20}]}>
          {subtitle}
        </Text>
      );
    return null;
  }
  async click() {
    const {route} = this.props;
    const {close, onGoBack, nextNavigation} = route.params;
    if (!close) {
      this.setState({loader: true});
      await onGoBack();
    }
    if (nextNavigation) return nextNavigation();
    return this.close();
  }
  async optionClick(operation, forceNavigation) {
    this.openVoile(false);
    const {navigation} = this.props;
    if (operation) {
      await operation();
    }
    if (forceNavigation) return;
    navigation.goBack();
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
      displayList,
      listOptions,
      close,
      onGoBack,
      componentAdded,
      disableClickOnBackdrop,
      disableCloseButton,
    } = this.props.route.params;
    const closable = close !== undefined ? close : true;
    return (
      <View style={[styleApp.stylePage, {backgroundColor: 'transparent'}]}>
        <Animated.View
          style={[
            styleApp.stylePage,
            {backgroundColor: colors.title + '80', opacity: this.opacityVoile},
          ]}>
          <TouchableOpacity
            onPress={() => !disableClickOnBackdrop && this.close()}
            activeOpacity={1}
            style={styleApp.fullSize}
          />
        </Animated.View>
        <View style={styles.viewModal}>
          {closable && (
            <TouchableOpacity
              style={styles.buttonClose}
              activeOpacity={0.5}
              onPress={() => this.close()}>
              <MatIcon name="close" color={'#4a4a4a'} size={24} />
            </TouchableOpacity>
          )}

          {icon && <View style={styles.viewIcon}>{icon}</View>}

          <Row style={styles.rowTitleSubtitle}>
            <Col>
              {this.title()}
              {this.subtitle()}
            </Col>
          </Row>

          <View
            style={[
              styleApp.divider,
              {marginLeft: '5%', width: '90%', marginTop: 20},
            ]}
          />

          {componentAdded && (
            <View style={[styleApp.marginView, {marginTop: 15}]}>
              {componentAdded}
            </View>
          )}

          {// CASE 1: Two options given (YES / NO Style)
          displayList === 'addImage' ? (
            <AlertAddImage
              onGoBack={onGoBack}
              close={() => this.close()}
              navigation={navigation}
            />
          ) : displayList && listOptions.length === 2 ? (
            <Row style={styles.buttonArea}>
              <Col size={45} style={styles.viewButton}>
                <Button
                  backgroundColor={'red'}
                  disabled={false}
                  onPressColor={colors.redLight}
                  text={listOptions[0].title || 'No'}
                  click={() =>
                    this.optionClick(
                      listOptions[0].operation,
                      listOptions[0].forceNavigation,
                    )
                  }
                  loader={listOptions[0].loader}
                />
              </Col>
              <Col size={10} />
              <Col size={45} style={styles.viewButton}>
                {listOptions[1].button ? (
                  listOptions[1].button
                ) : (
                  <Button
                    backgroundColor={'green'}
                    disabled={listOptions[1].disabled}
                    onPressColor={colors.greenLight}
                    text={listOptions[1].title || 'Yes'}
                    click={() => this.optionClick(
                      listOptions[1].operation,
                      listOptions[1].forceNavigation,
                      )
                    }
                    loader={listOptions[1].loader}
                  />
                )}
              </Col>
            </Row>
          ) : // CASE 2: More than two options available (All blue buttons)
          displayList ? (
            <Col style={styles.buttonArea}>
              {listOptions.map((option, i) => {
                const {icon, title, operation} = option;
                return (
                  <ButtonColor
                    key={i}
                    view={() => {
                      const {name, size, type, color} = icon;
                      return (
                        <Row>
                          <Col size={20} style={styleApp.center}>
                            <AllIcons
                              name={name}
                              type={type}
                              color={color}
                              size={size}
                            />
                          </Col>
                          <Col size={60} style={styleApp.center2}>
                            <Text style={styleApp.text}>{title}</Text>
                          </Col>
                          <Col size={20} style={styleApp.center3}>
                            <AllIcons
                              name="keyboard-arrow-right"
                              type={'mat'}
                              color={colors.grey}
                              size={13}
                            />
                          </Col>
                        </Row>
                      );
                    }}
                    click={() => this.optionClick(operation)}
                    color="white"
                    style={styles.buttonList}
                    onPressColor={colors.off}
                  />
                );
              })}
            </Col>
          ) : (
            // CASE 3: Only one option provided (Same as previous usage)
            <View style={styles.buttonArea}>
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
          )}
          <View style={{height: marginBottomApp}} />
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
    // borderTopRightRadius: 30,
    // borderTopLeftRadius: 30,
    backgroundColor: 'white',
    borderWidth: 1,
    paddingTop: 10,
    borderColor: colors.off,
    width: '100%',
    // shadowColor: '#46474B',
    // shadowOffset: {width: 0, height: 0},
    // shadowRadius: 10,
    // shadowOpacity: 0.2,
  },
  rowTitleSubtitle: {
    flex: 1,
    paddingLeft: '5%',
    paddingRight: '5%',
    width: '85%',
    marginBottom: 9,
    marginTop: 17,
  },
  buttonClose: {
    position: 'absolute',
    width: 26,
    height: 26,
    right: '5%',
    top: 30,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  viewIcon: {
    position: 'absolute',
    width: 26,
    height: 26,
    right: '12%',
    top: 25,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  buttonArea: {
    paddingLeft: '5%',
    paddingRight: '5%',
    paddingTop: 15,
    // paddingBottom: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonList: {
    height: 55,
    width: '100%',
  },
  viewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
  },
});
