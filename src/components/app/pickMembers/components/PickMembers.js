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

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {
  heightHeaderHome,
  marginTopApp,
  marginTopAppLandscape,
} from '../../style/sizes';
import Loader from '../../layout/loaders/Loader';
import Button from '../../layout/buttons/Button';
import Switch from '../../layout/switch/Switch';
import ListContacts from '../elementsEventCreate/elementsContacts/ListContacts';

import CardUserSelect from '../../layout/cards/CardUserSelect';

import {createChallengeAction} from '../../../actions/createChallengeActions';
import {autocompleteSearchUsers} from '../../functions/users';

const {height} = Dimensions.get('screen');

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
    this.setState({usersSelected: this.props.usersSelected})
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
    if (search.toLowerCase() === '') {
      this.listContactRef.setState({
        contacts: this.listContactRef.getContacts(),
      });
    } else {
      this.listContactRef.setState({
        contacts: this.listContactRef
          .getContacts()
          .filter(
            (contact) =>
              contact.info.firstname.toLowerCase().search(search.toLowerCase()) !== -1 ||
              contact.info.lastname.toLowerCase().search(search.toLowerCase()) !== -1,
          ),
      });
    }
  };
  async selectUser(select, user, selectedUsers) {
    const {route} = this.props;
    const {selectMultiple, onGoBack} = route.params;
    if (!selectMultiple) {
      await this.setState({
        usersSelected: {
          [user.objectID]: {...user, id: user.objectID},
        },
      });
      return onGoBack(user);
    }

    let {usersSelected} = this.state;
    if (!usersSelected) usersSelected = {};
    if (usersSelected[user.objectID]) {
      delete usersSelected[user.objectID];
    } else {
      usersSelected = {
        ...usersSelected,
        [user.objectID]: {...user, id: user.objectID},
      };
    }
    return this.setState({usersSelected: usersSelected});
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
        selectUser={this.selectUser.bind(this)}
      />
    );
  }
  selectContact(contact) {
    console.log('contact', contact);
  }
  selectingContacts() {
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
  selectingUsers() {
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
    return (
      <View
        style={{
          marginTop: heightHeaderHome + marginTopApp,
          height: height - heightHeaderHome - 20,
        }}>
        {allowSelectContacts && (
          <View style={styleApp.marginView}>
            <Switch
              textOn={'GameFare'}
              textOff={'Contacts'}
              finalColorOn={colors.primary}
              translateXTo={width / 2 - 20}
              height={50}
              state={selectingContacts}
              setState={async (val) => {
                console.log('val', val);
                await this.setState({selectingContacts: val});
              }}
            />
          </View>
        )}
        {this.searchInput()}
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          style={styles.scrollViewUsers}>
          {selectingContacts ? this.selectContacts() : this.selectUsers()}
        </ScrollView>
      </View>
    );
  }

  render() {
    const {goBack} = this.props.navigation;
    const {usersSelected, loaderButton} = this.state;

    const {route} = this.props;
    const {
      titleHeader,
      closeButton,
      loaderOnSubmit,
      onGoBack,
      noUpdateStatusBar,
      icon2,
      text2,
      clickButton2,
    } = route.params;
    const {height} = Dimensions.get('screen');
    return (
      <View>
        {this.pickMembers(usersSelected)}
        {!usersSelected
          ? null
          : Object.values(usersSelected).length >= 1 && (
              <FadeInView
                duration={300}
                style={[styleApp.footerBooking, styleApp.marginView]}>
                <Button
                  text={
                    'Confirm ' +
                    Object.values(usersSelected).length +
                    ' players'
                  }
                  loader={loaderButton}
                  backgroundColor={'green'}
                  onPressColor={colors.greenLight}
                  click={async () => {
                    if (loaderOnSubmit)
                      await this.setState({loaderButton: true});
                    await onGoBack(usersSelected);
                    if (!noUpdateStatusBar)
                      StatusBar.setBarStyle('light-content', true);
                    return this.setState({loaderButton: false});
                  }}
                />
              </FadeInView>
            )}
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
