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

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import Loader from '../../layout/loaders/Loader';
import AllIcons from '../../layout/icons/AllIcons';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ButtonColor from '../../layout/Views/Button';
import AsyncImage from '../../layout/image/AsyncImage';
import {historicSearchAction} from '../../../actions/historicSearchActions';
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
      selectedUsers: {},
      searchInput: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    this.changeSearch('');
  }
  async changeSearch(search) {
    const users = await autocompleteSearchUsers(search, this.props.userID);
    this.setState({users: users, loader: false});
  }
  async next(selectedUsers) {
    if (Object.values(selectedUsers).length === 0) return true;
    await this.setState({loaderHeader: true});
    let users = Object.values(selectedUsers).map((user) => user.objectID);
    users.push(this.props.userID);
    var discussion = await searchDiscussion(users, users.length);

    users = Object.values(selectedUsers).map((user) => {
      user.id = user.objectID;
      return user;
    });
    users = users.concat({
      id: this.props.userID,
      info: this.props.infoUser,
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
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center2}>
                {user.info.picture ? (
                  <AsyncImage
                    style={styles.imgUser}
                    mainImage={user.info.picture}
                    imgInitial={user.info.picture}
                  />
                ) : (
                  <AllIcons
                    name="user-circle"
                    type="font"
                    size={40}
                    color={colors.greyDark}
                  />
                )}
              </Col>
              <Col size={80} style={styleApp.center2}>
                <Text style={styleApp.text}>
                  {user.info.firstname} {user.info.lastname}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                {selectedUsers[user.objectID] ? (
                  <AllIcons
                    name="check-circle"
                    type="font"
                    size={23}
                    color={colors.primary}
                  />
                ) : (
                  <AllIcons
                    name="circle"
                    type="font"
                    size={23}
                    color={colors.greyDark}
                  />
                )}
              </Col>
            </Row>
          );
        }}
        click={() =>
          this.selectUser(selectedUsers[user.objectID], user, selectedUsers)
        }
        color="white"
        style={styles.cardUser}
        onPressColor={colors.off}
      />
    );
  }
  newConversationPage(selectedUsers) {
    return (
      <View style={{marginTop: sizes.heightHeaderHome}}>
        {this.searchInput(selectedUsers)}

        <ScrollView
          keyboardShouldPersistTaps={'always'}
          style={styles.scrollViewUsers}>
          {this.state.loader ? (
            <View style={[styleApp.center, {height: 200}]}>
              <Loader size={35} color={'green'} />
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
      <View style={{backgroundColor: colors.white, height: height}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Add participants'}
          inputRange={[0, 0]}
          initialBorderColorIcon={colors.white}
          initialBorderColorHeader={colors.borderColor}
          initialBorderWidth={0}
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
    borderBottomWidth: 0.3,
    borderColor: colors.borderColor,
    width: width,
    paddingLeft: 20,
    paddingRight: 20,
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
  };
};

export default connect(mapStateToProps, {historicSearchAction})(
  NewConversation,
);
