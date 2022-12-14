import React, {Component} from 'react';
import {View, Text, Animated, StatusBar} from 'react-native';
import database from '@react-native-firebase/database';
import isEqual from 'lodash.isequal';

import {store} from '../../../../../../../../../store/reduxStore';
import HeaderBackButton from '../../../../../../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../../../../../../layout/scrollViews/ScrollView2';
import Button from '../../../../../../../../layout/buttons/Button';
import CardFlag from './components/CardFlag';

import colors from '../../../../../../../../style/colors';
import styleApp from '../../../../../../../../style/style';
import {
  heightHeaderHome,
  heightFooterBooking,
} from '../../../../../../../../style/sizes';

export default class FinalizeRecording extends Component {
  constructor(props) {
    super(props);
    this.state = {
      member: this.props.route.params.member,
      flagsSelected: {},
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.itemsRef = [];
  }
  componentDidMount() {
    StatusBar.setBarStyle('dark-content', true);
  }
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.route.params.member, state.member)) {
      return {member: props.route.params.member};
    }
    return {};
  }
  confirm = async () => {
    await this.setState({loader: true});
    const {userID} = store.getState().user;
    const {route} = this.props;
    const {flagsSelected, member} = this.state;
    const {coachSessionID} = route.params;
    const {recording} = member;
    const that = this;

    var infoFlags = Object.values(flagsSelected).reduce(function(result, item) {
      const snipetTime = that.itemsRef[item.id].getState('snipetTime');
      result[item.id] = {
        id: item.id,
        time: item.time,
        thumbnail: item.thumbnail,
        startTime: Math.max(0, item.time - snipetTime * 1000),
        stopTime: Math.min(
          recording.stopTimestamp - recording.startTimestamp,
          item.time + snipetTime * 1000,
        ),
      };
      return result;
    }, {});
    let updates = {};
    updates[
      `coachSessions/${coachSessionID}/members/${member.id}/recording/enabled`
    ] = true;
    updates[
      `coachSessions/${coachSessionID}/members/${
        member.id
      }/recording/uploadRequest`
    ] = {
      flagsSelected: infoFlags,
      date: Date.now(),
      userRequested: userID,
    };
    await database()
      .ref()
      .update(updates);

    this.goBack();
  };
  async close() {
    const {route} = this.props;
    const {member} = this.state;
    const {coachSessionID} = route.params;
    let updates = {};
    updates[
      `coachSessions/${coachSessionID}/members/${member.id}/recording/enabled`
    ] = true;
    database()
      .ref()
      .update(updates);
    this.goBack();
  }
  async goBack() {
    const {navigation, route} = this.props;
    const {goBack} = navigation;
    const {onGoBack} = route.params;
    await onGoBack();
    StatusBar.setBarStyle('light-content', true);
    goBack();
  }
  flagList(flags) {
    if (!flags) {
      return null;
    }
    const {member, flagsSelected} = this.state;
    const {recording} = member;
    return (
      <View>
        <View style={styleApp.marginView}>
          <Text style={styleApp.title}>Highlights</Text>
        </View>
        {Object.values(flags)
          .sort((a, b) => a.time - b.time)
          .map((flag) => (
            <CardFlag
              key={flag.id}
              flag={flag}
              totalTime={
                (recording.stopTimestamp - recording.startTimestamp) / 1000
              }
              flagsSelected={flagsSelected}
              onRef={(ref) => (this.itemsRef[flag.id] = ref)}
              click={() => {
                let {flagsSelected} = this.state;
                delete flagsSelected.fullVideo;
                if (flagsSelected[flag.id]) {
                  delete flagsSelected[flag.id];
                } else {
                  flagsSelected = {
                    ...flagsSelected,
                    [flag.id]: {
                      time: flag.time,
                      id: flag.id,
                      thumbnail: flag.thumbnail,
                    },
                  };
                }
                this.setState({flagsSelected});
              }}
            />
          ))}
        <View style={{height: 20}} />
      </View>
    );
  }
  finalizeRecording() {
    const {member, flagsSelected} = this.state;
    const {recording} = member;
    const {flags} = recording;
    return (
      <View style={[{minHeight: 800}]}>
        {this.flagList(flags)}
        <View style={styleApp.marginView}>
          <Text style={styleApp.title}>Full video</Text>
        </View>
        <CardFlag
          flagsSelected={flagsSelected}
          onRef={(ref) => (this.itemsRef.fullVideo = ref)}
          click={() => {
            if (flagsSelected.fullVideo) {
              return this.setState({flagsSelected: {}});
            }
            return this.setState({
              flagsSelected: {
                ['fullVideo']: {
                  id: 'fullVideo',
                  time: 0,
                  thumbnail: recording.thumbnail,
                },
              },
            });
          }}
          disableSelectTime={true}
          flag={{
            time:
              recording.stopTimestamp - recording.startTimestamp
                ? recording.stopTimestamp - recording.startTimestamp
                : '',
            fullVideo: true,
            thumbnail: recording.thumbnail,
            id: 'fullVideo',
          }}
        />
      </View>
    );
  }
  render() {
    const {loader, flagsSelected} = this.state;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Upload recording'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="times"
          icon2={null}
          clickButton1={() => this.close()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.finalizeRecording.bind(this)}
          marginBottomScrollView={0}
          marginTop={heightHeaderHome}
          offsetBottom={heightFooterBooking}
          showsVerticalScrollIndicator={true}
        />

        <View style={[styleApp.footerBooking, styleApp.marginView]}>
          <Button
            text={
              Object.values(flagsSelected).length === 0
                ? 'Confirm uploads'
                : 'Confirm uploads (' +
                  Object.values(flagsSelected).length +
                  ')'
            }
            disabled={Object.values(flagsSelected).length === 0}
            backgroundColor={'green'}
            loader={loader}
            onPressColor={colors.greenLight}
            click={() => this.confirm()}
          />
        </View>
      </View>
    );
  }
}
