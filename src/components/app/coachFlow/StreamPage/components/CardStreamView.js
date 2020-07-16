import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';

import {layoutAction} from '../../../../../actions/layoutActions';
import {coachAction} from '../../.././../../actions/coachActions';

import {native, timing} from '../../../../animations/animations';
import {navigate} from '../../../../../../NavigationService';
import AllIcons from '../../../../layout/icons/AllIcons';

import {sessionOpening, getMember} from '../../../../functions/coach';
import CoachPopups from './StreamView/components/CoachPopups';

import ButtonColor from '../../../../layout/Views/Button';
import Loader from '../../../../layout/loaders/Loader';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';

import AsyncImage from '../../../../layout/image/AsyncImage';

class CardStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: false,
      loading: true,
    };
    this.expandAnimation = new Animated.Value(0);
    this.expand = this.expand.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
    this.loadCoachSession();
  }

  async loadCoachSession() {
    const {coachSessionID, coachAction} = this.props;
    database()
      .ref(`coachSessions/${coachSessionID}`)
      .on(
        'value',
        async function(snap) {
          let session = snap.val();
          const {currentSessionID} = this.props;
          if (!session) return null;

          if (currentSessionID === coachSessionID)
            await coachAction('setCurrentSession', session);

          coachAction('setAllSessions', {
            [coachSessionID]: session,
          });
          this.setState({
            session: session,
            loading: false,
            error: false,
          });
        }.bind(this),
      );
  }
  deleteSession = () => {
    const {userID, coachSessionID} = this.props;
    navigate('Alert', {
      title: 'Do you want to leave this session?',
      textButton: 'Leave',
      colorButton: 'red',
      onPressColor: colors.redLight,
      onGoBack: async () => {
        const {objectID} = this.state.session;
        let updates = {};
        updates[`users/${userID}/coachSessions/${coachSessionID}`] = null;
        updates[`coachSessions/${coachSessionID}/members/${userID}`] = null;
        updates[`coachSessions/${coachSessionID}/allMembers/${userID}`] = null;
        await database()
          .ref()
          .update(updates);
        if (objectID === coachSessionID)
          await coachAction('setSessionInfo', {
            objectID: false,
          });
        return true;
      },
    });
  };
  viewLive() {
    const styleViewLive = {
      marginRight: 20,
      height: 20,
      width: 40,
      ...styleApp.center,
      backgroundColor: colors.red,
      borderRadius: 5,
    };
    const styleText = {...styleApp.textBold, color: colors.white, fontSize: 10};
    return (
      <View style={styleViewLive}>
        <Text style={styleText}>Live</Text>
      </View>
    );
  }
  async expand(to) {
    var toVal =
      to !== undefined ? to : this.expandAnimation._value === 0 ? 1 : 0;
    if (toVal === this.expandAnimation._value) return;
    await Animated.parallel([
      Animated.timing(this.expandAnimation, native(toVal, 350)),
    ]).start(() => {
      this.expandAnimation.setValue(toVal);
    });
  }

  async openStream(forceOpen) {
    const {session} = this.state;
    sessionOpening(session);
  }

  loading() {
    return <View>{/* <Loader size={55} color={colors.greyDark} /> */}</View>;
  }

  getSortedMembers() {
    const {userID} = this.props;
    let {members} = this.state.session;
    members = members ? Object.values(members) : [];
    if (members.length !== 1)
      members = members
        .sort((a, b) => {
          if (!a) return -1;
          else if (!b) return 1;
          else if (a.id === userID) return 1;
          else if (b.id === userID) return -1;
          else if (a.invitationTimeStamp === undefined) return -1;
          else if (a.isConnected && !b.isConnected) return -1;
          else if (!a.isConnected && b.isConnected) return 1;
          else if (a.invitationTimeStamp > b.invitationTimeStamp) return -1;
          else if (a.invitationTimeStamp < b.invitationTimeStamp) return 1;
          else if (a.disconnectionTimeStamp > b.disconnectionTimeStamp)
            return 1;
          else if (a.disconnectionTimeStamp < b.disconnectionTimeStamp)
            return -1;
        })
        .filter((a) => a.id !== userID);
    return members;
  }

  memberPictures() {
    const {scale} = this.props;
    const members = this.getSortedMembers();
    const length = members.length;
    const styleByIndex = (i) => {
      if (length > 1)
        return {
          position: 'absolute',
          top:
            //left picture
            (i == 0
              ? -25 * scale
              : //top picture
              i == 1
              ? -39 * scale
              : //additional
                -6 * scale) + (length == 2 ? 8 * scale : 0 * scale),
          left:
            //left picture
            i == 0
              ? -40 * scale
              : //top picture
              i == 1
              ? -10 * scale
              : //additional
                -10 * scale,
        };
    };

    return (
      <View style={{...styleApp.center, ...styleApp.fullSize}}>
        {length > 2 && (
          <View>{this.userCircle(length - 2, styleByIndex(-1), scale)}</View>
        )}
        {members
          .splice(0, 2)
          .reverse()
          .map((member, i) => this.userCircle(member, styleByIndex(i), scale))}
      </View>
    );
  }

  userCircle(member, style, scale) {
    const length = this.getSortedMembers().length;

    let borderRadius = 100;

    let sizeImg = length > 1 ? 45 * scale : 63 * scale;
    const styleImg = {
      height: sizeImg,
      width: sizeImg,
      borderRadius: borderRadius + 3,
      borderWidth: 4 * scale,
      borderColor: colors.white,
      overflow: 'hidden',
    };

    return (
      <View key={member.id ? member.id : -1}>
        <View style={{...style}}>
          <View style={{...styleImg}}>
            {member.info && member.info.picture ? (
              <AsyncImage
                style={{...styleApp.fullSize, borderRadius}}
                mainImage={member.info.picture}
                imgInitial={member.info.picture}
              />
            ) : (
              <View
                style={{
                  ...styleApp.fullSize,
                  ...styleApp.center,
                  backgroundColor: colors.greyDark,
                  borderRadius,
                }}>
                <Text style={styles.placeholderText}>
                  {member.info
                    ? member.info.firstname[0] + member.info.lastname[0]
                    : '+' + member}
                </Text>
              </View>
            )}
          </View>
          {member.info ? (
            <View
              style={{
                position: 'absolute',
                bottom: length > 1 ? 2 : 5,
                right: length > 1 ? 2 : 5,
                backgroundColor: member.isConnected
                  ? colors.greenLight
                  : colors.grey,
                height: 15,
                width: 15,
                borderRadius: 100,
                borderWidth: 3,
                borderColor: colors.white,
              }}
            />
          ) : null}
        </View>
      </View>
    );
  }

  sessionInfo() {
    return (
      <View style={{...styleApp.fullSize, ...styleApp.center7}}>
        <Text style={styles.title}>{this.sessionTitle()}</Text>
        <Text style={styles.dateText}>{this.sessionDate()}</Text>
      </View>
    );
  }

  sessionTitle() {
    const {session} = this.state;
    const {userID} = this.props;
    if (session.title) return session.title;
    const members = this.getSortedMembers();
    if (!members || !members[0]) return;
    if (members[0].id === userID) return 'Only you';
    let names = members[0].info
      ? members[0].info.firstname + ' ' + members[0].info.lastname
      : '';
    if (members.length > 1)
      names += members[1].info
        ? ', ' + members[1].info.firstname + ' ' + members[1].info.lastname
        : '';
    if (members.length > 2)
      names += ', and ' + (members.length - 2) + ' others';
    return names;
  }

  sessionDate() {
    let {members} = this.state.session;
    if (!members) return this.formatDate(Date.now());
    members = members ? Object.values(members) : [];
    const activeMembers = members.filter((m) => m.isConnected);
    if (activeMembers.length > 0) return 'Active now';

    const lastActive = members.sort((a, b) => {
      if (!a.disconnectionTimeStamp) return 1;
      if (!b.disconnectionTimeStamp) return -1;
      if (a.disconnectionTimeStamp < b.disconnectionTimeStamp) return 1;
      if (a.disconnectionTimeStamp > b.disconnectionTimeStamp) return -1;
      else return 0;
    })[0].disconnectionTimeStamp;

    return this.formatDate(lastActive);
  }

  formatDate(date) {
    let justNow = moment(Date.now()).subtract(1, 'minute');
    let earlier = moment(Date.now()).subtract(7, 'days');
    let lastYear = moment(Date.now()).subtract(1, 'year');
    if (date > justNow) return 'Just now';
    else if (date > earlier) return moment(date).fromNow();
    else if (date > lastYear) return moment(date).format('ddd, MMM DD');
    else return moment(date).format('MMMM YYYY');
  }

  expansionButton() {
    const {coachSessionID, currentSessionID} = this.props;
    const activeSession = coachSessionID === currentSessionID;

    return (
      <View
        style={{
          ...styleApp.fullSize,
          ...styleApp.center,
        }}>
        {activeSession ? this.viewLive() : null}
      </View>
    );
  }
  async hangup() {
    const {coachAction} = this.props;
    await coachAction('endCurrentSession');
  }
  cardBody() {
    const {
      coachSessionID,
      currentSessionID,
      scale,
    } = this.props;
    const activeSession = coachSessionID === currentSessionID;
    const {width} = Dimensions.get('screen');
    const top = (scale * 90 - 45) / 2;

    return (
      <View>
        <Row style={{...styles.buttonArea, width: width / 2, top}}>
          <Col size={50}>
            <Row style={{justifyContent: 'space-around'}}>
              {/* <ButtonColor
                onPressColor={colors.off}
                color={colors.white}
                click={() => {}}
                style={styles.button}
                view={() => {
                  return (
                    <AllIcons
                      type="mat"
                      name="more-horiz"
                      size={23}
                      color={colors.title}
                    />
                  );
                }}
              /> */}
              <View style={styles.button} />
              <ButtonColor
                onPressColor={activeSession ? colors.redLight : colors.off}
                color={activeSession ? colors.red : colors.white}
                click={() => {
                  activeSession ? this.hangup() : this.deleteSession();
                }}
                style={styles.button}
                view={() => {
                  return (
                    <AllIcons
                      type={activeSession ? 'mat' : 'moon'}
                      name={activeSession ? 'call-end' : 'bin'}
                      size={20}
                      color={activeSession ? colors.white : colors.title}
                    />
                  );
                }}
              />
              <ButtonColor
                onPressColor={colors.greenLight}
                color={colors.green}
                click={() => this.openStream()}
                style={[styles.button, {shadowOpacity: 0}]}
                view={() => {
                  const {loader} = this.state;
                  return loader ? (
                    <Loader size={26} color={colors.white} />
                  ) : (
                    <AllIcons
                      type="mat"
                      name={'call'}
                      size={22}
                      color={colors.white}
                    />
                  );
                }}
              />
            </Row>
          </Col>
        </Row>
      </View>
    );
  }

  backdrop() {
    const {scale} = this.props;
    let height = 90 * scale;
    const {width} = Dimensions.get('screen');
    const currentWidth = width / 2 + 90;

    return (
      <TouchableOpacity
        onPress={() => this.expand(0)}
        activeOpacity={1}
        style={{
          height,
          width: currentWidth,
          position: 'absolute',
          zIndex: -1,
          left: -90,
        }}>
        <Row>
          <Col size={40}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styleApp.fullView}
              colors={[colors.white + '00', colors.white]}
            />
          </Col>
          <Col size={60} style={{backgroundColor: colors.white}} />
        </Row>
      </TouchableOpacity>
    );
  }

  cardStream() {
    const {
      scale,
      coachSessionID,
      currentSessionID,
      userID,
    } = this.props;
    const {loading, session} = this.state;
    const activeSession = coachSessionID === currentSessionID;
    const {width} = Dimensions.get('screen');

    const translateX = this.expandAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [width + 90, width / 2],
    });

    let height = 90 * scale;

    let member = getMember(session, userID);
    if (!member) member = {};

    return (
      <Animated.View style={{...styles.card, height}}>
        <ButtonColor
          color={colors.white}
          onPressColor={colors.off}
          click={() => this.expand()}
          style={{...styles.card, height}}
          view={() => {
            return loading ? (
              this.loading()
            ) : (
              <Row style={{}}>
                <Col size={30}>{this.memberPictures()}</Col>
                <Col size={55} style={styleApp.center}>
                  {this.sessionInfo()}
                </Col>
                <Col size={15}>
                  <View
                    style={{
                      ...styleApp.fullSize,
                      ...styleApp.center,
                    }}>
                    {activeSession ? this.viewLive() : null}
                  </View>
                </Col>
              </Row>
            );
          }}
        />
        <Animated.View
          style={{
            position: 'absolute',
            transform: [{translateX}],
          }}>
          {this.cardBody()}
          {this.backdrop()}
        </Animated.View>

        <CoachPopups
          isConnected={member.isConnected && activeSession}
          session={session}
          members={session.members}
          card={true}
          coachSessionID={coachSessionID}
          member={getMember(session, userID)}
          open={this.openStream.bind(this)}
          close={this.hangup.bind(this)}
          onRef={(ref) => (this.coachPopupsRef = ref)}
        />
      </Animated.View>
    );
  }
  render() {
    return this.cardStream();
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  placeholderText: {
    ...styleApp.textBold,
    fontSize: 17,
    color: colors.greyLight,
    letterSpacing: 1,
    top: 1,
    left: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 7,
  },
  divider: {
    height: 1,
    backgroundColor: colors.off,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 20,
  },
  rowTools: {
    paddingRight: 20,
    paddingLeft: 20,
  },
  title: {
    ...styleApp.text,
    color: colors.black,
    fontWeight: '600',
  },
  dateText: {
    ...styleApp.text,
    fontSize: 14,
    color: colors.greyDark,
    marginTop: 3,
  },
  button: {
    height: 45,
    width: 45,
    borderRadius: 25,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 9,
  },
  buttonText: {
    ...styleApp.textBold,
    fontSize: 15,
    color: colors.white,
  },
  buttonArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentSessionID: state.coach.currentSessionID,
    userConnected: state.user.userConnected,
  };
};

export default connect(
  mapStateToProps,
  {coachAction, layoutAction},
)(CardStream);
