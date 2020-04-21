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

class NewConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      loaderHeader: false,
      loaderButton: false,
      users: [],
      usersSelected: this.props.route.params.usersSelected,
      searchInput: '',
      contacts: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.changeSearch('');
  }
  async changeSearch(search) {
    const {route} = this.props;
    const {displayCurrentUser} = route.params;

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
    const {currentWidth} = this.props.currentScreenSize;
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        finalColorOn={colors.primary}
        translateXTo={currentWidth / 2 - 20}
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
    const {currentHeight} = this.props.currentScreenSize;
    return (
      <View style={{marginTop: sizes.heightHeaderHome + sizes.marginTopApp}}>
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
              style={[styles.scrollViewUsers, {minHeight: currentHeight}]}>
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
    const {goBack} = this.props.navigation;
    const {usersSelected, loaderButton} = this.state;

    const {route} = this.props;
    const {titleHeader, closeButton, loaderOnSubmit, onGoBack} = route.params;
    const {currentHeight} = this.props.currentScreenSize;
    return (
      <View style={{backgroundColor: colors.white, height: currentHeight}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={titleHeader}
          inputRange={[0, 0]}
          initialBorderColorIcon={colors.white}
          initialBorderColorHeader={colors.borderColor}
          initialBorderWidth={0}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1={closeButton ? 'times' : 'arrow-left'}
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
                  loader={loaderButton}
                  backgroundColor={'green'}
                  onPressColor={colors.greenLight}
                  click={async () => {
                    if (loaderOnSubmit)
                      await this.setState({loaderButton: true});
                    await onGoBack(usersSelected);
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
    marginTop: 10,
  },
  scrollViewUsers: {
    paddingTop: 10,
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
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {createChallengeAction},
)(NewConversation);
