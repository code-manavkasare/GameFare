import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import StatusBar from '@react-native-community/status-bar';
import Orientation from 'react-native-orientation-locker';
import {dissoc} from 'ramda';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {
  heightHeaderHome,
  marginTopApp,
  marginTopAppLandscape,
} from '../../../style/sizes';
import Loader from '../../../layout/loaders/Loader';
import Button from '../../../layout/buttons/Button';
import Switch from '../../../layout/switch/Switch';
import CardUserSelect from '../../../layout/cards/CardUserSelect';
import CardSessionSelect from '../../../layout/cards/CardSessionSelect';
import {autocompleteSearchUsers} from '../../../functions/users';
import {searchSessionsForString} from '../../../functions/coach';

const {height, width} = Dimensions.get('screen');

class PickMembers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
      loaderButton: false,
      users: [],
      sessions: [],
      loadingUsers: true,
      loadingSessions: true,
      usersSelected: {},
      sessionsSelected: {},
      selectingUsers: false,
      selectingSessions: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  static getDerivedStateFromProps(props, state) {
    const {selectFromGamefare, selectFromSessions} = props;
    if (selectFromGamefare) {
      return {selectingUsers: true}
    } else if (selectFromSessions) {
      return {selectingSessions: true};
    }
    return {};
  }
  async componentDidMount() {
    this.searchUsers('');
    this.searchSessions('');
    const {usersSelected} = this.props;
    if (usersSelected) {
      this.setState({usersSelected});
    }
  }
  async searchUsers(search) {
    const {displayCurrentUser, blockedByUsers, userID} = this.props;
    const users = await autocompleteSearchUsers(
      search,
      userID,
      displayCurrentUser,
      blockedByUsers ? Object.keys(blockedByUsers) : false,
    );
    this.setState({users, loadingUsers: false});
  }
  async searchSessions(search) {
    const {coachSessions} = this.props;
    const ids = await searchSessionsForString(search);
    const sessions = ids.map((id) => coachSessions[id]);
    this.setState({sessions, loadingSessions: false});
  }
  async selectUser(selected, user, selectedUsers) {
    const {allowSelectMultiple, onSelectMembers} = this.props;
    if (!allowSelectMultiple) {
      const usersSelected = {[user.objectID]: {...user, id: user.objectID}};
      this.setState({usersSelected});
      onSelectMembers(usersSelected, {});
    } else {
      let {usersSelected} = this.state;
      if (usersSelected[user.objectID]) {
        usersSelected = dissoc(user.objectID, usersSelected);
      } else {
        usersSelected = {
          ...usersSelected,
          [user.objectID]: {...user, id: user.objectID},
        };
      }
      this.setState({usersSelected});
    }
  }
  async selectSession(session) {
    const {allowSelectMultiple, onSelectMembers} = this.props;
    if (!allowSelectMultiple) {
      const sessionsSelected = {[session.objectID]: {...session}};
      this.setState({sessionsSelected});
      onSelectMembers({}, sessionsSelected);
    } else {
      let {sessionsSelected} = this.state;
      if (sessionsSelected[session.objectID]) {
        sessionsSelected = dissoc(session.objectID, sessionsSelected);
      } else {
        sessionsSelected = {
          ...sessionsSelected,
          [session.objectID]: {...session},
        };
      }
      this.setState({sessionsSelected});
    }
  }
  searchInput() {
    const {selectingUsers, selectingSessions} = this.state;
    return (
      <View style={styles.searchInputRow}>
        <Row style={styles.searchBar}>
          <Col size={90} style={styleApp.center2}>
            <TextInput
              style={styleApp.input}
              placeholder={'Search'}
              returnKeyType={'done'}
              blurOnSubmit={true}
              ref={(input) => {
                this.textInputRef = input;
              }}
              clearButtonMode={'always'}
              underlineColorAndroid="rgba(0,0,0,0)"
              autoCorrect={true}
              onChangeText={(text) =>
                selectingUsers
                  ? this.searchUsers(text)
                  : selectingSessions
                    ? this.searchSessions(text)
                    : null
              }
            />
          </Col>
        </Row>
      </View>
    );
  }
  cardUser(user, i, usersSelected) {
    return (
      <CardUserSelect
        user={user}
        key={user.objectID}
        usersSelected={usersSelected}
        selectUser={(selected, user, usersSelected) => this.selectUser(selected, user, usersSelected)}
      />
    );
  }
  cardSession(session, i, sessionsSelected) {
    return (
      <CardSessionSelect
        session={session}
        key={i}
        selected={sessionsSelected[session.objectID]}
        select={(session) => this.selectSession(session)}
      />
    );
  }
  userList() {
    const {users, loadingUsers, usersSelected} = this.state;
    if (loadingUsers) {
      return (
        <View style={[styleApp.center, {height: 200}]}>
          <Loader size={55} color={colors.primary} />
        </View>
      );
    }
    return users.map((user, i) => this.cardUser(user, i, usersSelected));
  }
  sessionList() {
    const {sessions, loadingSessions, sessionsSelected} = this.state;
    if (loadingSessions) {
      return (
        <View style={[styleApp.center, {height: 200}]}>
          <Loader size={55} color={colors.primary} />
        </View>
      );
    }
    return sessions.map((session, i) => this.cardSession(session, i, sessionsSelected));
  }
  pickMembers() {
    const {selectFromGamefare, selectFromSessions} = this.props;
    const {selectingUsers, selectingSessions} = this.state;
    return (
      <View
        style={{
          marginTop: heightHeaderHome + marginTopApp,
          height: height - heightHeaderHome - 20,
        }}>
        {selectFromGamefare && selectFromSessions && (
          <View style={[styleApp.marginView, {marginBottom: 5}]}>
            <Switch
              textOn={'GameFare'}
              textOff={'Sessions'}
              finalColorOn={colors.primary}
              translateXTo={width / 2 - 20}
              height={50}
              state={selectingUsers}
              setState={(val) => {
                if (val) {
                  this.setState({selectingUsers: true, selectingSessions: false});
                } else {
                  this.setState({selectingUsers: false, selectingSessions: true});
                }
              }}
            />
          </View>
        )}
        {this.searchInput()}
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          style={styles.scrollViewUsers}>
          {selectFromGamefare && selectingUsers && this.userList()}
          {selectFromSessions && selectingSessions && this.sessionList()}
        </ScrollView>
      </View>
    );
  }
  submitButton() {
    const {usersSelected, sessionsSelected} = this.state;
    const {onSelectMembers} = this.props;
    const numSelected = Object.values(usersSelected).length + Object.values(sessionsSelected).length;
    if (numSelected == 0) {
      return null;
    }
    return (
      <FadeInView
        duration={300}
        style={[styleApp.footerBooking, styleApp.marginView]}>
        <Button
          text={`Confirm ${numSelected} selected`}
          backgroundColor={'green'}
          onPressColor={colors.greenLight}
          click={() => onSelectMembers(usersSelected, sessionsSelected)}
        />
      </FadeInView>
    );
  }
  render() {
    return (
      <View>
        {this.pickMembers()}
        {this.submitButton()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  searchInputRow: {
    height: 55,
    borderBottomWidth: 0,
    borderColor: colors.borderColor,
    width: '100%',
    paddingLeft: '5%',
    paddingRight: '5%',
    // marginTop: 10,
  },
  scrollViewUsers: {
    paddingTop: 10,
    height: '100%',
  },
  searchBar: {
    backgroundColor: colors.off2,
    height: 45,
    paddingLeft: 10,
    borderRadius: 5,
  },
  cardUser: {
    height: 55,
    paddingLeft: 20,
    paddingRight: 20,
  },
  imgUser: {width: 40, height: 40, borderRadius: 20},
});

const mapStateToProps = (state) => {
  return {
    coachSessions: state.coachSessions,
    blockedByUsers: state.user.infoUser.blockedByUsers,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(
  mapStateToProps,
  {},
)(PickMembers);
