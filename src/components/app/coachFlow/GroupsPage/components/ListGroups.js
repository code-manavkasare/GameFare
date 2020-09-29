import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';

import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';

import {navigate} from '../../../../../../NavigationService';
import CardStreamView from './CardStreamView';
import {rowTitle} from '../../../TeamPage/components/elements';
import {FlatListComponent} from '../../../../layout/Views/FlatList';
import {newSession} from '../../../../functions/coach';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import sizes from '../../../../style/sizes';
import Button from '../../../../layout/buttons/Button';

class ListStreams extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.itemsRef = [];
  }
  sessionsArray = () => {
    let {coachSessions} = this.props;
    if (!coachSessions) {
      return [];
    }
    return Object.values(coachSessions)
      .sort(function(a, b) {
        return b.timestamp - a.timestamp;
      })
      .filter((s) => {
        return s?.id !== undefined;
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
    const {userConnected, AnimatedHeaderValue} = this.props;
    if (!userConnected || !coachSessions) {
      return null;
    }
    console.log('AnimatedHeaderValue', AnimatedHeaderValue);
    if (Object.values(coachSessions).length === 0) {
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
    }
    return (
      <FlatListComponent
        list={coachSessions}
        cardList={({item: session}) =>
          session.id && (
            <CardStreamView
              coachSessionID={session.id}
              key={session.objectID}
              scale={1}
              onRef={(ref) => this.itemsRef.push(ref)}
            />
          )
        }
        numColumns={1}
        inverted={false}
        incrementRendering={6}
        initialNumberToRender={8}
        styleContainer={{marginTop: 10}}
        AnimatedHeaderValue={AnimatedHeaderValue}
        paddingBottom={sizes.heightFooter + sizes.marginBottomApp}
      />
    );
  };

  render() {
    return this.list();
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: state.user.infoUser.coachSessions,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {},
)(ListStreams);
