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

import {autocompleteSearchUsers, userObject} from '../../../functions/users';

import AllIcon from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import CardUserSelect from '../../../layout/cards/CardUserSelect';

class UserSearchResults extends Component {
  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    selectedUsers: PropTypes.object,
    searchText: PropTypes.string,
  };

  static defaultProps = {
    selectedUsers: {},
    searchText: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      displayMore: false,
      noResults: false,
    };
  }

  componentDidMount() {
    this.searchUsers();
  }

  componentDidUpdate(prevProps) {
    if (this.props.searchText !== prevProps.searchText) {
      this.searchUsers();
    }
  }

  searchUsers = async () => {
    const {searchText} = this.props;
    this.setState({noResults: false});
    if (searchText === '') {
      this.setState({users: []});
    } else {
      const {blockedByUsers, userID} = this.props;
      const rawUsers = await autocompleteSearchUsers(
        searchText,
        userID,
        false,
        blockedByUsers ? Object.keys(blockedByUsers) : false,
      );
      const users = rawUsers.map((user) =>
        userObject(user.info, user.objectID),
      );
      this.setState({users, displayMore: false, noResults: users.length === 0});
    }
  };

  userCard = (user) => {
    const {selectedUsers, onSelect} = this.props;
    return (
      <View key={user.id} style={{marginBottom: 5}}>
        <CardUserSelect
          user={user}
          selected={selectedUsers[user.id] ? true : false}
          onClick={(user) => onSelect(user)}
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
    const {AnimatedHeaderValue} = this.props;
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
        AnimatedHeaderValue={AnimatedHeaderValue}
      />
    );
  }

  render() {
    const {users, displayMore, noResults} = this.state;
    const {searchText, AnimatedHeaderValue} = this.props;
    if (searchText === '') {
      return null;
    } else if (noResults) {
      return (
        <View>
          <Text style={styles.noResultsText}>
            No results for "{searchText}"
          </Text>
        </View>
      );
    } else if (users.length > 0) {
      if (displayMore) {
        return this.moreResultsView();
      } else {
        return (
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.results}
            AnimatedHeaderValue={AnimatedHeaderValue}>
            {users.slice(0, 3).map((user) => this.userCard(user))}
            {users.length > 3 && this.displayMoreButton()}
          </KeyboardAwareScrollView>
        );
      }
    } else {
      return null;
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
