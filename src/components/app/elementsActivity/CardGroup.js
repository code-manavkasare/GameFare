import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import FadeInView from 'react-native-fade-in-view';
import PropTypes from 'prop-types';

import AsyncImage from '../../layout/image/AsyncImage';
import firebase from 'react-native-firebase';
import NavigationService from '../../../../NavigationService';
import {getZone} from '../../functions/location';

import {Col, Row} from 'react-native-easy-grid';
import colors from '../../style/colors';
import PlacelHolder from '../../placeHolders/CardEvent.js';
import ButtonColor from '../../layout/Views/Button';
import styleApp from '../../style/style';

import {searchDiscussion, createDiscussion} from '../../functions/message';
import {subscribeUserToGroup} from '../../functions/createGroup';

class CardGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      player: false,
      loader: false,
      members: {},
    };
  }
  async componentDidMount() {
    this.getMembers();
  }
  getMembers = async () => {
    const {objectID: groupID} = this.props.groupData;

    const groupMembersSnapshot = await firebase
      .database()
      .ref(`groups/${groupID}/members`)
      .limitToFirst(3)
      .once('value');
    let groupMembers = groupMembersSnapshot.val();

    await this.setState({members: groupMembers});
  };
  entreeFee(entreeFee) {
    if (entreeFee === 0) return 'Free entry';
    return '$' + entreeFee + ' entry fee';
  }
  userAlreadyJoined() {
    const {members} = this.state;
    if (!members) return false;
    if (
      this.membersConfirmed(members).filter(
        (user) => user.userID === this.props.userID,
      ).length === 0
    )
      return false;
    return true;
  }
  click(data) {
    if (
      !data.info.public &&
      !this.props.allAccess &&
      data.info.organizer !== this.props.userID &&
      !this.userAlreadyJoined()
    )
      return NavigationService.navigate('Alert', {
        textButton: 'Request to join',
        title: 'This is a private group.',
        subtitle: 'You need an invite to join.',
        onGoBack: () => this.requestJoin(data),
      });
    return NavigationService.push('Group', {
      objectID: data.objectID,
      pageFrom: this.props.pageFrom,
    });
  }
  async requestJoin(data) {
    if (!this.props.userConnected) {
      await NavigationService.goBack();
      return NavigationService.navigate('SignIn');
    }

    var tokenNotification = await firebase.messaging().getToken();
    if (!tokenNotification) tokenNotification = '';
    await subscribeUserToGroup(
      data.objectID,
      this.props.userID,
      this.props.infoUser,
      'pending',
    );
    await NavigationService.goBack();
    return NavigationService.navigate('Alert', {
      title: 'Congrats! You have requested to join ' + data.info.name + '.',
      subtitle: 'You can now send a personal message to the organizer.',
      textButton: 'Chat with ' + data.organizer.info.firstname,
      onGoBack: () => this.chatWithOrganizer(data),
    });
  }
  async chatWithOrganizer(data) {
    var discussion = await searchDiscussion(
      [this.props.userID, data.info.organizer],
      2,
    );
    if (!discussion)
      discussion = await createDiscussion(
        {
          0: data.organizer,
          1: {
            id: this.props.userID,
            info: this.props.infoUser,
          },
        },
        'General',
        false,
      );
    await NavigationService.goBack();
    return NavigationService.push('Conversation', {
      data: discussion,
    });
  }
  card(color, data) {
    if (this.state.loader)
      return (
        <View style={styleApp.cardGroup}>
          <PlacelHolder />
        </View>
      );
    return this.displayCard(color, data);
  }
  membersConfirmed(members) {
    if (!members) return [];
    return Object.values(members).filter(
      (member) => member.status === 'confirmed',
    );
  }
  numberMember(members) {
    if (members) return this.membersConfirmed(members).length;
    return 0;
  }
  cardAttendee(member, i) {
    if (!member.info.picture)
      return (
        <View
          key={i}
          style={{
            ...styleApp.roundView,
            left: i * 15,
          }}>
          <Text style={[styleApp.textBold, {fontSize: 10}]}>
            {member.info.firstname[0] + member.info.lastname[0]}
          </Text>
        </View>
      );
    return (
      <View
        style={{
          ...styleApp.roundView,
          left: i * 15,
        }}
        key={i}>
        <AsyncImage
          style={styleApp.fullSize}
          mainImage={member.info.picture}
          imgInitial={member.info.picture}
        />
      </View>
    );
  }
  rowMembers() {
    const {members} = this.state;
    return (
      <Row style={{height: 50}}>
        <Col size={15} style={[{paddingRight: 10}, styleApp.center2]}>
          <View
            style={[
              styleApp.viewNumber,
              styleApp.center,
              {backgroundColor: colors.primary2},
            ]}>
            <Text style={[styleApp.textBold, styles.numberAttendee]}>
              {this.numberMember(members)}
            </Text>
          </View>
        </Col>
        {this.membersConfirmed(members).length !== 0 && (
          <Col size={30} style={[{paddingRight: 10}, styleApp.center2]}>
            {this.membersConfirmed(members)
              .slice(0, 3)
              .map((member, i) => this.cardAttendee(member, i))}
          </Col>
        )}
        <Col style={styleApp.center2} size={55}>
          <Text style={[styleApp.input, {fontSize: 12}]}>Members</Text>
        </Col>
      </Row>
    );
  }
  displayCard(data) {
    if (!data) return null;
    const picture = data.pictures[0];
    return (
      <ButtonColor
        view={() => {
          return (
            <FadeInView duration={300} style={styleApp.fullSize}>
              <Row style={{height: 115}}>
                <AsyncImage
                  style={styles.profilePicture}
                  mainImage={picture}
                  imgInitial={picture}
                />
              </Row>
              <View style={styles.mainView}>
                <Text style={[styleApp.input, styles.title]}>
                  {data.info.name}
                </Text>
                <Text style={[styleApp.subtitle, styles.subtitle]}>
                  {getZone(data.location.address)}
                </Text>
                {this.rowMembers()}
              </View>
            </FadeInView>
          );
        }}
        click={() => this.click(data)}
        color={'white'}
        style={[styleApp.cardGroup, styleApp.shade]}
        onPressColor={colors.off}
      />
    );
  }

  render() {
    const {groupData} = this.props;
    return this.card(groupData);
  }
}

const styles = StyleSheet.create({
  profilePicture: {
    width: '100%',
    height: 115,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  mainView: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
  },
  title: {
    fontSize: 15,
    minHeight: 20,
    marginTop: 5,
  },
  subtitle: {minHeight: 20, marginTop: 5, fontSize: 11},
  numberAttendee: {fontSize: 10, color: 'white'},
});

CardGroup.propTypes = {
  groupData: PropTypes.object.isRequired,
  allAccess: PropTypes.bool,
};

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    infoUser: state.user.infoUser.userInfo,
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps)(CardGroup);
