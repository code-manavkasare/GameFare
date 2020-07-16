import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Easing, ScrollView} from 'react-native';
import {connect} from 'react-redux';
import isEqual from 'lodash.isequal';
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
      member: undefined,
      visible: false,
      flagsSelected: {},
      loader: false,
    };
    this.itemsRef = [];
    this.scaleCard = new Animated.Value(0);
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const {isConnected} = this.state.member
    if (prevState.member.isConnected && !isConnected) {
      this.close()
    }
  }

  static getDerivedStateFromProps(props, state) {
    newState = {}
    if (!isEqual(props.finalizeRecordingMember, state.member))
      newState = {...newState, member: props.finalizeRecordingMember};
    return newState;
  }

  async open(member, thumbnails) {
    await this.setState({visible: true, 
      flagsSelected: {
        ['fullVideo']: {
          id: 'fullVideo',
          time: 0
        }}
      });
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(1, 300)),
    ]).start();
  }

  close() {
    this.setState({visible: false});
    this.props.onClose()
    Animated.parallel([
      Animated.timing(this.scaleCard, native(0, 300)),
    ]).start();

    const {member} = this.state;
    const {coachSessionID} = this.props;
    let updates = {};
    updates[
      `coachSessions/${coachSessionID}/members/${member.id}/recording/enabled`
    ] = true;
    database()
      .ref()
      .update(updates);
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
    this.close()
    const {flagsSelected, member} = this.state;
    const {coachSessionID, userID} = this.props;
    const {recording} = member;

    var infoFlags = flagsSelected && Object.values(flagsSelected).reduce(function(result, item) {
      const snipetTime = this.itemsRef[item.id].getState('snipetTime');
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
    }.bind(this), {});
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
  };

  fullVideos() {
    const {member, flagsSelected} = this.state
    const {recording} = member
    const flags = recording?.flags
    return (
      <View>
        {flags && <Text style={styles.subtitle}>Full Video</Text>}
        <View style={{height:90}}>
          {recording && <CardFlag
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
          />}
        </View>
      </View>
    )
  }

  highlights() {
    const {member, flagsSelected} = this.state
    const {recording} = member
    const flags = recording?.flags
    if (!flags) return null

    return (
      <View>
      <Text style={styles.subtitle}>Highlights</Text>
        <View style={{minHeight: 90, maxHeight:150}}>
          <ScrollView style={{height:'100%'}} showsVerticalScrollIndicator={false} > 
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
                    // delete flagsSelected['fullVideo'];
                    if (flagsSelected[flag.id]) delete flagsSelected[flag.id];
                    else
                      flagsSelected = {
                        ...flagsSelected,
                        [flag.id]: {
                          time: flag.time,
                          id: flag.id,
                          thumbnail: flag.thumbnail,
                        },
                      };
                    this.setState({flagsSelected});
                  }}
                />
              ))}
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
        {this.fullVideos()}
        {this.highlights()}

        <View style={[styleApp.marginView]}>
          <Button
            styleButton={{height:45, marginTop:15}}
            textButton={{fontSize:15}}
            styleText={{fontSize:15}}
            text={
              'Confirm upload'
            }
            disabled={Object.values(flagsSelected).length === 0}
            backgroundColor={'green'}
            loader={loader}
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
    top:40,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
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
