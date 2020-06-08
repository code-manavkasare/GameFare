import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import {Stopwatch} from 'react-native-stopwatch-timer';
import isEqual from 'lodash.isequal';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';
import AllIcons from '../../../../../../../layout/icons/AllIcons';

import colors from '../../../../../../../style/colors';
import styleApp from '../../../../../../../style/style';

class VideoSourcePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      member: {},
    };
    this.scaleCard = new Animated.Value(0);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.member, state.member) && props.member)
      return {member: props.member};
    return {};
  }
  member() {
    const {member} = this.state;
    const {userID, selectMember} = this.props;
    const {firstname, lastname, picture} = member.info;
    const optionsTimer = {
      container: styles.viewRecordingTime,
      text: [styleApp.text, {color: colors.white, fontSize: 14}],
    };

    const timer = (startTimeRecording) => {
      const timerRecording = Number(new Date()) - startTimeRecording;
      return (
        <Stopwatch
          laps
          start={true}
          startTime={timerRecording < 0 ? 0 : timerRecording}
          options={optionsTimer}
        />
      );
    };

    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center2}>
                {member.info.picture ? (
                  <AsyncImage
                    style={styles.imgUser}
                    mainImage={picture}
                    imgInitial={picture}
                  />
                ) : (
                  <View style={[styleApp.center, styles.imgUser]}>
                    <Text style={[styleApp.text, {fontSize: 12}]}>
                      {firstname[0]}
                      {lastname !== '' ? lastname[0] : ''}
                    </Text>
                  </View>
                )}
              </Col>

              <Col size={40} style={[styleApp.center2]}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {userID === member.id
                    ? 'Your Camera'
                    : firstname + ' ' + lastname}
                </Text>
              </Col>

              <Col size={10} style={[styleApp.center]}>
                {/* <AllIcons
                  name="flag"
                  size={20}
                  color={colors.title}
                  type="font"
                /> */}
              </Col>

              <Col size={30} style={styleApp.center3}>
                {member.recording && member.recording.isRecording ? (
                  timer(member.recording.timestamp)
                ) : (
                  <View style={styles.recordButton}>
                    <Text
                      style={[
                        styleApp.text,
                        {color: colors.white, fontSize: 14},
                      ]}>
                      Record
                    </Text>
                  </View>
                )}
              </Col>
            </Row>
          );
        }}
        click={() => selectMember(member)}
        key={member.id}
        color="white"
        style={[styles.cardUser]}
        onPressColor={colors.off2}
      />
    );
  }
  render() {
    return this.member();
  }
}

const styles = StyleSheet.create({
  cardUser: {
    height: 55,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
  text: {
    marginTop: 15,
    marginHorizontal: 'auto',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  viewRecordingTime: {
    width: 70,
    height: 23,
    borderRadius: 5,
    ...styleApp.center,
    backgroundColor: colors.red,
  },
  recordButton: {
    width: 70,
    height: 23,
    borderRadius: 5,
    ...styleApp.center,
    backgroundColor: colors.greyDark,
  },
  nameText: {
    ...styleApp.text,
    paddingRight: 15,
    marginLeft: -5,
  },
});

VideoSourcePopup.propTypes = {
  members: PropTypes.array.isRequired,
  selectMember: PropTypes.func,
  close: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(VideoSourcePopup);
