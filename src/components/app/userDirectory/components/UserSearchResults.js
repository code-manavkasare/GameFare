import React, {Component} from 'react';
import {View, Animated, Text, TextInput, Image, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {Row, Col} from 'react-native-easy-grid';
import {
  KeyboardAwareScrollView,
  KeyboardAwareFlatList,
} from 'react-native-keyboard-aware-scroll-view';
import PropTypes from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import sizes from '../../../style/sizes';

import {autocompleteSearchUsers} from '../../../functions/users';

import AllIcon from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import CardUserSelect from '../../../layout/cards/CardUserSelect';

class UserSearchResults extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    selectedUsers: PropTypes.object.isRequired,
  };

  static defaultProps = {
    selectedUsers: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
      users: [],
      displayMore: false,
    };
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.searchUsers('');
  }

  searchUsers = async (searchString) => {
    if (searchString === '') {
      this.setState({users: [], searchString});
    } else {
      const {blockedByUsers, userID} = this.props;
      const users = await autocompleteSearchUsers(
        searchString,
        userID,
        false,
        blockedByUsers ? Object.keys(blockedByUsers) : false,
      );
      const displayMore = false;
      this.setState({users, searchString, displayMore});
    }
  };

  selectUser = (user) => {
    this.props.onSelect(user);
  };

  userCard = (user) => {
    const {selectedUsers} = this.props;
    return (
      <View style={{marginBottom: 5}}>
        <CardUserSelect
          key={user.objectID}
          user={user}
          selected={selectedUsers[user.objectID] ? true : false}
          onClick={(user) => this.selectUser(user)}
        />
      </View>
    );
  };


  displayMoreButton = () => {
    const {displayMore} = this.state;
    return (
      <ButtonColor
        color={colors.white}
        onPressColor={colors.white}
        click={async () => {
          this.setState({
            displayMore: !displayMore,
          });
        }}
        style={styles.displayMoreButtonStyle}
        view={() => {
          return (
            <Row style={styles.displayMoreRowStyle}>
              <Text style={styles.displayMoreButtonTextStyle}>
                {displayMore ? 'Hide results' : 'More results'}
              </Text>
              <AllIcon
                name={displayMore ? 'chevron-up' : 'chevron-down'}
                size={13}
                color={colors.greyDark}
                type="font"
              />
            </Row>
          );
        }}
      />
    );
  };

  moreResultsView() {
    const {users} = this.state;
    return (
      <KeyboardAwareFlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.results}
        keyExtractor={(item) => {
          return item?.objectID;
        }}
        data={users}
        renderItem={(item) => this.userCard(item.item)}
        ListFooterComponent={() => {
          return this.displayMoreButton();
        }}
      />
    );
  }

  render() {
    const {searchString, users, displayMore} = this.state;
    if (searchString === '') {
      return null;
    } else if (users.length === 0) {
      return (
        <View>
          <Text style={styles.noResultsText}>
            No results for "{searchString}"
          </Text>
        </View>
      );
    } else if (displayMore) {
      return this.moreResultsView();
    } else {
      return (
        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.results}>
          {users.slice(0, 3).map((user) => this.userCard(user))}
          {users.length > 3 && this.displayMoreButton()}
        </KeyboardAwareScrollView>
      );
    }
  }
}

const styles = StyleSheet.create({
  results: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  noResultsText: {
    ...styleApp.textBold,
    marginVertical: 15,
    marginLeft: '7%',
    fontSize: 23,
    marginTop: 45,
  },
  displayMoreButtonTextStyle: {
    ...styleApp.textBold,
    color: colors.greyDark,
    marginRight: 10,
  },
  displayMoreButtonStyle: {
    height: 30,
    paddingHorizontal: 10,
  },
  displayMoreRowStyle: {
    ...styleApp.center,
  },
});

const mapStateToProps = (state) => {
  return {
    blockedByUsers: state.user.infoUser.blockedByUsers,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    currentScreenSize: state.layout.currentScreenSize,
    session: state.coachSessions[state.coach.currentSessionID],
    coachSessionID: state.coach.currentSessionID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(UserSearchResults);
