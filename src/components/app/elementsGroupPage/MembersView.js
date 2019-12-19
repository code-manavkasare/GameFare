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
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import FadeInView from 'react-native-fade-in-view';
import PlaceHolder from '../../placeHolders/ListAttendees';
import AsyncImage from '../../layout/image/AsyncImage';
import colors from '../../style/colors';
import NavigationService from '../../../../NavigationService';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';

class MembersView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
  }
  componentDidMount() {
    /// this.load()
  }
  pictureUser(user) {
    return (
      <View style={styleApp.roundView2}>
        {!user.info.picture ? (
          <Text style={[styleApp.text, {fontSize: 12}]}>
            {user.info.firstname[0] + user.info.lastname[0]}
          </Text>
        ) : (
          <AsyncImage
            style={{height: '100%', width: '100%'}}
            mainImage={user.info.picture}
            imgInitial={user.info.picture}
          />
        )}
      </View>
    );
  }
  rowUser(user, i, data) {
    return (
      <View key={i} style={{paddingTop: 10, paddingBottom: 10}}>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {this.pictureUser(user)}
          </Col>
          <Col size={75} style={styleApp.center2}>
            <Text style={styleApp.text}>
              {user.info.firstname} {user.info.lastname}
            </Text>
          </Col>
          <Col
            size={10}
            style={styleApp.center3}
            activeOpacity={0.7}
            onPress={() =>
              !this.props.userID == data.info.organizer
                ? null
                : NavigationService.navigate('AlertCall', {
                    textButton: 'Close',
                    title: user.info.firstname + ' ' + user.info.lastname,
                    subtitle:
                      user.info.countryCode + ' ' + user.info.phoneNumber,
                    close: true,
                    icon: (
                      <AllIcons
                        name="envelope"
                        type="font"
                        color={colors.green}
                        size={17}
                      />
                    ),
                  })
            }>
            {this.props.userID == data.info.organizer ? (
              <AllIcons
                name="envelope"
                type="font"
                color={colors.green}
                size={17}
              />
            ) : null}
          </Col>
        </Row>
      </View>
    );
  }
  async joinGroup() {
    console.log('join');
    var user = {
      userID: this.props.userID,
      status: 'confirmed',
      info: this.props.infoUser,
    };
    await firebase
      .database()
      .ref('groups/' + this.props.objectID + '/members/' + this.props.userID)
      .update(user);

    var members = this.props.data.members;
    if (members === undefined) members = {};
    await this.props.groupsAction('editGroup', {
      objectID: this.props.data.objectID,
      info: this.props.data.info,
      members: {
        ...members,
        [this.props.userID]: user,
      },
    });
    await this.props.groupsAction('addMyGroup', this.props.data.objectID);
    return NavigationService.navigate('Group');
  }
  join(data) {
    console.log('data join');
    console.log(data);
    if (!this.props.userConnected)
      return NavigationService.navigate('SignIn', {pageFrom: 'Group'});

    if (data.organizer.userID === this.props.userID) {
      return NavigationService.navigate('Alert', {
        textButton: 'Got it!',
        close: true,
        title: 'You are the admin of this group.',
        subtitle: 'You cannot join it.',
      });
    }
    if (!data.members) return this.openJoinAlert(data);

    if (
      Object.values(data.members).filter(
        user => user.userID == this.props.userID,
      ).length != 0
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
        user => user.userID === this.props.userID,
      ).length === 0
    )
      return false;
    return true;
  }
  membersView(data) {
    return (
      <View style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={70}>
              <Text style={[styleApp.text, {marginBottom: 0}]}>Members</Text>
            </Col>
            <Col style={styleApp.center3} size={30}>
              {data.organizer.userID ===
              this.props.userID ? null : this.userAlreadyJoined(data) ? (
                <Row>
                  <Col size={50} style={styleApp.center}>
                    <AllIcons
                      name="check"
                      type="font"
                      color={colors.green}
                      size={17}
                    />
                  </Col>
                  <Col size={50} style={styleApp.center2}>
                    <Text style={[styleApp.text, {color: colors.green}]}>
                      Joined
                    </Text>
                  </Col>
                </Row>
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
                  style={[
                    styleApp.center,
                    {
                      borderColor: colors.off,
                      height: 40,
                      width: 90,
                      borderRadius: 20,
                      borderWidth: 1,
                    },
                  ]}
                  onPressColor={colors.greenClick}
                />
              )}
            </Col>
          </Row>

          <View style={[styleApp.divider2, {marginBottom: 10}]} />
          {this.state.loader ? (
            <FadeInView duration={300} style={{paddingTop: 10}}>
              <PlaceHolder />
              <PlaceHolder />
              <PlaceHolder />
            </FadeInView>
          ) : this.props.data.members == undefined ? (
            <Text style={[styleApp.smallText, {marginTop: 10}]}>
              No one has joined the group yet.
            </Text>
          ) : (
            <FadeInView duration={300} style={{marginTop: 5}}>
              {Object.values(this.props.data.members).map((user, i) =>
                this.rowUser(user, i, data),
              )}
            </FadeInView>
          )}
        </View>
      </View>
    );
  }
  render() {
    return this.membersView(this.props.data);
  }
}

const mapStateToProps = state => {
  return {
    userConnected: state.user.userConnected,
    infoUser: state.user.infoUser.userInfo,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {groupsAction})(MembersView);
