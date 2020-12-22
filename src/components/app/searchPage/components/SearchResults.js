import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Row} from 'react-native-easy-grid';
import {
  KeyboardAwareScrollView,
  KeyboardAwareFlatList,
} from 'react-native-keyboard-aware-scroll-view';
import {func, object, string} from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';

import {autocompleteSearchUsers} from '../../../functions/users';
import {autoCompleteSearchClubs} from '../../../functions/clubs';
import {store} from '../../../../store/reduxStore';
import {rowTitle} from '../../TeamPage/components/elements';
import AllIcon from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import CardUserSelect from '../../../layout/cards/CardUserSelect';
import CardClub from '../../clubsPage/components/CardClub';

export default class SearchResults extends Component {
  static propTypes = {
    onSelect: func.isRequired,
    searchFor: string.isRequired,
    selectedUsers: object,
    searchText: string,
    defaultList: func,
    defaultHeader: string,
  };

  static defaultProps = {
    selectedUsers: {},
    searchText: '',
  };

  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      displayMore: false,
      noResults: false,
      defaultList: [],
    };
  }

  componentDidMount() {
    this.fetchDefaultList();
    this.searchUsers();
  }

  componentDidUpdate(prevProps) {
    if (this.props.searchText !== prevProps.searchText) {
      this.searchUsers();
    }
  }

  fetchDefaultList = async () => {
    const {defaultList} = this.props;
    if (defaultList) {
      const defaultListResults = await defaultList();
      this.setState({defaultList: defaultListResults});
    }
  };

  searchUsers = async () => {
    const {searchText, searchFor} = this.props;
    this.setState({noResults: false});
    if (searchText === '') {
      this.setState({searchResults: []});
    } else {
      const {blockedByUsers} = store.getState().user.infoUser;
      const {userID} = store.getState().user.userID;

      let searchResults = [];
      console.log(searchFor);
      if (searchFor === 'users') {
        searchResults = (await autocompleteSearchUsers(
          searchText,
          userID,
          false,
          blockedByUsers ? Object.keys(blockedByUsers) : false,
        )).map((user) => {
          return {info: user.info, id: user.objectID};
        });
      } else if (searchFor === 'clubs') {
        searchResults = (await autoCompleteSearchClubs({
          searchText,
        })).map((club) => {
          return {info: club.info, id: club.objectID};
        });
        console.log(searchResults);
      }
      this.setState({
        searchResults,
        displayMore: false,
        noResults: searchResults.length === 0,
      });
    }
  };

  resultCard = (result) => {
    const {selectedUsers, onSelect, searchFor} = this.props;
    return (
      <View key={result.id} style={styles.result}>
        <CardUserSelect
          user={result}
          selected={selectedUsers[result.id] ? true : false}
          onClick={(result) => onSelect(result)}>
          {searchFor === 'clubs' ? (
            <CardClub id={result.id} displayAsRow />
          ) : null}
        </CardUserSelect>
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
                {displayMore ? 'See less' : 'See more'}
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
    const {searchResults} = this.state;
    const {AnimatedHeaderValue} = this.props;
    return (
      <KeyboardAwareFlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.searchResults}
        keyExtractor={(item) => {
          return item?.objectID;
        }}
        data={searchResults}
        renderItem={(item) => this.resultCard(item.item)}
        ListFooterComponent={() => {
          return this.displayMoreButton();
        }}
        AnimatedHeaderValue={AnimatedHeaderValue}
      />
    );
  }

  defaultListView() {
    const {defaultHeader, AnimatedHeaderValue} = this.props;
    const {defaultList} = this.state;
    return Array.isArray(defaultList) && defaultList.length ? (
      <KeyboardAwareFlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.searchResults}
        keyExtractor={(item) => {
          return item?.id;
        }}
        data={defaultList}
        ListHeaderComponent={rowTitle({
          hideDividerHeader: true,
          title: defaultHeader,
          titleColor: colors.greyDarker,
          titleStyle: {
            fontWeight: '800',
            fontSize: 23,
            marginBottom: -10,
          },
          containerStyle: {
            marginTop: 0,
            marginBottom: 10,
            paddingHorizontal: '2.5%',
          },
        })}
        renderItem={(item) => this.resultCard(item.item)}
        AnimatedHeaderValue={AnimatedHeaderValue}
      />
    ) : null;
  }

  render() {
    const {searchResults, displayMore, noResults} = this.state;
    const {searchText, AnimatedHeaderValue} = this.props;
    if (searchText === '') {
      return this.defaultListView();
    } else if (noResults) {
      return (
        <View style={styleApp.fullSize}>
          <Text style={styles.noResultsText}>
            No results for "{searchText}"
          </Text>
        </View>
      );
    } else {
      if (displayMore) {
        return this.moreResultsView();
      } else {
        return (
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.searchResults}
            AnimatedHeaderValue={AnimatedHeaderValue}>
            {searchResults.slice(0, 3).map((user) => this.resultCard(user))}
            {searchResults.length > 3 ? this.displayMoreButton() : null}
          </KeyboardAwareScrollView>
        );
      }
    }
  }
}

const styles = StyleSheet.create({
  searchResults: {
    marginTop: 0,
    marginLeft: 10,
    marginRight: 10,
  },
  result: {marginVertical: 5},
  noResultsText: {
    ...styleApp.textBold,
    marginVertical: 15,
    marginLeft: '7%',
    fontSize: 18,
    marginTop: 15,
    color: colors.greyDark,
  },
  displayMoreButtonTextStyle: {
    ...styleApp.textBold,
    color: colors.greyDark,
    marginRight: 10,
  },
  displayMoreButtonStyle: {
    height: 30,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  displayMoreRowStyle: {
    ...styleApp.center,
  },
});
