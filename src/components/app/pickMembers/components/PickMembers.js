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
import CardContactSelect from '../../../layout/cards/CardContactSelect';
import {getPhoneContacts} from '../../../functions/phoneContacts';
import {autocompleteSearchUsers} from '../../../functions/users';
import {createChallengeAction} from '../../../../actions/createChallengeActions';

const {height, width} = Dimensions.get('screen');

class PickMembers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingUsers: true,
      loadingContacts: true,
      loaderButton: false,
      users: [],
      contacts: [],
      usersSelected: {},
      contactsSelected: {},
      searchInput: '',
      selectingContacts: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.searchUsers('');
    this.searchContacts('');
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
    this.setState({users: users, loadingUsers: false});
  }
  searchContacts = (search) => {
    const contacts = getPhoneContacts();
    console.log('contacts', contacts);
  };
  async selectUser(selected, user, selectedUsers) {
    const {allowSelectMultiple, onSelectMembers} = this.props;
    if (!allowSelectMultiple) {
      const usersSelected = {[user.objectID]: {...user, id: user.objectID}};
      await this.setState({usersSelected});
      onSelectMembers(usersSelected);
    } else {
      let {usersSelected} = this.state;
      if (usersSelected[user.objectID]) {
        delete usersSelected[user.objectID];
      } else {
        usersSelected = {
          ...usersSelected,
          [user.objectID]: {...user, id: user.objectID},
        };
      }
      this.setState({usersSelected});
    }
  }
  searchInput() {
    const {selectingContacts} = this.state;
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
                selectingContacts
                  ? this.searchContacts(text)
                  : this.searchUsers(text)
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
  selectContact(contact) {
    console.log('contact', contact);
  }
  contactList() {
    const {contacts, loadingContacts, contactsSelected} = this.state;
    if (loadingContacts) {
      return (
        <View style={[styleApp.center, {height: 200}]}>
          <Loader size={55} color={colors.primary} />
        </View>
      );
    }
    return (
      <ListContacts
        selectUser={(selected, user, contactsSelected) =>
          this.selectUser(selected, user, selectedUsers)
        }
        searchText={''}
        onRef={(ref) => this.listContactRef = ref}
        contactsSelected={contactsSelected}
        selectContact={(contact) => this.selectContact(contact)}
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
  pickMembers() {
    const {allowSelectContacts} = this.props;
    const {selectingContacts} = this.state;
    console.log('pickMembers', this.props);
    return (
      <View
        style={{
          marginTop: heightHeaderHome + marginTopApp,
          height: height - heightHeaderHome - 20,
        }}>
        {allowSelectContacts && (
          <View style={[styleApp.marginView, {marginBottom: 5}]}>
            <Switch
              textOn={'GameFare'}
              textOff={'Contacts'}
              finalColorOn={colors.primary}
              translateXTo={width / 2 - 20}
              height={50}
              state={selectingContacts}
              setState={async (val) => {
                await this.setState({selectingContacts: val})
                return true;
              }}
            />
          </View>
        )}
        {this.searchInput()}
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          style={styles.scrollViewUsers}>
          {selectingContacts ? this.contactList() : this.userList()}
        </ScrollView>
      </View>
    );
  }
  submitButton() {
    const {usersSelected, contactsSelected} = this.state;
    const {onSelectMembers} = this.props;
    const numSelected = Object.values(usersSelected).length + Object.values(contactsSelected).length;
    if (numSelected == 0) {
      return null;
    }
    return (
      <FadeInView
        duration={300}
        style={[styleApp.footerBooking, styleApp.marginView]}>
        <Button
          text={`Confirm ${numSelected} players`}
          backgroundColor={'green'}
          onPressColor={colors.greenLight}
          click={() => onSelectMembers(usersSelected, contactsSelected)}
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
    blockedByUsers: state.user.infoUser.blockedByUsers,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    captains: state.createChallengeData.captains,
  };
};

export default connect(
  mapStateToProps,
  {createChallengeAction},
)(PickMembers);
