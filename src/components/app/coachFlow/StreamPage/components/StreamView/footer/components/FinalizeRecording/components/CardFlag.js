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
import {formatDuration, duration} from '../../../../../../../../../functions/date';

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
    const {flagsSelected, click, totalTime} = this.props;
    const {flag, snipetTime} = this.state;
    const {thumbnail, time, id} = flag;
    const flagTime = Number((time / 1000).toFixed(0));
    const startTime = Math.max(0, flagTime - snipetTime);
    const endTime = Math.min(flagTime + snipetTime, totalTime);
    return (
      <ButtonColor
        color={colors.white}
        onPressColor={colors.off}
        click={() => (thumbnail ? click() : true)}
        style={styles.button}
        view={() => {
          return (
            <Row>
              <Col size={30} style={styleApp.center2}>
                {thumbnail ? (
                  <AsyncImage mainImage={thumbnail} style={styles.img} />
                ) : (
                  <View
                    style={[
                      styles.img,
                      styleApp.center,
                      {backgroundColor: colors.off2},
                    ]}>
                    <Loader size={30} color={colors.title} />
                  </View>
                )}
              </Col>
              <Col size={55} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text style={[styleApp.textBold, {fontSize: 13}]}>
                  {id !== 'fullVideo'
                    ? formatDuration(endTime - startTime)
                    : formatDuration(flagTime)}{' '}
                </Text>
                {id !== 'fullVideo' && (
                  <Text style={[styleApp.textBold, {fontSize: 14}]}>
                    <Text style={{fontWeight: 'normal', fontSize: 12}}>
                      from
                    </Text>{' '}
                    {duration(startTime)}{' '}
                    <Text style={{fontWeight: 'normal', fontSize: 12}}>to</Text>{' '}
                    {duration(endTime)}
                  </Text>
                )}
                {/* {this.selectTime()} */}
              </Col>

              <Col size={15} style={styleApp.center3}>
                <AllIcons
                  name={
                    flagsSelected[flag.id] ? 'check-circle' : 'check-circle'
                  }
                  type="font"
                  color={flagsSelected[flag.id] ? colors.green : colors.off}
                  size={22}
                />
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
    marginTop: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  img: {
    height: 60,
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.off,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(CardFlag);
