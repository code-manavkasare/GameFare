import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';

import NavigationService from '../../../../../NavigationService';

import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import {coachAction} from '../../../../actions/coachActions';
import {timing} from '../../../animations/animations';
import {timeout} from '../../../functions/coach';
import {Col, Row} from 'react-native-easy-grid';

import sizes from '../../../style/sizes';
import colors from '../../../style/colors';
import styleApp from '../../../style/style';

class RightButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  button(icon, text, active, click, colorActive) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Animated.View style={[styleApp.center]}>
              <AllIcons
                type={icon.type}
                color={
                  active && colorActive
                    ? colorActive
                    : active
                    ? colors.primary
                    : colors.white
                }
                size={19}
                name={icon.name}
              />
              <Text
                style={[
                  styleApp.text,
                  styles.textButton,
                  {
                    color:
                      active && colorActive
                        ? colorActive
                        : active
                        ? colors.primary
                        : colors.white,
                  },
                ]}>
                {text}
              </Text>
            </Animated.View>
          );
        }}
        click={async () => click()}
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
  buttons() {
    const {state, setState, session} = this.props;
    const {userID} = this.props;
    if (!session) return null;
    const member = session.members[userID];
    console.log('session right buttons', session);
    console.log('member', member);
    // return null;
    if (!member) return null;
    const {objectID: sessionID} = session;
    const {shareScreen} = member;
    const {cameraFront, draw} = state;
    console.log('render right buttons', session);
    return (
      <View style={styles.colButtonsRight}>
        {this.button(
          {name: 'sync', type: 'font'},
          cameraFront ? 'Front' : 'Back',
          !cameraFront,
          () => {
            
            setState({
              cameraFront: !cameraFront,
            });
          },
        )}
        {this.button(
          {name: 'mobile-alt', type: 'font'},
          'Share',
          shareScreen,
          async () => {
            console.log('click share screen');
            if (shareScreen) {
              setState({draw: false});
            }
            await setState({hidePublisher: true, screen: !shareScreen});
            await firebase
              .database()
              .ref('coachSessions/' + sessionID + '/members/' + userID)
              .update({shareScreen: !shareScreen});
            await timeout(1000);

            await setState({hidePublisher: false});
          },
          colors.green,
        )}

        {shareScreen &&
          this.button(
            {name: 'magic', type: 'font'},
            'Draw',
            draw,
            () => {
              // this.props.openDraw(!draw);
              setState({draw: !draw});
            },
            colors.secondary,
          )}
      </View>
    );
  }
  render() {
    return this.buttons();
  }
}

const styles = StyleSheet.create({
  colButtonsRight: {
    flex: 1,
    // backgroundColor: 'red',
    position: 'absolute',
    right: 10,
    zIndex: 5,
    top: sizes.heightHeaderHome,
    width: 65,
  },
  button: {height: 65, width: '100%'},
  textButton: {
    fontSize: 11,
    marginTop: 7,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    settings: state.coach.settings,
  };
};

export default connect(mapStateToProps, {coachAction})(RightButtons);
