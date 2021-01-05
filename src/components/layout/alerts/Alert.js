import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  View,
  StatusBar,
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
import {height} from '../../style/sizes';
import {native} from '../../animations/animations';
import {timeout} from '../../functions/coach';

import {marginBottomApp} from '../../style/sizes';

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.alertAnimation = new Animated.Value(1);
  }
  async componentDidMount() {
    const {navigation, coachAction} = this.props;
  }
  title() {
    const {title} = this.props.route.params;
    if (title) {
      return <Text style={[styleApp.title, {paddingRight: 50}]}>{title}</Text>;
    }
    return null;
  }
  subtitle() {
    const {subtitle} = this.props.route.params;
    if (subtitle) {
      return (
        <View>
          <Text
            style={[
              styleApp.text,
              {fontSize: 15, marginTop: 15, marginBottom: -10},
            ]}>
            {subtitle}
          </Text>
        </View>
      );
    }
    return null;
  }
  async click() {
    const {route} = this.props;
    const {close, onGoBack, nextNavigation} = route.params;
    if (!close) {
      this.setState({loader: true});
      await onGoBack();
    }
    if (nextNavigation) {
      return nextNavigation();
    }
    return this.close();
  }
  async optionClick(operation, forceNavigation) {
    const {navigation} = this.props;
    if (operation) {
      await operation();
    }
    if (forceNavigation) {
      return;
    }
    navigation.goBack();
  }
  async close() {
    const {navigation} = this.props;
    const {onClose} = this.props.route.params;
    onClose && onClose();
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
      forceVertical,
      close,
      onGoBack,
      componentAdded,
      disableClickOnBackdrop,
      disableCloseButton,
    } = this.props.route.params;
    const closable = close !== undefined ? close : true;
    const translateY = this.alertAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [height, 0],
    });
    return (
      <View style={[styleApp.stylePage, {backgroundColor: 'transparent'}]}>
        <Animated.View
          style={[
            styleApp.stylePage,
            {
              backgroundColor: 'transparent',
              opacity: 0,
            },
          ]}>
          <TouchableOpacity
            onPress={() => !disableClickOnBackdrop && this.close()}
            activeOpacity={1}
            style={styleApp.fullSize}
          />
        </Animated.View>
        <Animated.View
          style={{
            ...styles.viewModal,
            bottom: 0,
            transform: [{translateY}],
          }}>
          {closable ? (
            <TouchableOpacity
              style={styles.buttonClose}
              activeOpacity={0.5}
              onPress={() => this.close()}>
              <AllIcons
                name="times"
                size={16}
                color={colors.title}
                type="font"
              />
              {/* <MatIcon name="close" color={'#4a4a4a'} size={24} /> */}
            </TouchableOpacity>
          ) : null}

          <Row style={styles.rowTitleSubtitle}>
            <Col size={icon ? 85 : 100}>
              {this.title()}
              {this.subtitle()}
            </Col>
            {icon ? (
              <Col size={15} style={styleApp.center}>
                <View style={styles.viewIcon}>{icon}</View>
              </Col>
            ) : null}
          </Row>

          {componentAdded ? (
            <View style={[styleApp.marginView, {marginTop: 15}]}>
              {componentAdded}
            </View>
          ) : null}

          {// CASE 1: Two options given (YES / NO Style)
          displayList === 'addImage' ? (
            <AlertAddImage
              onGoBack={onGoBack}
              close={() => this.close()}
              navigation={navigation}
            />
          ) : displayList && listOptions.length === 2 && !forceVertical ? (
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
                    click={() =>
                      this.optionClick(
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
              {listOptions.map(
                ({icon, title, operation, color, forceNavigation}, i) => {
                  const iconRender = () => {
                    const {name, size, type, color, solid} = icon;
                    return (
                      <View style={styles.listButtonIcon}>
                        <AllIcons
                          name={name}
                          type={type}
                          color={color}
                          size={size}
                          solid={solid}
                        />
                      </View>
                    );
                  };
                  return (
                    <ButtonColor
                      key={i}
                      view={() => {
                        return (
                          <Row
                            style={{...styleApp.center, ...styleApp.fullSize}}>
                            {icon ? iconRender() : null}
                            <Text style={styles.listButtonText}>{title}</Text>
                          </Row>
                        );
                      }}
                      click={() => this.optionClick(operation, forceNavigation)}
                      color={color ?? colors.primary}
                      style={styles.buttonList}
                      onPressColor={color ?? colors.blueLight}
                    />
                  );
                },
              )}
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
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewModal: {
    bottom: 0,
    position: 'absolute',
    flex: 1,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    backgroundColor: 'white',
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
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
    width: '100%',
    marginBottom: 9,
    marginTop: 7,
  },
  buttonClose: {
    position: 'absolute',
    width: 40,
    height: 40,
    right: '5%',
    top: 15,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  viewIcon: {
    // position: 'absolute',
    width: 39,
    height: 69,
    // right: '12%',
    marginTop: 45,
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    overflow: 'hidden',
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
    borderRadius: 15,
    ...styleApp.shadowWeak,
    marginBottom: 15,
  },
  listButtonText: {
    ...styleApp.textBold,
    color: colors.white,
  },
  listButtonIcon: {
    position: 'absolute',
    left: '5%',
  },
  viewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 10,
  },
});
