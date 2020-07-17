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
import {formatDuration, formatDate, duration} from '../../../../../../../../../functions/date';

class CardFlag extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: this.props.flag,
      snipetTime: 15,
      selected: false,
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.flag, state.flag)) return {flag: props.flag};
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
    if (newVal < 5) newVal = 5;
    if (!flagsSelected[flag.id] && thumbnail) click();
    this.setState({snipetTime: newVal});
  }
  selectTime = () => {
    const {disableSelectTime, flagsSelected} = this.props;
    if (disableSelectTime) return null;
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
  cardFlag = () => {
    const {flagsSelected, click, totalTime, memberPicture, startTimestamp} = this.props;
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
        style={{
          ...styles.button,
          borderWidth: 1,
          borderColor: flagsSelected[flag.id] ? colors.green : (colors.off + '00')
        }}
        view={() => {
          return (
            <Row style={{width:'100%'}}>
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
                  {memberPicture &&
                  <AsyncImage mainImage={memberPicture} style={styles.memberPicture} />
                  }
                </View>
              </Col>
              <Col size={70} style={[styleApp.center2, {paddingLeft: 10}]}>
                {startTimestamp ? <Text style={[styleApp.text, {fontSize: 12}]}>
                {formatDate(startTimestamp)}
                </Text> : null}
                <Text style={[styleApp.textBold, {fontSize: 12}]}>
                  {!id.includes('fullVideo') && endTime
                    ? (duration(startTime) + ' to ' + duration(endTime))
                    : flagTime ? formatDuration(flagTime) : 'Loading...' }
                </Text>
              </Col>
            </Row>
          );
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
    height: 70,
    width:190,
    minWidth:190,
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginRight:5,
    paddingRight:5,
    borderRadius:10,
    paddingLeft:5
  },
  img: {
    ...styleApp.shadowWeak,
    height: 60,
    width: '100%',
    borderRadius: 6,
  },
  memberPicture: {
    ...styleApp.fullSize,
    borderRadius: 30,
  },
  memberPictureContainer: {
    ...styleApp.shadowWeak,
    height:20,
    width:20,
    borderRadius: 30,
    // overflow: 'hidden',
    position:'absolute',
    bottom:-7,
    right:-2
  }
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(CardFlag);
