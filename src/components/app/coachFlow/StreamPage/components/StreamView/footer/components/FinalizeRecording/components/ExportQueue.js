import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing, ScrollView} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {native} from '../../../../../../../../../animations/animations'
import {uploadQueueAction} from '../../../../../../../../../../actions/uploadQueueActions';
import ButtonColor from '../../../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../../../layout/icons/AllIcons';
import sizes from '../../../../../../../../../style/sizes';
import Button from '../../../../../../../../../layout/buttons/Button';

import colors from '../../../../../../../../../style/colors';
import styleApp from '../../../../../../../../../style/style';
import CardFlag from './CardFlag'

class ExportQueue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      members: {},
      flags: undefined,
      recordings: undefined,
      exportingMembers: [],
      visible: false,
      flagsSelected: {},
      loader: false,
      selfThumbnails: undefined
    };
    this.itemsRef = [];
    this.scaleCard = new Animated.Value(0);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentDidUpdate(prevProps, prevState) {
    let {members} = this.state
    for (var member in members) {
      let isConnected = members[member]?.isConnected
      if (prevState.members[member]?.isConnected && !isConnected)
        delete members[member]
    }
    if (members?.length === 0 && prevState.members?.length > 0) {
      this.close()
    }
  }

  resetState() {
    this.setState({
      members: {},
      flags: undefined,
      recordings: undefined,
      exportingMembers: [],
      visible: false,
      flagsSelected: {},
      loader: false,
      selfThumbnails: undefined
    })
  }

  static getDerivedStateFromProps(props, state) {
    const {exportingMembers, selfThumbnails} = state
    const {userID} = props
    let members = props.members.filter((m) => exportingMembers.includes(m?.id))
    if (selfThumbnails) {
      let selfIndex = members.findIndex((m) => m?.id === userID)
      for (var thumbnail in selfThumbnails) {
        let {filename, path} = selfThumbnails[thumbnail]
        if (filename == "Thumbnail full video") {
          members[selfIndex].recording.thumbnail = path
        } 
      }
    }
    let flags = {}
    let recordings = []
    let loader = false
    for (var member in members) {
      flags = {...flags, ...members[member]?.recording?.flags}
      recordings.push(members[member]?.recording)
      if (!members[member]?.recording?.localSource) loader = true
    }
    return {members, flags, recordings, loader}
  }

  async open(member, selfThumbnails) {
    let {flagsSelected, exportingMembers} = this.state
    flagsSelected[`${member.id}-fullVideo`] = {
      time: 0,
      id: `${member.id}-fullVideo`,
      source: member.id,
    }
    if (exportingMembers.findIndex((m) => m === member.id) === -1)
      exportingMembers.push(member.id)
    await this.setState({
      visible: true, 
      flagsSelected,
      exportingMembers,
      selfThumbnails
    });
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(1, 300)),
    ]).start();
  }

  close(ignore) {
    this.props.onClose()
    Animated.parallel([
      Animated.timing(this.scaleCard, native(0, 300)),
    ]).start();

    if (!ignore) {
      const {members} = this.state;
      const {coachSessionID} = this.props;
      let updates = {};
      for (m in members) {
      let member = members[m]
      if (member !== undefined && member.id !== undefined)
          updates[
            `coachSessions/${coachSessionID}/members/${members[m].id}/recording/enabled`
          ] = true;
          updates[
            `coachSessions/${coachSessionID}/members/${members[m].id}/recording/uploadRequest`
          ] = {};
      }
      if (Object.values(updates).length > 0) {
        database()
          .ref()
          .update(updates);
      }
      this.itemsRef = []
      this.resetState()
    }
  }

  backdrop() {
    const {visible} = this.state;

    return (
      <TouchableWithoutFeedback onPress={() => this.close()}>
        <View
          pointerEvents={visible ? 'auto' : 'none'}
          style={styles.fullPage}
        />
      </TouchableWithoutFeedback>
    );
  }

  confirm = async () => {
    this.close(true)
    const {flagsSelected: allFlags, members} = this.state;
    const {coachSessionID, userID} = this.props;

    let updates = {};
    for (var m in members) {
      let member = members[m]
      if (member !== undefined && member.id !== undefined) {
        let recording = member?.recording
        let flagsSelected = allFlags && Object.values(allFlags).filter((flag) => flag.source === members[m].id)

        var infoFlags = flagsSelected && Object.values(flagsSelected).reduce(function(result, item) {
          const snipetTime = this.itemsRef[item.id].getState('snipetTime');
          result[item.id] = {
            id: item.id,
            time: item.time,
            thumbnail: item.thumbnail,
            startTime: Math.max(0, item.time - snipetTime * 1000),
            stopTime: Math.min(
              recording?.stopTimestamp - recording?.startTimestamp,
              item.time + snipetTime * 1000,
            ),
          };
          return result;
        }.bind(this), {});
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
      } 
    }

    this.resetState()
    
    if (Object.values(updates).length > 0) {
      await database()
        .ref()
        .update(updates);
    }
  };

  fullVideos() {
    const {flagsSelected, members, visible, flags, recordings} = this.state
    if (recordings.length < 1) return null
    const noFlags = (flags && Object.values(flags).length === 0)
    return (
      <View>
        {!noFlags && 
        <Text style={styles.subtitle}>
        Full Video{(recordings.length > 1) ? 's' : ''}
        </Text>}
        <View style={{height:(noFlags) ? 300 : 110}}>
          <ScrollView
          horizontal
          scrollEnabled={(recordings.length > 1)}
          style={{
            height:'100%',
            paddingLeft:'5%',
          }}
          contentContainerStyle={{ paddingRight:50 }}
          showsHorizontalScrollIndicator={false}> 
          {/* {members && <Text>asdfasdfasdfasdfad</Text>} */}
            {Object.values(members)
              .map((member) => {
                  const recording = member?.recording
                  let flagId = `${member.id}-fullVideo`
                  return recording &&
                  <CardFlag
                    flagsSelected={flagsSelected}
                    onRef={(ref) => (this.itemsRef[flagId] = ref)}
                    click={() => {
                      let {flagsSelected} = this.state;
                      if (flagsSelected[flagId]) delete flagsSelected[flagId];
                      else
                        flagsSelected = {
                          ...flagsSelected,
                          [flagId]: {
                            time: 0,
                            id: flagId,
                            thumbnail: recording.thumbnail,
                            source: member.id,
                          },
                        };
                      this.setState({flagsSelected});
                    }}
                    disableSelectTime={true}
                    size={noFlags ? 'lg' : 'sm'}
                    flag={{
                      time:
                        recording.stopTimestamp - recording.startTimestamp
                          ? recording.stopTimestamp - recording.startTimestamp
                          : '',
                      fullVideo: true,
                      thumbnail: recording.thumbnail,
                      id: flagId,
                      portrait: recording.portrait
                    }}
                    memberPicture = {member?.info?.picture}
                    stopTimestamp = {recording.stopTimestamp}
                  />
              })}
          </ScrollView>
        </View>
      </View>
    )
  }

  highlights() {
    const {flagsSelected, members, flags, recordings} = this.state
    if (flags && Object.values(flags).length < 1) return null
    return (
      <View>
      <Text style={styles.subtitle}>Highlights</Text>
        <View style={{minHeight: 110}}>
          <ScrollView
          horizontal
          style={{
            height:'100%',
            paddingLeft:'5%'
          }}
          showsHorizontalScrollIndicator={false}> 
            {Object.values(members)
              .map((member) => {
                const recording = member?.recording
                return recording?.flags && Object.values(recording.flags)
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
                      if (flagsSelected[flag.id]) delete flagsSelected[flag.id];
                      else
                        flagsSelected = {
                          ...flagsSelected,
                          [flag.id]: {
                            time: flag.time,
                            id: flag.id,
                            thumbnail: flag.thumbnail,
                            source: member.id
                          },
                        };
                      this.setState({flagsSelected});
                    }}
                    memberPicture = {member?.info?.picture}
                    stopTimestamp = {recording.stopTimestamp}
                    size={'sm'}
                  />
                ))
              })}
          </ScrollView>
        </View>
      </View>
    )
  }

  render() {
    const {visible, flagsSelected, loader} = this.state;
    const {currentScreenSize} = this.props;
    const width = currentScreenSize.currentWidth;

    const translateY = this.scaleCard.interpolate({
      inputRange: [0, 1],
      outputRange: [1000, 0],
      extrapolate: 'clamp',
    });
    return (
      <Animated.View 
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
          ...styles.container,
          width,
          transform: [{translateY: translateY}],
      }}>
      <ButtonColor
        view={() => {
          return (
            <AllIcons
              name="times"
              size={13}
              color={colors.title}
              type="font"
            />
          );
        }}
        click={() => this.close()}
        color={colors.white}
        style={styles.buttonClose}
        onPressColor={colors.off}
      />
        <Text style={styles.text}>Export</Text>
        <View style={{height:300}}>
        {this.fullVideos()}
        {this.highlights()}
        </View>
        <View style={[styleApp.marginView]}>
          <Button
            styleButton={{height:45, marginTop:15}}
            textButton={{fontSize:15}}
            styleText={{fontSize:15}}
            text={'Confirm upload'}
            disabled={flagsSelected && Object.values(flagsSelected).length === 0}
            backgroundColor={'green'}
            loader={loader}
            loaderSize={30}
            onPressColor={colors.greenLight}
            click={() => this.confirm()}
          />
        </View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom:450 + sizes.offsetFooterStreaming,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    top:60,
    ...styleApp.shadow,
    zIndex: 2,
  },
  buttonClose: {
    position: 'absolute',
    top: 15,
    right: '5%',
    height: 35,
    width: 35,
    zIndex:2,
    borderRadius: 20,
  },
  text: {
    ...styleApp.text,
    marginTop: 20,
    marginBottom:5,
    fontSize: 21,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft:'5%',
    fontWeight: 'bold',
    color:colors.black
  },
  subtitle: {
    ...styleApp.text,
    fontSize:12,
    marginTop: 10,
    marginBottom:5,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft:'5%',
    color:colors.terciary
  },
  fullPage: {
    position: 'absolute',
    width: sizes.width,
    height: 200000,
    top:-sizes.height,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(ExportQueue);
