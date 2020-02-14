import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {groupsAction} from '../../../actions/groupsActions';
import {messageAction} from '../../../actions/messageActions';
import {subscribeToTopics} from '../../functions/notifications';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';
import CardUser from '../elementsEventPage/CardUser';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListAttendees';
import AsyncImage from '../../layout/image/AsyncImage';
import colors from '../../style/colors';
import NavigationService from '../../../../NavigationService';
import {subscribeUserToGroup} from '../../functions/createGroup';
import {removeMemberDiscussion} from '../../functions/createEvent';
import {arrayAttendees} from '../../functions/createEvent';
import {indexDiscussions} from '../../database/algolia';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {}
  rowUser(user, i, data) {
    return (
      <Row key={i} style={styleApp.center2}>
        <Col style={styleApp.center}>
          <CardUser
            user={user}
            infoUser={this.props.infoUser}
            admin={this.props.data.info.organizer === this.props.userID}
            userConnected={this.props.userConnected}
            objectID={this.props.data.objectID}
            userID={this.props.userID}
            removable={this.props.editMode}
            removeFunc={() => this.props.onRemoveMember(user)}
            type="group"
          />
        </Col>
      </Row>
    );
  }
  async joinGroup() {
    const {data, infoUser, userID, objectID} = this.props;

    const conversation = await indexDiscussions.getObject(data.discussions[0]);
    await this.setConversation(conversation);

    await subscribeToTopics([userID, 'all', objectID]);

    const user = await subscribeUserToGroup(
      objectID,
      userID,
      infoUser,
      'confirmed',
      '',
      data.discussions[0],
    );

    var members = data.members;
    if (!members) members = {};

    await this.props.groupsAction('editGroup', {
      objectID: objectID,
      ...data,
      members: {
        ...members,
        [userID]: user,
      },
    });
    await this.props.groupsAction('addMyGroup', objectID);

    return NavigationService.navigate('Group');
  }
  async setConversation(data) {
    await this.props.messageAction('setConversation', data);
    await this.props.messageAction('setMyConversations', {
      [data.objectID]: true,
    });
    return true;
  }
  join(data) {
    if (!this.props.userConnected)
      return NavigationService.navigate('SignIn', {pageFrom: 'Group'});
    if (!data.members) return this.openJoinAlert(data);

    if (
      Object.values(data.members).filter(
        (user) => user.userID === this.props.userID,
      ).length !== 0
    ) {
      return NavigationService.navigate('Alert', {
        textButton: 'Got it!',
        close: true,
        title: 'You are already a member of this group.',
        subtitle: 'You cannot join it.',
      });
    }
    return this.openJoinAlert(data);
  }
  openJoinAlert(data) {
    NavigationService.navigate('Alert', {
      textButton: 'Join now',
      title: 'Do you wish to join ' + data.info.name + '?',
      onGoBack: () => this.joinGroup(),
    });
  }
  userAlreadyJoined(data) {
    if (!data.members) return false;
    if (
      Object.values(data.members).filter(
        (user) => user.userID === this.props.userID,
      ).length === 0
    )
      return false;
    return true;
  }
  buttonLeave(data) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={40} style={styleApp.center}>
                <AllIcons
                  name="sign-out-alt"
                  type="font"
                  color={colors.white}
                  size={15}
                />
              </Col>
              <Col size={60} style={styleApp.center2}>
                <Text style={[styleApp.text, {color: colors.white}]}>
                  Leave
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() =>
          NavigationService.navigate('Alert', {
            textButton: 'Leave',
            onGoBack: () => this.confirmLeaveGroup(data),
            icon: (
              <AllIcons
                name="sign-out-alt"
                color={colors.primary}
                type="font"
                size={22}
              />
            ),
            title: 'Are you sure you want to leave this group?',
            colorButton: 'primary',
            onPressColor: colors.primaryLight,
          })
        }
        color={colors.primary}
        style={styles.buttonLeave}
        onPressColor={colors.primaryLight}
      />
    );
  }
  async confirmLeaveGroup(data) {
    if (data.discussions)
      await this.props.messageAction(
        'deleteMyConversation',
        data.discussions[0],
      );
    await this.props.groupsAction('deleteMyGroup', data.objectID);
    await firebase
      .database()
      .ref('groups/' + data.objectID + '/members/' + this.props.userID)
      .update({action: 'unsubscribed'});
    await firebase
      .database()
      .ref('groups/' + data.objectID + '/members/' + this.props.userID)
      .remove();
    await removeMemberDiscussion(data.discussions[0], this.props.userID);
    await NavigationService.goBack();
    return true;
  }
  membersView(data, members) {
    return (
      <View style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={70}>
              <Text style={[styleApp.text, {marginBottom: 0}]}>Members</Text>
            </Col>
            <Col style={styleApp.center3} size={30}>
              {data.organizer.id ===
              this.props.userID ? null : this.userAlreadyJoined(data) ? (
                this.buttonLeave(data)
              ) : (
                <ButtonColor
                  view={() => {
                    return (
                      <Text style={[styleApp.text, {color: 'white'}]}>
                        Join
                      </Text>
                    );
                  }}
                  click={() => this.join(data)}
                  color={colors.green}
                  style={[styleApp.center, styles.buttonJoin]}
                  onPressColor={colors.greenClick}
                />
              )}
            </Col>
          </Row>
          <View style={[styleApp.divider2, {marginBottom: 10}]} />
        </View>

        {this.state.loader ? (
          <FadeInView duration={300} style={{paddingTop: 10}}>
            <PlaceHolder />
            <PlaceHolder />
            <PlaceHolder />
          </FadeInView>
        ) : members.length === 0 ? (
          <Text style={[styleApp.smallText, {marginTop: 10, marginLeft: 20}]}>
            No one has joined the group yet.
          </Text>
        ) : (
          <FadeInView duration={300} style={{marginTop: 5}}>
            {members.map((user, i) => this.rowUser(user, i, data))}
          </FadeInView>
        )}
      </View>
    );
  }
  render() {
    const {data, userID} = this.props;
    const members = arrayAttendees(data.members, userID, data.info.organizer);
    return this.membersView(data, members);
  }
}

const styles = StyleSheet.create({
  buttonJoin: {
    borderColor: colors.off,
    height: 40,
    width: 90,
    borderRadius: 20,
    borderWidth: 1,
  },
  buttonLeave: {
    borderColor: colors.off,
    height: 40,
    width: 100,
    borderRadius: 20,
    borderWidth: 1,
  },
});

const mapStateToProps = (state) => {
  return {
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {groupsAction, messageAction})(
  MembersView,
);
