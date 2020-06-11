import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';
import isEqual from 'lodash.isequal';
import StatusBar from '@react-native-community/status-bar';

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

class FinalizeRecording extends Component {
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
  componentDidUpdate(prevProps) {
    console.log('componentDidUpdate', prevProps.route.params);
  }
  static getDerivedStateFromProps(props, state) {
    if (!isEqual(props.route.params.member, state.member))
      return {member: props.route.params.member};
    return {};
  }
  confirm = async () => {
    await this.setState({loader: true});
    const {route, userID} = this.props;
    const {flagsSelected, member} = this.state;
    const {coachSessionID} = route.params;
    const {recording} = member;
    const that = this;

    console.log('confirm', member);
    console.log('coachSessionID', coachSessionID);
    var infoFlags = Object.values(flagsSelected).reduce(function(result, item) {
      const snipetTime = that.itemsRef[item.id].getState('snipetTime');
      result[item.id] = {
        id: item.id,
        time: item.time,
        startTime: Math.max(0, item.time - snipetTime * 1000),
        stopTime: Math.min(
          recording.stopTimestamp - recording.startTimestamp,
          item.time + snipetTime * 1000,
        ),
      };
      return result;
    }, {});
    let updates = {};
    console.log('infoGroups', infoFlags);
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
  async goBack() {
    const {navigation, route} = this.props;
    const {goBack} = navigation;
    const {onGoBack} = route.params;
    await onGoBack();
    StatusBar.setBarStyle('light-content', true);
    goBack();
  }
  flagList(flags) {
    if (!flags) return null;
    const {flagsSelected} = this.state;
    return (
      <View>
        <View style={styleApp.marginView}>
          <Text style={styleApp.title}>
            Pick the video segments you’d like to upload!
          </Text>
          <Text style={[styleApp.text, {marginTop: 10, marginBottom: 10}]}>
            You can pick the duration of the video upload on either side of the
            highlight flag you placed. A setting of 30 seconds means the video
            will be 1min long, and will start 30 seconds prior to the highlight
            flag and end 30 seconds after it.
          </Text>
        </View>
        {Object.values(flags).map((flag) => (
          <CardFlag
            key={flag.id}
            flag={flag}
            flagsSelected={flagsSelected}
            onRef={(ref) => (this.itemsRef[flag.id] = ref)}
            click={() => {
              let {flagsSelected} = this.state;
              delete flagsSelected['fullVideo'];
              if (flagsSelected[flag.id]) delete flagsSelected[flag.id];
              else
                flagsSelected = {
                  ...flagsSelected,
                  [flag.id]: {
                    time: flag.time,
                    id: flag.id,
                  },
                };
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
    console.log('recording', recording);
    const {flags} = recording;
    return (
      <View style={[{minHeight: 800}]}>
        {this.flagList(flags)}
        <View style={styleApp.marginView}>
          <Text style={styleApp.title}>Full video</Text>
        </View>
        <CardFlag
          flagsSelected={flagsSelected}
          onRef={(ref) => (this.itemsRef['fullVideo'] = ref)}
          click={() => {
            if (flagsSelected['fullVideo'])
              return this.setState({flagsSelected: {}});
            return this.setState({
              flagsSelected: {
                ['fullVideo']: {
                  id: 'fullVideo',
                  time: 0,
                },
              },
            });
          }}
          disableSelectTime={true}
          flag={{
            time: recording.stopTimestamp - recording.startTimestamp,
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
          textHeader={'Finalize record'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="times"
          icon2={null}
          clickButton1={() => this.goBack()}
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

const styles = StyleSheet.create({
  button: {
    height: 55,
    width: 55,
    borderRadius: 30,
    borderWidth: 0,
    borderColor: colors.off,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(FinalizeRecording);
