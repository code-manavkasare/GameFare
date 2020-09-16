import React, {Component} from 'react';
import {View, Animated, Text, TextInput, Image} from 'react-native';
import {connect} from 'react-redux';
import AllIcon from '../../../../layout/icons/AllIcons';
import ButtonColor from '../../../../layout/Views/Button';
import {Row, Col} from 'react-native-easy-grid';
import styleApp from '../../../../style/style';
import colors from '../../../../style/colors';
import sizes from '../../../../style/sizes';
import {navigate} from '../../../../../../NavigationService';
import {native} from '../../../../animations/animations';
import {autocompleteSearchUsers} from '../../../../functions/users';
import {searchSessionsForString} from '../../../../functions/coach';
import AsyncImage from '../../../../layout/image/AsyncImage';
import CardStreamView from '../../GroupsPage/components/CardStreamView';
import UserSearchResult from './UserSearchResult';
import {
  KeyboardAwareScrollView,
  KeyboardAwareFlatList,
} from 'react-native-keyboard-aware-scroll-view';

class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: '',
      users: [],
      sessions: [],
      displayMore: '',
    };
    this.userRefs = [];
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
    this.search(this.state.input);
  }

  search = async (input) => {
    if (input === '') {
      return this.setState({users: [], input: '', sessions: []});
    }
    const {blockedByUsers, userID, coachSessions} = this.props;
    const ids = searchSessionsForString(input);
    const users = await autocompleteSearchUsers(
      input,
      userID,
      false,
      blockedByUsers ? Object.keys(blockedByUsers) : false,
    );
    const sessions = ids.map((id) => coachSessions[id]).filter((s) => s);
    const displayMore = '';
    this.setState({users, input, sessions, displayMore});
  };

  userCard = (user) => {
    const {invite} = this.props;
    return (
      <UserSearchResult
        key={user.objectID}
        onRef={(ref) => {
          this.userRefs.push(ref);
          return this.userRefs.length - 1;
        }}
        offRef={(index) => {
          delete this.userRefs[index];
        }}
        user={user}
        invite={async (init) => {
          if (invite) {
            return await invite(user, init);
          }
        }}
      />
    );
  };

  resetInvites = () => {
    for (var user in this.userRefs) {
      this.userRefs[user]?.toggleSelected(0);
    }
  };

  groupCard = (group) => {
    return (
      <CardStreamView
        coachSessionID={group.objectID}
        key={group.objectID}
        scale={1}
        minimal
      />
    );
  };

  displayMoreButton = (type) => {
    const buttonStyle = {height: 30, paddingHorizontal: 10};
    const rowStyle = {
      ...styleApp.center,
    };
    const textStyle = {
      ...styleApp.textBold,
      color: colors.greyDark,
      marginRight: 10,
    };
    return (
      <ButtonColor
        color={colors.white}
        onPressColor={colors.white}
        click={async () => {
          this.setState({
            displayMore: type,
          });
        }}
        style={buttonStyle}
        view={() => {
          return (
            <Row style={rowStyle}>
              <Text style={textStyle}>
                {type === '' ? 'Hide results' : 'More results'}
              </Text>
              <AllIcon
                name={type === '' ? 'chevron-up' : 'chevron-down'}
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

  moreResultsView(type) {
    const {users, sessions, displayMore} = this.state;

    const data = displayMore === 'users' ? users : sessions;
    const header = displayMore === 'users' ? 'People' : 'Groups';

    const flatlistStyle = {
      paddingTop: 30,
      paddingBottom: 90,
    };
    const titleStyle = {
      ...styleApp.textBold,
      marginVertical: 15,
      marginLeft: '7%',
      fontSize: 23,
    };
    return (
      <KeyboardAwareFlatList
        contentContainerStyle={flatlistStyle}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => {
          return data.length > 0 ? (
            <Text style={titleStyle}>{header}</Text>
          ) : null;
        }}
        keyExtractor={(item) => {
          return item?.objectID;
        }}
        data={data}
        renderItem={(item) => {
          return displayMore === 'users'
            ? this.userCard(item.item)
            : this.groupCard(item.item);
        }}
        ListFooterComponent={() => {
          return this.displayMoreButton('');
        }}
      />
    );
  }

  render() {
    const {input, users, sessions, displayMore} = this.state;
    const {currentScreenSize} = this.props;
    const {currentHeight} = currentScreenSize;
    const containerStyle = {
      marginTop: 60 + sizes.marginTopApp,
      maxHeight: currentHeight - sizes.marginTopApp - 175,
      flex: 1,
      flexDirection: 'row',
    };
    const scrollviewStyle = {
      paddingTop: 30,
      paddingBottom: 90,
    };
    const titleStyle = {
      ...styleApp.textBold,
      marginVertical: 15,
      marginLeft: '7%',
      fontSize: 23,
    };
    const noResultsText = {
      ...titleStyle,
      marginTop: 45,
    };
    return input === '' ? null : users.length === 0 && sessions.length === 0 ? (
      <View style={containerStyle}>
        <Text style={noResultsText}>No results for "{input}"</Text>
      </View>
    ) : (
      <View style={containerStyle}>
        {displayMore === '' ? (
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={scrollviewStyle}>
            {users.length > 0 && <Text style={titleStyle}>People</Text>}
            {users.slice(0, 3).map(this.userCard)}
            {users.length > 3 && this.displayMoreButton('users')}
            {sessions.length > 0 && <Text style={titleStyle}>Groups</Text>}
            {sessions.slice(0, 3).map(this.groupCard)}
            {sessions.length > 3 && this.displayMoreButton('sessions')}
          </KeyboardAwareScrollView>
        ) : (
          this.moreResultsView()
        )}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    coachSessions: state.coachSessions,
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
)(SearchResults);
