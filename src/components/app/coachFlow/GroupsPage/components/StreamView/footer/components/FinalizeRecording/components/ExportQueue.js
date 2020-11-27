import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import database from '@react-native-firebase/database';

import {store} from '../../../../../../../../../../store/reduxStore';
import {native} from '../../../../../../../../../animations/animations';
import ButtonColor from '../../../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../../../layout/icons/AllIcons';
import sizes from '../../../../../../../../../style/sizes';
import Button from '../../../../../../../../../layout/buttons/Button';

import colors from '../../../../../../../../../style/colors';
import styleApp from '../../../../../../../../../style/style';
import CardFlag from './CardFlag';

/**
 * ExportQueue
 * This component is referenced by the RecordingMenu
 *
 * When a user requests a member of the current call to stop recording,
 * the id of the respective member is added to a local array called exportingMembers.
 *
 * getDerivedStateFromProps processes this change by referencing the memberID to the
 * live state of the members of the call. This allows changes in
 * {coachSessionID}/members/recording to occur and update this component based on the
 * information of the recording object (i.e. uploading thumbnails of the video)
 */
export default class ExportQueue extends Component {
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
    };
    this.cardFlagRefs = [];
    this.scaleCard = new Animated.Value(0);
  }

  static getDerivedStateFromProps(props, state) {
    const {members} = props;
    const {exportingMembers} = state;
    const fullExportingMembers = members.filter((m) =>
      exportingMembers.includes(m?.id),
    );
    const newState = fullExportingMembers.reduce(
      (newState, member) => {
        newState.flags = {...newState.flags, ...member?.recording?.flags};
        newState.recordings.push(member?.recording);
        if (!member?.recording?.fullVideo?.id) {
          newState.loader = true;
        }
        return newState;
      },
      {
        flags: {},
        recordings: [],
        loader: false,
      },
    );
    return {members: fullExportingMembers, ...newState};
  }
  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let {members} = this.state;
    for (var member in members) {
      let isConnected = members[member]?.isConnected;
      if (prevState.members[member]?.isConnected && !isConnected) {
        delete members[member];
      }
    }
    if (members?.length === 0 && prevState.members?.length > 0) {
      this.close();
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
    });
  }

  async open(member) {
    let {flagsSelected, exportingMembers} = this.state;
    flagsSelected[`${member.id}-fullVideo`] = {
      time: 0,
      id: `${member.id}-fullVideo`,
      source: member.id,
    };
    // Add member to list of members of which user stopped recording
    if (!exportingMembers.includes(member.id)) {
      exportingMembers.push(member.id);
    }
    this.setState({
      visible: true,
      flagsSelected,
      exportingMembers,
    });
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(1, 300)),
    ]).start();
  }

  close(ignore) {
    this.props.onClose();
    Animated.parallel([
      Animated.timing(this.scaleCard, native(0, 300)),
    ]).start();

    if (!ignore) {
      const {members} = this.state;
      const {coachSessionID} = this.props;
      const updates =
        members &&
        Object.values(members).reduce((pass, member) => {
          let updates = {...pass};
          if (member && member.id) {
            updates[
              `coachSessions/${coachSessionID}/members/${
                member.id
              }/recording/enabled`
            ] = true;
            updates[
              `coachSessions/${coachSessionID}/members/${
                member.id
              }/recording/uploadRequest`
            ] = {};
            updates[
              `coachSessions/${coachSessionID}/members/${
                member.id
              }/recording/flags`
            ] = null;
            updates[
              `coachSessions/${coachSessionID}/members/${
                member.id
              }/recording/flagsSelected`
            ] = null;
            updates[
              `coachSessions/${coachSessionID}/members/${
                member.id
              }/recording/fullVideo`
            ] = null;
            updates[
              `coachSessions/${coachSessionID}/members/${
                member.id
              }/recording/thumbnail`
            ] = null;
          }
          return updates;
        }, {});
      if (updates && Object.values(updates).length > 0) {
        database()
          .ref()
          .update(updates);
      }
      this.cardFlagRefs = [];
      this.resetState();
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
    this.close(true);
    const {flagsSelected, members} = this.state;
    const {coachSessionID} = this.props;
    const {userID} = store.getState().user;
    const uploadRequests = Object.values(members).reduce(
      (uploadRequests, member) => {
        if (member && member.id) {
          const {recording} = member;
          const memberFlags = Object.values(flagsSelected).filter(
            (flag) => flag.source === member.id,
          );
          const firebaseFlags = memberFlags.reduce((firebaseFlags, flag) => {
            const snipetTime = this.cardFlagRefs[flag.id].getState(
              'snipetTime',
            );
            firebaseFlags[flag.id] = {
              id: flag.id,
              time: flag.time,
              thumbnail: flag.thumbnail,
              startTime: Math.max(0, flag.time - snipetTime * 1000),
              stopTime: Math.min(
                recording?.stopTimestamp - recording?.startTimestamp,
                flag.time + snipetTime * 1000,
              ),
            };
            return firebaseFlags;
          }, {});
          uploadRequests[
            `coachSessions/${coachSessionID}/members/${
              member.id
            }/recording/enabled`
          ] = true;
          uploadRequests[
            `coachSessions/${coachSessionID}/members/${
              member.id
            }/recording/uploadRequest`
          ] = {
            flagsSelected: firebaseFlags,
            date: Date.now(),
            userRequested: userID,
          };
          return uploadRequests;
        }
      },
      {},
    );
    this.resetState();
    if (Object.values(uploadRequests).length > 0) {
      await database()
        .ref()
        .update(uploadRequests);
    }
  };

  fullVideos() {
    const {flagsSelected, members, flags, recordings} = this.state;
    if (recordings.length < 1) {
      return null;
    }
    const noFlags = flags && Object.values(flags).length === 0;
    return (
      <View>
        {!noFlags ? (
          <Text style={styles.subtitle}>
            Full Video{recordings.length > 1 ? 's' : ''}
          </Text>
        ) : null}
        <View style={{height: noFlags ? 300 : 110}}>
          <ScrollView
            horizontal
            scrollEnabled={recordings.length > 1}
            style={{
              height: '100%',
              paddingLeft: '5%',
            }}
            contentContainerStyle={{paddingRight: 50}}
            showsHorizontalScrollIndicator={false}>
            {Object.values(members).map((member) => {
              const recording = member?.recording;
              let flagId = `${member.id}-fullVideo`;
              return recording ? (
                <CardFlag
                  flagsSelected={flagsSelected}
                  key={member.id}
                  onRef={(ref) => (this.cardFlagRefs[flagId] = ref)}
                  click={() => {
                    let {flagsSelected} = this.state;
                    if (flagsSelected[flagId]) {
                      delete flagsSelected[flagId];
                    } else {
                      flagsSelected = {
                        ...flagsSelected,
                        [flagId]: {
                          time: 0,
                          id: flagId,
                          thumbnail: recording.thumbnail,
                          source: member.id,
                        },
                      };
                    }
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
                    thumbnail: recording?.fullVideo?.thumbnail,
                    id: flagId,
                    portrait: recording.portrait,
                  }}
                  memberPicture={member?.info?.picture}
                  stopTimestamp={recording.stopTimestamp}
                />
              ) : null;
            })}
          </ScrollView>
        </View>
      </View>
    );
  }

  highlights() {
    const {flagsSelected, members, flags, recordings} = this.state;
    if (flags && Object.values(flags).length < 1) {
      return null;
    }
    return (
      <View>
        <Text style={styles.subtitle}>Highlights</Text>
        <View style={{minHeight: 110}}>
          <ScrollView
            horizontal
            style={{
              height: '100%',
              paddingLeft: '5%',
            }}
            showsHorizontalScrollIndicator={false}>
            {Object.values(members).map((member) => {
              const recording = member?.recording;
              return recording?.flags
                ? Object.values(recording.flags)
                    .sort((a, b) => a.time - b.time)
                    .filter((f) => f?.id !== undefined)
                    .map((flag) => (
                      <CardFlag
                        key={flag.id}
                        flag={flag}
                        totalTime={
                          (recording.stopTimestamp - recording.startTimestamp) /
                          1000
                        }
                        flagsSelected={flagsSelected}
                        onRef={(ref) => (this.cardFlagRefs[flag.id] = ref)}
                        click={() => {
                          let {flagsSelected} = this.state;
                          if (flagsSelected[flag.id]) {
                            delete flagsSelected[flag.id];
                          } else {
                            flagsSelected = {
                              ...flagsSelected,
                              [flag.id]: {
                                time: flag.time,
                                id: flag.id,
                                thumbnail: flag.thumbnail,
                                source: member.id,
                              },
                            };
                            this.setState({flagsSelected});
                          }
                        }}
                        memberPicture={member?.info?.picture}
                        stopTimestamp={recording.stopTimestamp}
                        size={'sm'}
                      />
                    ))
                : null;
            })}
          </ScrollView>
        </View>
      </View>
    );
  }

  render() {
    const {visible, flagsSelected, loader} = this.state;

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
          width: sizes.width * 0.93,
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
        <View style={{height: 300}}>
          {this.fullVideos()}
          {this.highlights()}
        </View>
        <View style={[styleApp.marginView]}>
          <Button
            styleButton={{height: 45, marginTop: 15}}
            textButton={{fontSize: 15}}
            styleText={{fontSize: 15}}
            text={'Confirm upload'}
            disabled={
              flagsSelected && Object.values(flagsSelected).length === 0
            }
            backgroundColor={'green'}
            loader={loader}
            loaderSize={30}
            onPressColor={colors.greenLight}
            click={() => this.confirm()}
          />
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom: 35,
    backgroundColor: colors.white,
    borderRadius: 25,
    top: 50,
    ...styleApp.shadow,
    zIndex: 2,
  },
  buttonClose: {
    position: 'absolute',
    top: 15,
    right: '5%',
    height: 35,
    width: 35,
    zIndex: 2,
    borderRadius: 20,
  },
  text: {
    ...styleApp.text,
    marginTop: 20,
    marginBottom: 5,
    fontSize: 21,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft: '5%',
    fontWeight: 'bold',
    color: colors.black,
  },
  subtitle: {
    ...styleApp.text,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft: '5%',
    color: colors.terciary,
  },
  fullPage: {
    position: 'absolute',
    width: sizes.width,
    height: 200000,
    top: -sizes.height,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
});
