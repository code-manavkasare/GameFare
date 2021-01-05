import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import {marginTopApp, heightHeaderHome} from '../../style/sizes';
import Loader from '../../layout/loaders/Loader';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CardUserSelect from '../../layout/cards/CardUserSelect';

import {autocompleteSearchUsers} from '../../functions/users';
import {createDiscussion, searchDiscussion} from '../../functions/message';
import {userIDSelector, userInfoSelector} from '../../../store/selectors/user';
import {blockedByUsersSelector} from '../../../store/selectors/blockedUsers';

const {height, width} = Dimensions.get('screen');

class NewConversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      loaderHeader: false,
      users: [],
      selectedUsers: {},
      searchInput: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.changeSearch('');
  }
  async changeSearch(search) {
    const {blockedByUsers} = this.props;
    const users = await autocompleteSearchUsers(
      search,
      this.props.userID,
      false,
      blockedByUsers ? Object.keys(blockedByUsers) : false,
    );
    this.setState({users: users, loader: false});
  }
  async next(selectedUsers) {
    const {userID, infoUser} = this.props;
    if (Object.values(selectedUsers).length === 0) return true;
    await this.setState({loaderHeader: true});
    let users = Object.values(selectedUsers).map((user) => user.objectID);
    users.push(userID);
    var discussion = await searchDiscussion(users, users.length);
    users = Object.values(selectedUsers).map((user) => {
      user.id = user.objectID;
      return user;
    });
    users = users.concat({
      id: userID,
      info: infoUser,
    });

    if (!discussion) {
      discussion = await createDiscussion(users, 'General', false);
      if (!discussion) {
        await this.setState({loaderHeader: false});
        return this.props.navigation.navigate('Alert', {
          close: true,
          title: 'An unexpected error has occured.',
          subtitle: 'Please contact us.',
          textButton: 'Got it!',
        });
      }
    }

    await this.props.navigation.navigate('Conversation', {
      data: discussion,
      myConversation: true,
    });
    return this.setState({loaderHeader: false});
  }
  selectUser(select, user, selectedUsers) {
    if (!select)
      selectedUsers = {
        ...selectedUsers,
        [user.objectID]: user,
      };
    else delete selectedUsers[user.objectID];
    this.setState({selectedUsers: selectedUsers});
  }
  searchInput() {
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
              onChangeText={(text) => this.changeSearch(text)}
            />
          </Col>
        </Row>
      </View>
    );
  }
  cardUser(user, i, selectedUsers) {
    return (
      <CardUserSelect
        user={user}
        key={i}
        selectUser={this.selectUser.bind(this)}
        usersSelected={selectedUsers}
      />
    );
  }
  newConversationPage(selectedUsers) {
    let marginTopAdd = marginTopApp;
    return (
      <View style={{marginTop: heightHeaderHome + marginTopAdd}}>
        {this.searchInput(selectedUsers)}

        <ScrollView
          keyboardShouldPersistTaps={'always'}
          style={styles.scrollViewUsers}>
          {this.state.loader ? (
            <View style={[styleApp.center, {height: 200}]}>
              <Loader size={55} color={colors.primary} />
            </View>
          ) : (
            this.state.users.map((user, i) =>
              this.cardUser(user, i, selectedUsers),
            )
          )}
          <View style={{height: 300}} />
        </ScrollView>
      </View>
    );
  }

  render() {
    const {dismiss, goBack} = this.props.navigation;
    let {selectedUsers} = this.state;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Add participants'}
          inputRange={[0, 0]}
          initialBorderColorIcon={colors.white}
          initialBorderColorHeader={colors.white}
          initialBorderWidth={1}
          initialBackgroundColor={'white'}
          typeIcon2={'font'}
          sizeIcon2={17}
          initialTitleOpacity={1}
          icon1={'times'}
          icon2={'text'}
          text2={'Next'}
          clickButton1={() => goBack()}
          clickButton2={() => this.next(selectedUsers)}
          loader={this.state.loaderHeader}
        />

        {this.newConversationPage(selectedUsers)}
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
  },
  scrollViewUsers: {
    paddingTop: 10,
    minHeight: height,
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
});

const mapStateToProps = (state) => {
  return {
    blockedByUsers: blockedByUsersSelector(state),
    userID: userIDSelector(state),
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(NewConversation);
