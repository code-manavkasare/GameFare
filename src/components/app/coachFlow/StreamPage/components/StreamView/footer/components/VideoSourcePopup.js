import React, {Component} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated, Easing
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';
import {Stopwatch} from 'react-native-stopwatch-timer';

import ButtonColor from '../../../../../../../layout/Views/Button';
import AsyncImage from '../../../../../../../layout/image/AsyncImage';

import {native} from '../../../../../../../animations/animations';

import colors from '../../../../../../../style/colors';
import sizes from '../../../../../../../style/sizes';
import styleApp from '../../../../../../../style/style';

class VideoSourcePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
    this.scaleCard = new Animated.Value(0);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  static getDerivedStateFromProps (props, state) {
    return { members: props.members ? 
        Object.values(props.members).filter((member) => {
          return (member.isConnected && member.permissionOtherUserToRecord)
        }) 
      : undefined }
  }

  open() {
    this.setState({visible: true})
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(1)),
    ]).start();
  }

  close() {
    this.setState({visible: false})
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(0)),
    ]).start();
  }

  memberRow(member, i) {
    const {userID} = this.props
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
      <View style={{width:'100%'}} key={member.id}>
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={1} style={styleApp.center2}>
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

              <Col size={2} style={[styleApp.center2]}>
                <Text style={styles.nameText} numberOfLines={1}> 
                  {
                    (userID === member.id) 
                    ? 
                    'Your Camera' 
                    : 
                    firstname + ' ' + lastname
                  }
                </Text>
              </Col>

              <Col size={1} style={[styleApp.center, {alignContent:'flex-end'}]}>
                {
                  member.recording && member.recording.isRecording 
                  ? 
                  timer(member.recording.timestamp) 
                  : 
                  <View style={styles.recordButton}>
                    <Text style={[styleApp.text, {color: colors.white, fontSize: 14}]}>Record</Text>
                  </View>
                }
              </Col>
            </Row>
          );
        }}
        click={() => this.props.selectMember(member)}
        key={member.id}
        color="white"
        style={[styles.cardUser]}
        onPressColor={colors.off2}
      />
      </View>
    );
  }

  backdrop() {
    const {visible} = this.state;

    return (
      <TouchableWithoutFeedback onPress={() => this.close()}>
        <View pointerEvents={visible?"auto":"none"} style={styles.fullPage} />
      </TouchableWithoutFeedback>
    )
  }

  render() {
    const {visible} = this.state;
    const {members} = this.state;
    
    const translateY = this.scaleCard.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View 
        pointerEvents={visible?"auto":"none"} 
        style={[styles.square, styleApp.center, 
          {
            opacity: this.scaleCard,
            transform: [{translateY: translateY}],
          }]}
      >
        <Text style={[styleApp.text, styles.text]}>Choose a video source</Text>
        <View style={[styleApp.divider2, {marginTop: 10, marginBottom: 5}]} />
        {members ? members.map(this.memberRow.bind(this)) : null}
        <View style={styles.triangle} />
        {this.backdrop()}
      </Animated.View>
    );
  }
}

const triangleBase = 21;

const styles = StyleSheet.create({
  square: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    width:sizes.width - 50,
    bottom: 100 + sizes.offsetFooterStreaming,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex:2
  },
  triangle: {
    borderLeftWidth: triangleBase / 1.5,
    borderRightWidth: triangleBase / 1.5,
    borderTopWidth: triangleBase,
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
    position: 'absolute',
    bottom: -triangleBase,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex:1
  },
  cardUser: {
    height: 55,
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
  fullPage: {
    position: 'absolute',
    width: sizes.width,
    height: 200000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  text: {
    marginTop: 15,
    marginHorizontal: 'auto',
    textAlign: 'center',
    fontWeight:'bold'
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
    paddingRight:15,
    marginLeft:-5
  }
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
