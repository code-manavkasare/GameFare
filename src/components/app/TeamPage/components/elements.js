import React, {Component} from 'react';
import {Text, StyleSheet, View, Image} from 'react-native';
import moment from 'moment';
import {Col, Row, Grid} from 'react-native-easy-grid';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import {styles} from './style';
import {getSortedMembers} from '../../../functions/session';
import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import ButtonColor from '../../../layout/Views/Button';
import {store} from '../../../../../reduxStore';
import {sessionOpening} from '../../../functions/coach';

const imageCardTeam = (session) => {
  const scale = 1;
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
  return (
    <View style={{flex: 1, ...styleApp.center}}>
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
          ),
        )}
    </View>
  );
};

const userCircle = (member, style, scale, length) => {
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
    <View key={member.id ? member.id : -1} style={{}}>
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
};

const titleSession = (session) => {
  const userID = store.getState().user.userID;
  if (session.title) return session.title;
  const members = getSortedMembers(session.members);
  if (!members || !members[0]) return;
  if (members[0].id === userID) return 'Only you';
  let names = members[0].info
    ? members[0].info.firstname + ' ' + members[0].info.lastname
    : '';
  if (members.length > 1)
    names += members[1].info
      ? ', ' + members[1].info.firstname + ' ' + members[1].info.lastname
      : '';
  if (members.length > 2) names += ', and ' + (members.length - 2) + ' others';
  return names;
};

const dateSession = (session) => {
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

  return formatDate(lastActive);
};
const sessionTitle = (session) => {
  return (
    <Text style={[styleApp.title, {fontSize: 17}]}>
      {titleSession(session)}
    </Text>
  );
};
const sessionDate = (session) => {
  return (
    <Text style={[styleApp.text, {color: colors.greyDark, marginTop: 5}]}>
      {dateSession(session)}
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
  else return moment(date).format('MMMM YYYY');
};

viewLive = (session) => {
  const currentSessionID = store.getState().coach.currentSessionID;
  const activeSession = session.objectID === currentSessionID;
  if (!activeSession) return null;
  const styleViewLive = {
    marginRight: 20,
    height: 24,
    width: 50,
    ...styleApp.center,
    borderRadius: 15,
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

buttonPlay = (session) => {
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
                    backgroundColor: colors.off + '30',
                    paddingLeft: 30,
                    paddingTop: 30,
                  },
                ]}>
                {viewLive(session)}
              </View>
            </View>
          );
        }}
        color={colors.transparentGrey}
        style={[styleApp.center, styleApp.fullSize]}
        click={() => sessionOpening(session)}
        onPressColor={colors.title}
      />
    </View>
  );
};

module.exports = {
  imageCardTeam,
  sessionTitle,
  sessionDate,
  viewLive,
  buttonPlay,
};
