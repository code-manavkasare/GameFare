import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';
import isEqual from 'lodash.isequal';

import {connect} from 'react-redux';

import {navigate} from '../../../../../../NavigationService';

import CardStreamView from './CardStreamView';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import Button from '../../../../layout/buttons/Button';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coachSessions: false,
    };
    this.itemsRef = [];
  }
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.coachSessions, state.coachSessions)) {
      return {
        coachSessions: props.coachSessions,
      };
    }
    return {};
  }
  sessionsArray = () => {
    let {coachSessions} = this.state;
    if (!coachSessions) return [];
    return Object.values(coachSessions).sort(function(a, b) {
      return b.timestamp - a.timestamp;
    });
  };
  list = () => {
    const styleViewLiveLogo = {
      ...styleApp.center,
      backgroundColor: colors.off,
      height: 45,
      width: 45,
      borderRadius: 22.5,
      borderWidth: 1,
      borderColor: colors.grey,
      marginTop: -100,
      marginLeft: 65,
    };
    const coachSessions = this.sessionsArray();
    const {
      coachSessionsData,
      userConnected,
      permissionsCamera,
      newSession,
    } = this.props;
    if (!userConnected || !permissionsCamera || !coachSessions) return null;
    if (Object.values(coachSessions).length === 0)
      return (
        <View style={[styleApp.marginView, styleApp.center]}>
          <View style={[styleApp.center, {marginBottom: 80}]}>
            <Image
              source={require('../../../../../img/images/racket.png')}
              style={{height: 80, width: 80, marginTop: 30}}
            />
            <View style={styleViewLiveLogo}>
              <Image
                source={require('../../../../../img/images/live-news.png')}
                style={{
                  height: 27,
                  width: 27,
                }}
              />
            </View>
          </View>

          <Button
            text={'Start a video chat'}
            icon={{
              name: 'plus',
              size: 18,
              type: 'font',
              color: colors.white,
            }}
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            click={async () => newSession()}
          />
          <View style={{height: 20}} />
          <Button
            text={'Find a coach'}
            icon={{
              name: 'whistle',
              size: 27,
              type: 'moon',
              color: colors.white,
            }}
            backgroundColor={'blue'}
            onPressColor={colors.blueLight}
            click={() => navigate('Coaches')}
          />
        </View>
      );
    return Object.values(coachSessions).map((session, i) => {
      if (coachSessionsData[session.id]) {
        return (
          <CardStreamView
            coachSessionID={session.id}
            key={session.id}
            scale={1}
            onRef={(ref) => this.itemsRef.push(ref)}
          />
        );
      }
    });
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessionsData: state.coachSessions,
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
