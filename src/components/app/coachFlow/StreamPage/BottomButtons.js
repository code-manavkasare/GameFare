import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';

import NavigationService from '../../../../../NavigationService';

import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {timing} from '../../../animations/animations';
import {Col, Row} from 'react-native-easy-grid';

import {width} from '../../../style/sizes';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class StreamPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      showPastSessionsPicker: false,
    };
    this.animateButtonRed = new Animated.Value(0);
  }
  openListSession() {
    return true;
  }
  buttonAddCoach() {
    const {AddMembers} = this.props;
    const {userID} = this.props;
    const {organizer} = this.props.session.info
    const isAdmin = organizer === userID
    if (!isAdmin) return null
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styles.buttonText}>
              <AllIcons
                type={'font'}
                color={colors.white}
                size={23}
                name={'plus'}
              />
              <Text
                style={[
                  styleApp.title,
                  {color: colors.white, marginTop: 6, fontSize: 16},
                ]}>
                Invite
              </Text>
            </Animated.View>
          );
        }}
        click={async () => AddMembers()}
        // color={colors.red}
        style={{height: '100%', width: '100%'}}
        onPressColor={colors.redLight}
      />
    );
  }
  reviewSession() {
    const {showPastSessionsPicker} = this.state;
    const {clickReview} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={styles.buttonText}>
              <AllIcons
                type={'font'}
                color={showPastSessionsPicker ? colors.green : colors.white}
                size={23}
                name={'film'}
              />
              <Text
                style={[
                  styleApp.title,
                  {
                    color: showPastSessionsPicker ? colors.green : colors.white,
                    marginTop: 4,
                    fontSize: 16,
                  },
                ]}>
                Review
              </Text>
            </Animated.View>
          );
        }}
        click={async () => {
          this.setState({
            showPastSessionsPicker: !this.state.showPastSessionsPicker,
          });
          clickReview(!showPastSessionsPicker);
        }}
        // color={colors.red}
        style={{height: '100%', width: '100%'}}
        onPressColor={colors.redLight}
      />
    );
  }
  buttonRecord() {
    const {sizeButtonRed, borderRadiusButtonRed} = this.animationButtonRed();
    return (
      <View style={[styleApp.center, styleApp.fullView]}>
        <ButtonColor
          view={() => {
            return (
              <Animated.View
                style={[
                  styles.redButtonRecord,
                  {
                    height: sizeButtonRed,
                    width: sizeButtonRed,
                    borderRadius: borderRadiusButtonRed,
                  },
                ]}></Animated.View>
            );
          }}
          click={async () => {
            const {recording} = this.state;

            if (recording)
              await Animated.timing(
                this.animateButtonRed,
                timing(0, 200),
              ).start();
            else
              await Animated.timing(
                this.animateButtonRed,
                timing(1, 150),
              ).start();

            this.setState({recording: !recording});
            if (recording)
              return NavigationService.navigate('SaveCoachSession');
          }}
          // color={colors.red}
          style={styleApp.buttonStartStreaming}
          onPressColor={colors.redLight}
        />
      </View>
    );
  }
  rowButtons() {
    return (
      <Row style={[{height: 110, width: width}]}>
        <Col style={styleApp.center}>{this.reviewSession()}</Col>
        <Col style={styleApp.center}>{this.buttonRecord()}</Col>
        <Col style={styleApp.center}>{this.buttonAddCoach()}</Col>
      </Row>
    );
  }
  animationButtonRed() {
    const sizeButtonRed = this.animateButtonRed.interpolate({
      inputRange: [0, 1],
      extrapolate: 'clamp',
      outputRange: [60, 40],
    });
    const borderRadiusButtonRed = this.animateButtonRed.interpolate({
      inputRange: [0, 1],
      extrapolate: 'clamp',
      outputRange: [30, 6],
    });
    return {sizeButtonRed, borderRadiusButtonRed};
  }
  render() {
    return this.rowButtons();
  }
}

const styles = StyleSheet.create({
  rowButtons: {
    position: 'absolute',
    bottom: 350,
    width: width,
    // flex:1,
  },
  redButtonRecord: {
    ...styleApp.center,
    height: 66,
    width: 66,
    borderRadius: 40,
    backgroundColor: colors.red,
  },
  buttonText: {...styleApp.center},
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    coach: state.coach,
  };
};

export default connect(mapStateToProps, {coachAction})(StreamPage);
