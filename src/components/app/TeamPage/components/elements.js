import React, {Component} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

import {getSortedMembers} from '../../../functions/session';
import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import ButtonColor from '../../../layout/Views/Button';
import CardConversation from '../../elementsMessage/CardConversation';
import {FlatListComponent} from '../../../layout/Views/FlatList';

import {store} from '../../../../../reduxStore';
import {unsetCurrentSession} from '../../../../actions/coachActions';
import {sessionOpening} from '../../../functions/coach';
import CardArchive from '../../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';

const imageCardTeam = (session, size, hideDots) => {
  let scale = 1;
  if (size) scale = 0.7;
  const members = getSortedMembers(session.members);
  const length = members.length;
  const styleByIndex = (i) => {
    if (length > 1)
      return {
        position: 'absolute',
        top:
          (i == 0 ? -25 * scale : i == 1 ? -39 * scale : -6 * scale) +
          (length == 2 ? 8 * scale : 0 * scale),
        left: i == 0 ? -40 * scale : i == 1 ? -10 * scale : -10 * scale,
      };
  };
  let styleContainer = {};
  // if (size) styleContainer = {height: size, width: size};
  return (
    <View style={{flex: 1, ...styleApp.center, ...styleContainer}}>
      {length > 2 && (
        <View>
          {userCircle(
            length - 2,
            styleByIndex(-1),
            scale,
            Object.values(session.members).length - 1,
          )}
        </View>
      )}
      {members
        .splice(0, 2)
        .reverse()
        .map((member, i) =>
          userCircle(
            member,
            styleByIndex(i),
            scale,
            Object.values(session.members).length - 1,
            hideDots,
          ),
        )}
    </View>
  );
};

const userCircle = (member, style, scale, length, hideDots) => {
  let borderRadius = 100;
  let sizeImg = length > 1 ? 45 * scale : 63 * scale;
  const styleImg = {
    height: sizeImg,
    width: sizeImg,
    borderRadius: borderRadius + 3,
    borderWidth: 4 * scale,
    borderColor: colors.white,
    overflow: 'hidden',
    backgroundColor: colors.grey,
  };

  return (
    <View key={member.id ? member.id : -1}>
      <View style={{...style}}>
        <View style={{...styleImg}}>
          {member.info && member.info.picture ? (
            <AsyncImage
              style={{
                ...styleApp.fullSize,
                borderRadius,
                backgroundColor: colors.grey,
              }}
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
              <Text
                style={[
                  styleApp.textBold,
                  {fontSize: 11, color: colors.white},
                ]}>
                {member.info
                  ? member.info.firstname[0] + member.info.lastname[0]
                  : '+' + member}
              </Text>
            </View>
          )}
        </View>
        {!hideDots && member.info && (
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
        )}
      </View>
    </View>
  );
};

const titleSession = (session, size, allMembers) => {
  const userID = store.getState().user.userID;
  if (session.title) return session.title;
  const members = getSortedMembers(session.members);
  if (!members || !members[0]) return;
  if (members[0].id === userID) return 'You';
  let names = '';
  for (var i in members) {
    const {firstname, lastname} = members[i].info;
    let endCharacter = ', ';
    if (members.length === Number(i) + 1) endCharacter = '';
    else if (
      (!allMembers && Number(i) === 1) ||
      (!allMembers && members.length > 2 && Number(i) === 2)
    )
      endCharacter = ', and ' + (members.length - 2) + ' others';

    names += firstname + ' ' + lastname + endCharacter;
    if (!allMembers && Number(i) === 1) break;
  }

  // if (allMembers) names += ' and You';

  if (size) return names.slice(0, 20) + '...';
  return names;
};

const dateSession = ({session, messages}) => {
  let {members} = session;
  if (!members) return formatDate(Date.now());
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

  console.log('lastActive', lastActive);

  let dateLastMessage = 0;
  const lastMessage = lastMessageObject(messages);
  if (lastMessage) dateLastMessage = lastMessage.timeStamp;

  console.log('dateLastMessage', dateLastMessage);

  if ((!lastActive && dateLastMessage > 0) || dateLastMessage > lastActive)
    return formatDate(dateLastMessage);

  return formatDate(lastActive);
};
const sessionTitle = (session, styleText, allMembers) => {
  return (
    <Text style={[styleApp.title, {fontSize: 17}, styleText]}>
      {titleSession(session, false, allMembers)}
    </Text>
  );
};
const sessionDate = ({session, messages}) => {
  return (
    <Text
      style={[
        styleApp.text,
        {color: colors.title, marginTop: 5, fontSize: 11},
      ]}>
      {dateSession({session, messages})}
    </Text>
  );
};

const lastMessageObject = (messages) => {
  if (!messages) return false;
  if (Object.keys(messages)[0] === 'noMessage') return false;
  return Object.values(messages)[0];
};

const lastMessage = (messages) => {
  const lastMessage = lastMessageObject(messages);
  if (!lastMessage) return null;

  const {user, timeStamp, images} = lastMessage;
  let {text} = lastMessage;

  if (images)
    text = `${Object.values(images).length} file${
      Object.values(images).length === 1 ? '' : 's'
    }`;
  if (text.length > 50) text = text.slice(0, 50) + '...';
  return (
    <Text
      style={[
        styleApp.text,
        {color: colors.subtitle, marginTop: 5, fontSize: 11},
      ]}>
      <Text style={{fontWeight: 'bold', color: colors.greyDark}}>
        {user.info.firstname}:{' '}
      </Text>
      {text}
    </Text>
  );
};

const formatDate = (date) => {
  let justNow = moment(Date.now()).subtract(1, 'minute');
  let earlier = moment(Date.now()).subtract(7, 'days');
  let lastYear = moment(Date.now()).subtract(1, 'year');
  if (date > justNow) return 'Just now';
  else if (date > earlier) return moment(date).fromNow();
  else if (date > lastYear) return moment(date).format('ddd, MMM DD');
  else return moment(date).format('D/M/YYYY');
};

const viewLive = (session, style) => {
  const currentSessionID = store.getState().coach.currentSessionID;
  const activeSession = session.objectID === currentSessionID;
  if (!activeSession) return null;
  const styleViewLive = {
    marginRight: 20,
    height: 24,
    width: 50,
    ...styleApp.center,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.white,
    ...style,
  };
  const styleText = {...styleApp.textBold, color: colors.white, fontSize: 10};
  return (
    <ButtonColor
      view={() => {
        return <Text style={styleText}>Live</Text>;
      }}
      color={colors.red}
      style={styleViewLive}
      click={() => sessionOpening(session)}
      onPressColor={colors.redLight}
    />
  );
};

const buttonPlay = (session) => {
  return (
    <View style={{height: 160}}>
      <ButtonColor
        view={() => {
          return (
            <View style={[styleApp.center]}>
              {imageCardTeam(session)}
              <View
                style={[
                  styleApp.fullSize,
                  {
                    position: 'absolute',
                    backgroundColor: colors.off + '0',
                  },
                ]}>
                <Row
                  style={[styleApp.marginView, {paddingTop: 10, height: 60}]}>
                  <Col style={styleApp.center2}>{viewLive(session)}</Col>
                  <Col style={styleApp.center3}>{hangupButton(session)}</Col>
                </Row>
              </View>
            </View>
          );
        }}
        color={colors.off}
        style={[styleApp.center, styleApp.fullSize]}
        click={() => sessionOpening(session)}
        onPressColor={colors.off2}
      />
    </View>
  );
};

const hangupButton = (session) => {
  const currentSessionID = store.getState().coach.currentSessionID;
  const activeSession = session.objectID === currentSessionID;
  if (!activeSession) return null;
  const styleViewLive = {
    height: 40,
    width: 40,
    ...styleApp.center,
    borderRadius: 20,
  };
  const styleText = {...styleApp.textBold, color: colors.white, fontSize: 10};
  return (
    <ButtonColor
      view={() => {
        return (
          <AllIcons
            name="phone-slash"
            size={15}
            type="font"
            color={colors.white}
          />
        );
      }}
      color={colors.red}
      style={styleViewLive}
      click={() => store.dispatch(unsetCurrentSession())}
      onPressColor={colors.redLight}
    />
  );
};

const rowTitle = ({icon, badge, title, hideDividerHeader}) => {
  const {name, size, color, type} = icon;
  const styleBadge = {
    ...styleApp.center,
    position: 'absolute',
    width: 23,
    borderRadius: 20,
    height: 23,
    top: -15,
    left: 55,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.primary,
  };
  return (
    <View>
      <Row style={[{marginBottom: 10}]}>
        <Col size={30} style={styleApp.center}>
          <AllIcons name={name} type={type} color={color} size={size} />
          {badge && (
            <View style={styleBadge}>
              <Text
                style={[
                  styleApp.textBold,
                  {color: colors.white, fontSize: 10},
                ]}>
                {badge}
              </Text>
            </View>
          )}
        </Col>
        <Col size={75} style={styleApp.center2}>
          <Text style={[styleApp.title]}>{title}</Text>
        </Col>
      </Row>
      {!hideDividerHeader ? (
        <View style={[styleApp.divider]} />
      ) : (
        <View style={{height: 20}} />
      )}
    </View>
  );
};

const viewWithTitle = ({view, title, icon, badge}) => {
  return (
    <View style={{paddingTop: 30}}>
      {rowTitle({icon, badge, title})}

      {view}
    </View>
  );
};

const ListContents = (props) => {
  const {session} = props;
  let {contents} = session;
  if (!contents) contents = {};
  console.log('contents', contents);
  return (
    <FlatListComponent
      list={Object.keys(contents)}
      cardList={({item}) => (
        <CardArchive id={item} style={styleApp.cardArchive} key={item} />
      )}
      numColumns={2}
      incrementRendering={8}
      hideDividerHeader={true}
      header={rowTitle({
        icon: {name: 'galery', type: 'moon', color: colors.title, size: 20},
        badge:
          Object.keys(contents).length === 0
            ? false
            : Object.keys(contents).length,
        title: '',
      })}
    />
  );
};

const ListPlayers = (props) => {
  const {session, messages} = props;
  let {members} = session;
  if (!members) members = {};
  members = Object.values(members).sort((a, b) => {
    if (!a.connectionTimeStamp) a.connectionTimeStamp = 0;
    if (!b.connectionTimeStamp) b.connectionTimeStamp = 0;
    return b.connectionTimeStamp - a.connectionTimeStamp;
  });
  return (
    <FlatListComponent
      list={Object.values(members)}
      hideDividerHeader={true}
      cardList={({item: member}) => (
        <ButtonColor
          key={member.id}
          view={() => {
            console.log('member', member, messages);
            return (
              <Row>
                <Col size={30} style={styleApp.center}>
                  {imageCardTeam({members: {[member.id]: member}})}
                </Col>
                <Col size={60} style={styleApp.center2}>
                  {sessionTitle({members: {[member.id]: member}}, {}, true)}
                  {sessionDate({
                    session: {members: {[member.id]: member}},
                    messages:
                      messages &&
                      Object.values(messages).filter(
                        (message) => message.user.id === member.id,
                      ),
                  })}
                </Col>
                <Col size={15} style={styleApp.center}>
                  {viewLive({members: {[member.id]: member}})}
                </Col>
              </Row>
            );
          }}
          color={colors.white}
          style={{
            ...styleApp.marginView,
            height: 80,
            paddingTop: 10,
            paddingBottom: 10,
          }}
          click={() => true}
          onPressColor={colors.off2}
        />
      )}
      numColumns={1}
      incrementRendering={20}
      header={rowTitle({
        icon: {
          name: 'profileFooter',
          type: 'moon',
          color: colors.title,
          size: 20,
        },
        badge: Object.keys(members).length,
        title: '',
      })}
    />
  );
};

class FlatListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numberToRender: this.props.incrementRendering,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  shouldComponentUpdate(prevProps, prevState) {
    if (!isEqual(prevState, this.state)) return true;
    if (isEqual(this.props, prevProps)) return false;
    return true;
  }
  onEndReached() {
    const {list, incrementRendering} = this.props;
    const {numberToRender} = this.state;
    const lengthList = list.length;

    this.setState({
      numberToRender:
        numberToRender + incrementRendering > lengthList
          ? lengthList
          : numberToRender + incrementRendering,
    });
  }
  render() {
    const {numberToRender} = this.state;
    let {
      list,
      cardList,
      numColumns,
      header,
      AnimatedHeaderValue,
      paddingBottom,
      inverted,
    } = this.props;
    const styleContainerList = {
      width: '100%',
      ...styleApp.marginView,
      paddingTop: 35,
      backgroundColor: colors.white,
      paddingBottom: 60,
      minHeight: height,
    };

    const containerStyle = {
      paddingBottom: paddingBottom ? paddingBottom : 0,
      backgroundColor: 'white',
    };

    const viewLoader = () => {
      return (
        <View style={[styleApp.center, {height: 35, marginTop: 20}]}>
          <Loader size={40} color={colors.grey} />
        </View>
      );
    };

    return (
      <View style={containerStyle}>
        <FlatList
          data={list.slice(0, numberToRender)}
          renderItem={({item}) => cardList({item})}
          ListFooterComponent={() =>
            list.length !== numberToRender && list.length !== 0 && viewLoader()
          }
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="interactive"
          keyExtractor={(item) => (item.id ? item.id : item)}
          numColumns={numColumns}
          scrollEnabled={true}
          inverted={inverted}
          contentContainerStyle={styleContainerList}
          ListHeaderComponent={header}
          showsVerticalScrollIndicator={true}
          onEndReached={() => this.onEndReached()}
          onEndReachedThreshold={0.7}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    y: AnimatedHeaderValue
                      ? AnimatedHeaderValue
                      : this.AnimatedHeaderValue,
                  },
                },
              },
            ],
            {useNativeDriver: false},
          )}
        />
      </View>
    );
  }
}

const conversationView = (session) => {
  const {objectID} = session;
  return viewWithTitle({
    view: <CardConversation objectID={objectID} />,
    title: 'Chat',
    icon: {
      name: 'speech',
      type: 'moon',
      color: colors.title,
      size: 20,
    },
  });
};

const contentView = (session) => {
  const {objectID, contents} = session;

  return viewWithTitle({
    view: <View style={{height: 20}}>{/* <Text>card content </Text> */}</View>,
    title: ``,
    badge: contents ? Object.values(contents).length : false,
    icon: {
      name: 'video-camera',
      type: 'moon',
      color: colors.title,
      size: 20,
    },
  });
};

module.exports = {
  imageCardTeam,
  sessionTitle,
  sessionDate,
  viewLive,
  hangupButton,
  buttonPlay,
  ListPlayers,
  titleSession,
  conversationView,
  contentView,
  lastMessage,
  ListContents,
  rowTitle,
};
