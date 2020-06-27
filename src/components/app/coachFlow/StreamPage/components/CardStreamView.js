import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import database from '@react-native-firebase/database';
import moment from 'moment'
import FontIcon from 'react-native-vector-icons/FontAwesome5';

import {layoutAction} from '../../../../../actions/layoutActions';

import {native, timing} from '../../../../animations/animations';
import {navigate} from '../../../../../../NavigationService';
import AllIcons from '../../../../layout/icons/AllIcons';
import Button from '../../../../layout/buttons/Button';
import ButtonColor from '../../../../layout/Views/Button';
import Loader from '../../../../layout/loaders/Loader';
import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import {date, time} from '../../../../layout/date/date';
import ImageUser from '../../../../layout/image/ImageUser';
import {coachAction} from '../../.././../../actions/coachActions';
import AsyncImage from '../../../../layout/image/AsyncImage'
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);

class CardStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: false,
      loading: true,
    };
    this.expandAnimation = new Animated.Value(0);
    this.expand = this.expand.bind(this)
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

        this.setState({
          session: session,
          loading: false,
          error: false,
        });
      }.bind(this),
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  deleteSession = () => {
    const {userID, coachSessionID} = this.props;
    this.expand(0)
    navigate('Alert', {
      title: 'Do you want to delete this session?',
      textButton: 'Delete',
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
  buttonEndCall() {
    const endCoachSession = () => {};
    return (
      <ButtonColor
        color={colors.red}
        onPressColor={colors.redLight}
        click={() => endCoachSession()}
        style={styles.button}
        view={() => {
          return (
            <Image
              source={require('../../../../../img/icons/endCall.png')}
              style={{width: 17, height: 17}}
            />
          );
        }}
      />
    );
  }
  buttonDelete() {
    return (
      <ButtonColor
        onPressColor={colors.blueLight}
        click={() => this.deleteSession()}
        style={styles.button}
        view={() => {
          return (
            <AllIcons
              name="trash-alt"
              size={15}
              color={colors.greyDark}
              type="font"
            />
          );
        }}
      />
    );
  }
  viewLive() {
    const styleViewLive = {
      position: 'absolute',
      top: 0,
      right: '0%',
      height: 20,
      width: 40,
      ...styleApp.center,
      backgroundColor: colors.red,
      borderBottomLeftRadius: 5,
      // marginTop: 5,
      borderBottomRightRadius: 5,
    };
    const styleText = {...styleApp.textBold, color: colors.white, fontSize: 10};
    return (
      <View style={styleViewLive}>
        <Text style={styleText}>Live</Text>
      </View>
    );
  }
  viewMembers() {
    const styleRow = {
      flexDirection: 'row',
      flexWrap: 'wrap',
      flex: 1,
    };
    const sizeImg = 40;
    const styleText = {...styleApp.text, color: colors.greyDark, fontSize: 15};
    const {members, userID} = this.props;

    let membersDisplay = [];
    if (members)
      membersDisplay = Object.values(members).filter(
        (member) => member.id !== userID,
      );
    return (
      <View style={styleRow}>
        {membersDisplay.length === 0 ? (
          <Text style={styleText}>No one else is part of this room.</Text>
        ) : (
          membersDisplay.map((member) => {
            const styleImg = {
              height: sizeImg,
              width: sizeImg,
              borderRadius: sizeImg / 2,
            };
            const styleImgContainer = {
              height: sizeImg,
              width: sizeImg + 2,
              overflow: 'hidden',
              ...styleApp.center2,
            };
            const styleVoile = {
              ...styleImg,
              position: 'absolute',
              backgroundColor: colors.off + '90',
              zIndex: 10,
            };
            return (
              <View key={member.id} style={styleImgContainer}>
                {!member.isConnected && <View style={styleVoile} />}
                <ImageUser
                  key={member.id}
                  user={member}
                  onClick={() => true}
                  styleImgProps={styleImg}
                />
              </View>
            );
          })
        )}
      </View>
    );
  }
  async expand(to) {
    var toVal = to !== undefined ? to : 
      this.expandAnimation._value === 0 ? 1 : 0
    const {collapseAll} = this.props
    if (toVal === 1) collapseAll()
    await Animated.parallel([
      Animated.timing(this.expandAnimation, timing(toVal, 120))
    ]).start(() => {this.expandAnimation.setValue(toVal)})
  }

  async openStream() {
    const {session} = this.state;
    this.expand(0)
    const {
      coachSessionID,
      layoutAction,
      coachAction,
      currentSessionID,
    } = this.props;
    if (currentSessionID !== coachSessionID) {
      await coachAction('setCurrentSession', false);
      await coachAction('setCurrentSession', session);
    }

    await layoutAction('setLayout', {isFooterVisible: false});
    navigate('Session', {
      screen: 'Session',
      params: {coachSessionID: coachSessionID, date: Date.now()},
    });
  }

  loading() {
    return <View>{/* <Loader size={55} color={colors.greyDark} /> */}</View>;
  }

  getSortedMembers() {
    const {userID} = this.props
    let {members} = this.state.session
    members = Object.values(members)
    if (members.length !== 1) members = members
      .sort((a, b) => {
        if (!a) return -1
        else if (!b) return 1
        else if (a.id === userID) return 1
        else if (b.id === userID) return -1
        else if (a.invitationTimeStamp === undefined) return -1
        else if (a.isConnected && !b.isConnected) return -1
        else if (!a.isConnected && b.isConnected) return 1 
        else if (a.invitationTimeStamp > b.invitationTimeStamp) return -1
        else if (a.invitationTimeStamp < b.invitationTimeStamp) return 1
        else if (a.disconnectionTimeStamp > b.disconnectionTimeStamp) return 1
        else if (a.disconnectionTimeStamp < b.disconnectionTimeStamp) return -1 })
      .filter(a => a.id !== userID)
    return members
  }

  memberPictures() {
    const {scale} = this.props
    const members = this.getSortedMembers()
    const length = members.length
    const styleByIndex = (i) => { 
      if (length > 1) return {
        position: 'absolute',
        top:
          //left picture 
          ((i==0) ? -25 * scale : 
          //top picture
          (i==1) ? -39 * scale : 
          //additional
          -6 * scale ) + 
          ((length == 2) ? 8 * scale : 0 * scale),
        left:
          //left picture
          (i==0) ? -40 * scale : 
          //top picture
          (i==1) ? -10 * scale : 
          //additional
          -10 * scale
      }}

    return (
      <View style={{...styleApp.center, ...styleApp.fullSize}}>
        { length > 2 &&
          <View>
            {this.userCircle(length-2, styleByIndex(-1), scale)}
          </View>
        }
        { members.splice(0, 2).reverse().map((member, i) => (
          <View>
            {this.userCircle(member, styleByIndex(i), scale)}
          </View>
        ))}
      </View>
    );
  }

  userCircle(member, style, scale) {
    const length = this.getSortedMembers().length
    
    let borderRadius = 100

    let sizeImg = (length > 1) ? 45 * scale: 63 * scale;
    const styleImg = {
      height: sizeImg,
      width: sizeImg,
      borderRadius: borderRadius + 3,
      borderWidth: 4 * scale,
      borderColor:colors.white,
      overflow: 'hidden'
    };

    return (
      <View>
        <View style={{...style}}>
          <View style={{...styleImg}}>
            { (member.info && member.info.picture) ? 
            <AsyncImage 
              style={{...styleApp.fullSize, borderRadius}}
              mainImage={member.info.picture}
              imgInitial={member.info.picture}
            />
            :
            <View style={{
              ...styleApp.fullSize, 
              ...styleApp.center, 
              backgroundColor:colors.greyDark, borderRadius
            }}>
              <Text style={styles.placeholderText}>
                { member.info ? 
                member.info.firstname[0] + member.info.lastname[0]
                : '+' + member }
              </Text>
            </View>
            }
          </View>
          { member.info ?
            <View style={{
              position:'absolute',
              bottom: (length > 1) ? 2 : 5 , right: (length > 1) ? 2 : 5,
              backgroundColor: 
                (member.isConnected) ?
                colors.greenLight : colors.grey,
              height:15,
              width:15,
              borderRadius:100,
              borderWidth:3,
              borderColor:colors.white
            }} /> : null
          }
        </View>
      </View>
    )
  }

  sessionInfo() {
    const {coachSessionID} = this.props
    return (
      <View style={{...styleApp.fullSize, ...styleApp.center7}}>
        <Text style={{...styleApp.text, color:colors.black, fontWeight: '600'}}>{this.sessionTitle()}</Text>
        <Text style={{...styleApp.text, fontSize:14, color:colors.greyDark, marginTop:3}}>{this.sessionDate()}</Text>
        {/* <Text style={{...styleApp.text, fontSize:14, color:colors.greyDark, marginTop:3}}>{coachSessionID}</Text> */}
      </View>
    );
  }

  sessionTitle() {
    const {session} = this.state;
    const {userID} = this.props;
    if (session.title) return session.title;
    const members = this.getSortedMembers();
    if (!members) return;
    if (members[0].id === userID) return "Only you"
    let names = members[0].info ? members[0].info.firstname + ' ' + members[0].info.lastname : ''
    if (members.length > 1) names += 
      members[1].info ? ', ' + members[1].info.firstname + ' ' + members[1].info.lastname : ''
    if (members.length > 2) names += ', and ' + (members.length - 2) + ' others'
    return names
  }

  sessionDate() {
    const members = Object.values(this.state.session.members);
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
    const spin = this.expandAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    return (
      <View style={{...styleApp.fullSize, ...styleApp.center}}>
        <AnimatedIcon
          name="chevron-down"
          color={colors.greyDark}
          style={{transform: [{rotate: spin}]}}
          size={12}
        />
      </View>
    );
  }

  cardBody() {
    return (
      <View style={{height:35}}>
        <Row style={styles.buttonArea}>
          <Col size={30} />
          <Col size={25}>
            <ButtonColor
              onPressColor={colors.redLight}
              color={colors.red}
              click={() => this.deleteSession()}
              style={{
                height:35, 
                width:'100%',
                borderRadius: 5
              }}
              view={() => {
                return (
                  <Text style={styles.buttonText}>
                    Delete
                  </Text>
                )
              }}
              />
          </Col>
          <Col size={5} />
          <Col size={25}>
            <ButtonColor
              onPressColor={colors.greenLight}
              color={colors.green}
              click={() => this.openStream()}
              style={{
                height:35, 
                width:'100%',
                borderRadius: 5
              }}
              view={() => {
                return (
                  <Text style={styles.buttonText}>
                    Join
                  </Text>
                )
              }}
              />
          </Col>
          <Col size={15} />
        </Row>
      </View>
    )
  }

  cardStream() {
    const {coachSessionID, currentSessionID, scale} = this.props;
    const {loading} = this.state;

    const transform = this.expandAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [(80*scale), (130*scale)],
    });

    return (
      <Animated.View style={{...styles.card, height: transform}}>
        <ButtonColor
          color={currentSessionID === coachSessionID ? colors.red : colors.white}
          onPressColor={colors.off}
          click={() => this.expand()}
          style={{...styles.card, height:80 * scale}}
          view={() => {
            return (
              loading ? 
              this.loading() :
              <Row style={{}}>
                <Col size={30}>
                  {this.memberPictures()}
                </Col>
                <Col size={55} style={styleApp.center}>
                  {this.sessionInfo()}
                </Col>
                <Col size={15} >
                  {this.expansionButton()}
                </Col>
              </Row>
            );
          }}
        />
        {this.cardBody()}
      </Animated.View>
    );
  }
  render() {
    return (
      <View>
        {this.cardStream()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    overflow: 'hidden'
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
  button: {
    ...styleApp.center,
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  buttonText: {
    ...styleApp.textBold,
    fontSize: 15,
    color: colors.white,
  },
  buttonArea: {
    paddingTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height:35
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
    currentSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {coachAction, layoutAction},
)(CardStream);
