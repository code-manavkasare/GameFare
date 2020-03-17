import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import Loader from '../../layout/loaders/Loader';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import Button from '../../layout/buttons/Button';
import Switch from '../../layout/switch/Switch';
import ListContacts from '../elementsEventCreate/elementsContacts/ListContacts';

import CardUserSelect from '../../layout/cards/CardUserSelect';

import {createChallengeAction} from '../../../actions/createChallengeActions';
import {autocompleteSearchUsers} from '../../functions/users';
import {createDiscussion, searchDiscussion} from '../../functions/message';

const {height, width} = Dimensions.get('screen');

class NewConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      loaderHeader: false,
      users: [],
      usersSelected: this.props.navigation.getParam('usersSelected'),
      searchInput: '',
      contacts: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.changeSearch('');
  }
  async changeSearch(search) {
    const displayCurrentUser = this.props.navigation.getParam(
      'displayCurrentUser',
    );
    const users = await autocompleteSearchUsers(
      search,
      this.props.userID,
      displayCurrentUser,
    );
    return this.setState({users: users, loader: false});
  }
  changeSearchContacts = (search) => {
    if (search.toLowerCase() === '') {
      return this.listContactRef.setState({
        contacts: this.listContactRef.getContacts(),
      });
    }
    return this.listContactRef.setState({
      contacts: this.listContactRef
        .getContacts()
        .filter(
          (contact) =>
            contact.info.firstname
              .toLowerCase()
              .search(search.toLowerCase()) !== -1 ||
            contact.info.lastname.toLowerCase().search(search.toLowerCase()) !==
              -1,
        ),
    });
  };
  switch(textOn, textOff, state, click) {
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        finalColorOn={colors.primary}
        translateXTo={width / 2 - 20}
        height={50}
        state={this.state[state]}
        setState={(val) => click(val)}
      />
    );
  }
  next(usersSelected) {
    if (Object.values(usersSelected).length === 0) return true;
    return this.props.navigation.navigate('PickInfos');
  }
  async selectUser(select, user, selectedUsers) {
    const selectMultiple = this.props.navigation.getParam('selectMultiple');
    if (!selectMultiple) {
      await this.setState({
        usersSelected: {
          [user.objectID]: {...user, id: user.objectID},
        },
      });
      return this.props.navigation.state.params.onGoBack(user);
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
    const {contacts} = this.state;
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
                contacts
                  ? this.changeSearchContacts(text)
                  : this.changeSearch(text)
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
        key={i}
        usersSelected={usersSelected}
        selectUser={this.selectUser.bind(this)}
      />
    );
  }
  pickMembers(usersSelected) {
    const {contacts} = this.state;
    return (
      <View style={{marginTop: sizes.heightHeaderHome}}>
        <View style={styleApp.marginView}>
          {this.switch('GameFare', 'Contacts', 'contacts', async (val) => {
            await this.setState({contacts: val});
            return true;
          })}
        </View>
        {this.searchInput()}
        {contacts ? (
          <ListContacts
            selectUser={(selected, user, selectedUsers) =>
              this.selectUser(selected, user, selectedUsers)
            }
            onRef={(ref) => (this.listContactRef = ref)}
            usersSelected={usersSelected}
            selectContact={(contact) => true}
          />
        ) : (
          <View>
            <ScrollView
              keyboardShouldPersistTaps={'always'}
              style={styles.scrollViewUsers}>
              {this.state.loader ? (
                <View style={[styleApp.center, {height: 200}]}>
                  <Loader size={35} color={'green'} />
                </View>
              ) : (
                this.state.users.map((user, i) =>
                  this.cardUser(user, i, usersSelected),
                )
              )}
              <View style={{height: 300}} />
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  render() {
    const {dismiss, goBack} = this.props.navigation;
    const {usersSelected} = this.state;
    const titleHeader = this.props.navigation.getParam('titleHeader');

    return (
      <View style={{backgroundColor: colors.white, height: height}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={titleHeader}
          inputRange={[0, 0]}
          initialBorderColorIcon={colors.white}
          initialBorderColorHeader={colors.borderColor}
          initialBorderWidth={0}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1={'arrow-left'}
          text2={'Next'}
          clickButton1={() => goBack()}
          loader={this.state.loaderHeader}
        />
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
                  backgroundColor={'green'}
                  onPressColor={colors.greenLight}
                  click={() =>
                    this.props.navigation.state.params.onGoBack(usersSelected)
                  }
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
    width: width,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 10,
  },
  scrollViewUsers: {
    paddingTop: 10,
    minHeight: height,
    // backgroundColor: colors.green,
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
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    captains: state.createChallengeData.captains,
  };
};

export default connect(mapStateToProps, {createChallengeAction})(
  NewConversation,
);
