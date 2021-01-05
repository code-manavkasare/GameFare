import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import isEqual from 'lodash.isequal';

import ButtonColor from '../../../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../../../layout/icons/AllIcons';
import AsyncImage from '../../../../../../../../../layout/image/AsyncImage';

import colors from '../../../../../../../../../style/colors';
import styleApp from '../../../../../../../../../style/style';
import Loader from '../../../../../../../../../layout/loaders/Loader';
import {
  formatDuration,
  FormatDate,
  duration,
} from '../../../../../../../../../functions/date';
import CardUser from '../../../../../../../../../layout/cards/CardUser';

export default class CardFlag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: this.props.flag,
      snipetTime: 15,
      selected: false,
    };
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.flag, state.flag)) {
      return {flag: props.flag};
    }
    return {};
  }
  getState(state) {
    return this.state[state];
  }
  addSnipetTime(addingValue) {
    const {snipetTime, flag} = this.state;
    const {thumbnail} = flag;
    const {flagsSelected, click} = this.props;
    let newVal = snipetTime + addingValue;
    if (newVal < 5) {
      newVal = 5;
    }
    if (!flagsSelected[flag.id] && thumbnail) {
      click();
    }
    this.setState({snipetTime: newVal});
  }
  selectTime = () => {
    const {disableSelectTime, flagsSelected} = this.props;
    if (disableSelectTime) {
      return null;
    }
    const {flag, snipetTime} = this.state;
    return (
      <Row>
        <Col
          size={10}
          style={styleApp.center}
          activeOpacity={0.8}
          onPress={() => this.addSnipetTime(-5)}>
          <AllIcons
            name={'minus-circle'}
            type="font"
            color={flagsSelected[flag.id] ? colors.green : colors.off}
            size={20}
          />
        </Col>
        <Col size={15} style={styleApp.center}>
          <Text style={[styleApp.textBold, {fontSize: 13}]}>
            {snipetTime}sec
          </Text>
        </Col>
        <Col
          size={10}
          style={styleApp.center}
          activeOpacity={0.8}
          onPress={() => this.addSnipetTime(5)}>
          <AllIcons
            name={'plus-circle'}
            type="font"
            color={flagsSelected[flag.id] ? colors.green : colors.off}
            size={20}
          />
        </Col>
      </Row>
    );
  };
  buttonStyle(flagsSelected, size) {
    const {flag} = this.state;
    let style = size === 'sm' ? {...styles.button} : {...styles.buttonLg};
    return {
      ...style,
      borderColor: flagsSelected[flag.id] ? colors.green : colors.off + '00',
    };
  }
  cardFlag = () => {
    const {
      flagsSelected,
      click,
      totalTime,
      memberID,
      stopTimestamp,
      size,
    } = this.props;
    const {flag, snipetTime} = this.state;
    const {thumbnail, time, id} = flag;
    const flagTime = Number((time / 1000).toFixed(0));
    const startTime = Math.max(0, flagTime - snipetTime);
    const endTime = Math.min(flagTime + snipetTime, totalTime);
    return (
      <ButtonColor
        color={colors.white}
        onPressColor={colors.off2}
        click={() => click()}
        style={this.buttonStyle(flagsSelected, size)}
        view={() => {
          if (size === 'sm') {
            return (
              <Row style={{width: '100%'}}>
                <Col size={30} style={styleApp.center2}>
                  <View
                    style={[
                      styles.img,
                      styleApp.center,
                      {backgroundColor: colors.greyLight},
                    ]}>
                    {thumbnail ? (
                      <AsyncImage mainImage={thumbnail} style={styles.img} />
                    ) : (
                      <Loader size={30} color={colors.grey} />
                    )}
                  </View>
                  <View style={styles.memberPictureContainer}>
                    {memberID ? (
                      <CardUser
                        id={memberID}
                        imgOnly
                        styleImg={styleApp.fullSize}
                      />
                    ) : null}
                  </View>
                </Col>
                <Col size={70} style={[styleApp.center2, {paddingLeft: 10}]}>
                  {stopTimestamp ? (
                    <Text style={[styleApp.text, {fontSize: 12}]}>
                      <FormatDate date={stopTimestamp} />
                    </Text>
                  ) : null}
                  <Text style={[styleApp.textBold, {fontSize: 12}]}>
                    {!id.includes('fullVideo') && endTime
                      ? duration(startTime) + ' to ' + duration(endTime)
                      : flagTime && stopTimestamp
                      ? formatDuration({
                          duration: flagTime,
                          inputUnit: 'second',
                          formatType: 'textBrief',
                        })
                      : 'Loading...'}
                  </Text>
                </Col>
              </Row>
            );
          } else {
            return (
              <Col style={{...styleApp.fullSize}}>
                <Row size={80} style={styleApp.center2}>
                  <View
                    style={[
                      styles.imgLg,
                      styleApp.center,
                      {backgroundColor: colors.greyLight},
                    ]}>
                    {thumbnail ? (
                      <AsyncImage mainImage={thumbnail} style={styles.imgLg} />
                    ) : (
                      <Loader size={30} color={colors.grey} />
                    )}
                  </View>
                  <View style={styles.memberPictureContainerLg}>
                    {memberID ? (
                      <CardUser
                        id={memberID}
                        imgOnly
                        styleImg={styleApp.fullSize}
                      />
                    ) : null}
                  </View>
                </Row>
                <Row size={20} style={[styleApp.center2, {paddingLeft: 10}]}>
                  <Col style={{...styleApp.center2}}>
                    {stopTimestamp ? (
                      <Text style={[styleApp.text, {fontSize: 12}]}>
                        <FormatDate date={stopTimestamp} />
                      </Text>
                    ) : null}
                    <Text style={[styleApp.textBold, {fontSize: 12}]}>
                      {!id.includes('fullVideo') && endTime
                        ? duration(startTime) + ' to ' + duration(endTime)
                        : flagTime
                        ? formatDuration({
                            duration: flagTime,
                            inputUnit: 'second',
                            formatType: 'textBrief',
                          })
                        : 'Loading...'}
                    </Text>
                  </Col>
                </Row>
              </Col>
            );
          }
        }}
      />
    );
  };

  render() {
    return this.cardFlag();
  }
}

const styles = StyleSheet.create({
  button: {
    height: 90,
    width: 190,
    minWidth: 190,
    marginTop: 10,
    paddingTop: 5,
    paddingBottom: 5,
    marginRight: 5,
    paddingRight: 5,
    borderRadius: 10,
    paddingLeft: 5,
    borderWidth: 1,
  },
  buttonLg: {
    height: '90%',
    width: 190,
    minWidth: 190,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginRight: 15,
    paddingRight: 10,
    borderRadius: 10,
    paddingLeft: 10,
    borderWidth: 1,
  },
  img: {
    height: '100%',
    width: '100%',
    borderRadius: 6,
  },
  imgLg: {
    ...styleApp.fullSize,
    borderRadius: 6,
  },
  memberPicture: {
    ...styleApp.fullSize,
    borderRadius: 30,
  },
  memberPictureContainer: {
    height: 24,
    width: 24,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: colors.white,
    position: 'absolute',
    bottom: -5,
    right: -10,
  },
  memberPictureContainerLg: {
    height: 34,
    width: 34,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.white,
    position: 'absolute',
    bottom: -8,
    right: -5,
  },
});
