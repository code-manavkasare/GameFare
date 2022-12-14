import React from 'react';
import {Text, View} from 'react-native';
import moment from 'moment';
import {Col, Row} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';

import {getSortedMembers} from '../../../functions/session';
import AllIcons from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import {FlatListComponent} from '../../../layout/Views/FlatList';

import {store} from '../../../../store/reduxStore';
import {unsetCurrentSession} from '../../../../store/actions/coachActions';
import {
  sessionOpening,
  selectVideosFromLibrary,
} from '../../../functions/coach';
import {createInviteToSessionBranchUrl} from '../../../database/branch';

import CardArchive from '../../coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';
import AllIcon from '../../../layout/icons/AllIcons';
import CardUser from '../../../layout/cards/CardUser';

const imageCardTeam = (session, size, hideDots, color) => {
  let scale = 1;
  if (size) {
    scale = 0.7;
  }
  if (!session?.members) {
    return null;
  }
  const members = getSortedMembers(session?.members);
  const length = members.length;
  const styleByIndex = (i) => {
    if (length > 1) {
      return {
        position: 'absolute',
        top:
          (i === 0 ? -25 * scale : i === 1 ? -39 * scale : -6 * scale) +
          (length === 2 ? 8 * scale : 0 * scale),
        left: i === 0 ? -40 * scale : i === 1 ? -10 * scale : -10 * scale,
      };
    }
  };
  let styleContainer = {};
  return (
    <View style={{flex: 1, ...styleApp.center, ...styleContainer}}>
      {length > 2 ? (
        <View>
          {userCircle({
            displayRemainder: length - 2,
            style: styleByIndex(-1),
            scale,
            length: Object.values(session.members).length - 1,
            color,
          })}
        </View>
      ) : null}
      {members
        .splice(0, 2)
        .reverse()
        .map((member, i) =>
          userCircle({
            member,
            style: styleByIndex(i),
            scale,
            hideDots,
            length: Object.values(session.members).length - 1,
            single: Object.values(session.members).length === 2,
            color,
          }),
        )}
    </View>
  );
};

const userCircle = (options) => {
  const {
    member,
    style,
    scale,
    length,
    hideDots,
    single,
    color,
    displayRemainder,
  } = options;
  let borderRadius = 100;
  let sizeImg = length > 1 ? 45 * scale : 63 * scale;
  const styleImg = {
    height: sizeImg,
    width: sizeImg,
    borderRadius: borderRadius + 3,
    borderWidth: 4 * scale,
    borderColor: color ? color : colors.white,
    overflow: 'hidden',
    backgroundColor: colors.grey,
  };
  const containerStyle = {
    ...styleApp.fullSize,
    ...styleApp.center,
    borderRadius,
    backgroundColor: colors.greyDark,
  };

  return (
    <View key={member?.id ?? -1}>
      <View style={{...style}}>
        <View style={{...styleImg}}>
          {displayRemainder ? (
            <View style={containerStyle}>
              <Text
                style={{
                  ...styleApp.textBold,
                  fontSize: 13,
                  color: colors.white,
                }}>
                +{displayRemainder}
              </Text>
            </View>
          ) : (
            <CardUser
              id={member?.id}
              imgOnly
              styleImg={containerStyle}
              profileInitialsStyle={{fontSize: scale * (single ? 21 : 14)}}
            />
          )}
        </View>
        {!hideDots && member ? (
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
              borderColor: color ? color : colors.white,
            }}
          />
        ) : null}
      </View>
    </View>
  );
};

const titleSession = (session, size, short) => {
  const userID = store.getState().user.userID;
  if (session.title) {
    return session.title;
  }
  const members = getSortedMembers(session.members);
  if (!members || !members[0]) {
    return;
  }
  if (members[0].id === userID) {
    return 'You';
  }
  if (short) {
    const firstMember = store.getState().users[members[0].id];
    const name = firstMember?.firstname;
    const string =
      members.length === 1
        ? name + ' ' + firstMember?.lastname
        : name +
          ' & ' +
          (members.length - 1) +
          ' other' +
          (members.length !== 2 ? 's' : '');
    return string;
  }

  const names = members.reduce((nameString, memberObject, i, members) => {
    const member = store.getState().users[memberObject.id];
    if (member && member.firstname && member.lastname) {
      const {firstname, lastname} = member;
      const and = short ? ' & ' : ' and ';
      if (nameString === '') {
        return firstname + ' ' + lastname;
      } else {
        const numNames = nameString.split(',').length;
        if (numNames < 2) {
          if (members.length === 2) {
            return nameString + and + firstname + ' ' + lastname;
          }
          return nameString + ', ' + firstname + ' ' + lastname;
        } else if (numNames === 2) {
          if (i === members.length - 1) {
            return nameString + ',' + and + firstname + ' ' + lastname;
          } else {
            return (
              nameString + ',' + and + `${members.length - numNames} others`
            );
          }
        } else {
          return nameString;
        }
      }
    } else {
      return nameString;
    }
  }, '');
  return names;
};

const dateSession = ({session, lastMessage, component, messages}) => {
  let {members, createdAt} = session;
  if (!members) {
    return formatDate(Date.now());
  }
  members = members ? Object.values(members) : [];
  const activeMembers = members.filter((m) => m.isConnected);
  if (activeMembers.length > 0) {
    return 'Active now';
  }

  const lastActive = members.sort((a, b) => {
    if (!a.disconnectionTimeStamp) {
      return 1;
    }
    if (!b.disconnectionTimeStamp) {
      return -1;
    }
    if (a.disconnectionTimeStamp < b.disconnectionTimeStamp) {
      return 1;
    }
    if (a.disconnectionTimeStamp > b.disconnectionTimeStamp) {
      return -1;
    } else {
      return 0;
    }
  })[0].disconnectionTimeStamp;
  if (!lastMessage) lastMessage = lastMessageObject(messages);
  let dateLastMessage = 0;
  if (lastMessage) {
    dateLastMessage = lastMessage.timeStamp;
  }

  if (!lastActive && !dateLastMessage) {
    return component ? formatDate(createdAt) : createdAt;
  }

  if ((!lastActive && dateLastMessage > 0) || dateLastMessage > lastActive) {
    return component ? formatDate(dateLastMessage) : dateLastMessage;
  }

  return component ? formatDate(lastActive) : lastActive;
};
const sessionTitle = (session, styleText) => {
  return (
    <Text style={[styleApp.title, {fontSize: 17}, styleText]}>
      {titleSession(session, false)}
    </Text>
  );
};

const lastMessageObject = (messages) => {
  if (!messages) {
    return false;
  }
  if (Object.keys(messages)[0] === 'noMessage') {
    return false;
  }
  return Object.values(messages)[0];
};

const sessionDate = ({session, lastMessage, messages}) => {
  return (
    <Text
      style={[
        styleApp.text,
        {color: colors.greyDark, marginTop: 0, fontSize: 10},
      ]}>
      {dateSession({session, lastMessage, component: true, messages})}
    </Text>
  );
};

const blueBadge = () => {
  const blueBadge = {
    ...styleApp.center,
    width: 20,
    borderRadius: 20,
    height: 20,
    backgroundColor: colors.primary,
    marginView: 'auto',
  };
  return <View style={blueBadge} />;
};

const lastMessageView = (lastMessage) => {
  if (!lastMessage) return null;
  const {user, images, type} = lastMessage;
  if (lastMessage.id === 'noMessage') return null;
  const {userID} = store.getState().user;
  const userInfo = store.getState().users[user.id];
  let {text} = lastMessage;
  if (!text) text = '';
  text = text.replace(/(\r\n|\n|\r)/gm, ' ');
  if (images) {
    text = `${Object.values(images).length} file${
      Object.values(images).length === 1 ? '' : 's'
    }`;
  }
  const maxLength = 20;
  if (text.length > maxLength) {
    text = '...' + text.slice(text.length - maxLength, text.length);
  }
  if (type === 'video') {
    text = 'Shared video';
  } else if (type === 'connection') {
    text = 'Video call';
  }
  const containerStyle = {
    marginTop: 5,
    height: 35,
    marginBottom: 10,
    ...styleApp.center4,
  };
  const styleProfilePhotoContainer = {
    ...styleApp.center,
    position: 'absolute',
    bottom: -7,
    left: user.id === userID ? null : -13,
    right: user.id === userID ? -13 : null,
    zIndex: 2,
    borderWidth: 3,
    borderRadius: 30,
    borderColor: colors.white,
  };
  const profilePhotoStyle = {
    height: 20,
    width: 20,
    borderRadius: 30,
    backgroundColor: colors.grey,
  };
  const nameTextStyle = {
    ...styleApp.textBold,
    color: colors.greyDark,
    position: 'absolute',
    bottom: user.id === userID ? -15 : -17,
    left: user.id === userID ? undefined : 15,
    right: user.id === userID ? 15 : undefined,
    fontSize: 10,
    zIndex: 2,
  };
  const messageContainerStyle = {
    flexDirection: 'row',
    maxHeight: 30,
    paddingHorizontal: 10,
    marginLeft: 5,
    ...styleApp.center,
    height: '100%',
    borderRadius: 20,
    backgroundColor: user.id === userID ? colors.blue : colors.greyDark,
  };
  const iconStyle = {
    marginLeft: user.id === userID ? undefined : 5,
    marginRight: 5,
  };
  const messageTextStyle = {
    ...styleApp.textBold,
    color: colors.white,
    fontSize: 13,
    textAlignVertical: 'center',
    marginRight: user.id === userID ? 5 : undefined,
  };
  return (
    <Row style={containerStyle}>
      <View style={messageContainerStyle}>
        <View style={styleProfilePhotoContainer}>
          <CardUser imgOnly styleImg={profilePhotoStyle} id={user.id} />
        </View>
        <Text style={nameTextStyle}>
          {user.id === userID
            ? 'You'
            : userInfo?.firstname + ' ' + userInfo?.lastname}
        </Text>
        <AllIcon
          name={
            type === 'connection'
              ? 'video'
              : type === 'video'
              ? 'play'
              : 'comment-alt'
          }
          solid
          size={11}
          color={colors.white}
          type="font"
          style={iconStyle}
        />
        <Text numberOfLines={1} ellipsizeMode="head" style={messageTextStyle}>
          {text}
        </Text>
      </View>
    </Row>
  );
};

const formatDate = (date) => {
  let justNow = moment(Date.now()).subtract(1, 'minute');
  let earlier = moment(Date.now()).subtract(7, 'days');
  let lastYear = moment(Date.now()).subtract(1, 'year');
  if (date > justNow) {
    return 'Just now';
  } else if (date > earlier) {
    return moment(date).fromNow();
  } else if (date > lastYear) {
    return moment(date).format('ddd, MMM DD');
  } else {
    return moment(date).format('D/M/YYYY');
  }
};

const viewLive = (session, style, hideText) => {
  const currentSessionID = store.getState().coach.currentSessionID;
  const activeSession = session.objectID === currentSessionID;
  if (!activeSession) {
    return null;
  }
  const styleViewLive = {
    marginRight: 20,
    height: 24,
    width: 50,
    ...styleApp.center,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: colors.white,
    ...style,
  };
  const styleText = {...styleApp.textBold, color: colors.white, fontSize: 10};
  return (
    <ButtonColor
      view={() => {
        return <Text style={styleText}>{!hideText ? 'Live' : ''}</Text>;
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
  if (!activeSession) {
    return null;
  }
  const styleViewLive = {
    height: 40,
    width: 40,
    ...styleApp.center,
    borderRadius: 20,
  };
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

const iconWithBadge = (icon, badgeNumber) => {
  const {name, size, color, type, solid} = icon;
  const styleBadge = {
    ...styleApp.center,
    position: 'absolute',
    width: 23,
    paddingTop: 1,
    paddingLeft: 1,
    borderRadius: 20,
    height: 23,
    top: -14,
    left: 15,
    backgroundColor: colors.primary,
  };
  const styleBadgeText = {
    fontSize:
      badgeNumber && !isNaN(badgeNumber)
        ? badgeNumber > 999
          ? 8
          : badgeNumber > 99
          ? 9
          : 10
        : 10,
  };
  if (!badgeNumber) return null;
  return (
    <View>
      <AllIcons
        name={name}
        type={type}
        color={color}
        size={size}
        solid={solid}
      />
      {badgeNumber ? (
        <View style={styleBadge}>
          <Text
            style={[
              styleApp.textBold,
              {...styleBadgeText, color: colors.white},
            ]}>
            {badgeNumber}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const rowTitle = ({
  badge,
  title,
  hideDividerHeader,
  button,
  titleColor,
  customButton,
  containerStyle,
  titleStyle,
  clickOnRow,
}) => {
  const icon = button?.icon;
  const styleButton = {
    height: 30,
    width: '100%',
    borderRadius: 10,
    ...button?.style,
    zIndex: 10,
  };
  const styleBadgeText = {
    fontSize:
      badge && !isNaN(badge) ? (badge > 999 ? 8 : badge > 99 ? 9 : 10) : 10,
  };
  const styleContainer = {
    ...containerStyle,
    ...styleApp.center,
    minHeight: 50,
    paddingTop: 10,
  };
  return (
    <View style={styleContainer}>
      <Row
        activeOpacity={1}
        onPress={() => {
          clickOnRow && button.click();
        }}>
        <Col size={1} />
        <Col size={55} style={styleApp.center2}>
          <Text
            style={[
              styleApp.title,
              titleStyle,
              {color: titleColor ? titleColor : colors.title},
            ]}>
            {title}
          </Text>
        </Col>
        <Col size={20} style={styleApp.center3}>
          {customButton ? (
            customButton
          ) : button ? (
            <ButtonColor
              view={() => {
                return button.text ? (
                  <Text
                    style={[
                      styleApp.textBold,
                      {color: colors.white, fontSize: button?.fontSize ?? 14},
                    ]}>
                    {button.text}
                  </Text>
                ) : icon ? (
                  <AllIcon
                    name={icon.name}
                    solid
                    size={icon.size ?? 17}
                    color={icon.color ?? colors.white}
                    type={icon.type}
                    style={icon.style}
                  />
                ) : null;
              }}
              color={button.color ?? colors.primary}
              style={styleButton}
              click={() => {
                button.click();
              }}
              onPressColor={button.onPressColor ?? colors.primaryLight}
            />
          ) : null}
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
  let {contents, objectID} = session;
  if (!contents) {
    contents = {};
  }
  return (
    <FlatListComponent
      list={Object.values(contents).sort(function(a, b) {
        return b.timeStamp - a.timeStamp;
      })}
      cardList={({item}) => (
        <CardArchive id={item.id} style={styleApp.cardArchive} key={item.id} />
      )}
      styleContainer={{paddingTop: 20}}
      numColumns={2}
      incrementRendering={4}
      initialNumberToRender={8}
      hideDividerHeader={true}
      ListEmptyComponent={{
        text: 'You have not shared any content yet',
      }}
      header={rowTitle({
        icon: {name: 'galery', type: 'moon', color: colors.title, size: 20},
        hideDividerHeader: true,
        button: {
          text: 'Add',
          click: () => selectVideosFromLibrary(objectID),
        },
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
  const {session, messages, navigate} = props;
  let {members, objectID} = session;
  if (!members) {
    members = {};
  }
  members = Object.values(members).sort((a, b) => {
    if (!a.connectionTimeStamp) {
      a.connectionTimeStamp = 0;
    }
    if (!b.connectionTimeStamp) {
      b.connectionTimeStamp = 0;
    }
    return b.connectionTimeStamp - a.connectionTimeStamp;
  });
  return (
    <FlatListComponent
      list={Object.values(members)}
      hideDividerHeader={true}
      initialNumberToRender={20}
      incrementRendering={6}
      lazy={false}
      styleContainer={{flex: 1, paddingTop: 10, paddingBottom: 10}}
      cardList={({item: member}) => (
        <ButtonColor
          key={member.id}
          view={() => {
            return (
              <Row>
                <Col size={30} style={styleApp.center}>
                  {imageCardTeam({members: {[member.id]: member}})}
                </Col>
                <Col size={60} style={styleApp.center2}>
                  {sessionTitle({members: {[member.id]: member}}, {}, true)}
                  {sessionDate({
                    session: {members: {[member.id]: member}},
                    messages: messages
                      ? Object.values(messages).filter(
                          (message) => message.user.id === member.id,
                        )
                      : null,
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
          click={() => navigate('ProfilePage', {id: member.id})}
          onPressColor={colors.off2}
        />
      )}
      numColumns={1}
      header={rowTitle({
        icon: {
          name: 'profileFooter',
          type: 'moon',
          color: colors.title,
          size: 20,
        },
        button: {
          text: 'Add',
          click: async () =>
            navigate('SearchPage', {
              action: 'invite',
              sessionToInvite: objectID,
              branchLink: await createInviteToSessionBranchUrl(objectID),
            }),
        },
        hideDividerHeader: true,
        badge: Object.keys(members).length,
        title: '',
      })}
    />
  );
};

const contentView = (session) => {
  const {contents} = session;

  return viewWithTitle({
    view: <View style={{height: 20}}>{/* <Text>card content </Text> */}</View>,
    title: '',
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
  blueBadge,
  buttonPlay,
  contentView,
  hangupButton,
  imageCardTeam,
  lastMessageView,
  ListContents,
  ListPlayers,
  rowTitle,
  dateSession,
  sessionDate,
  sessionTitle,
  titleSession,
  viewLive,
};
