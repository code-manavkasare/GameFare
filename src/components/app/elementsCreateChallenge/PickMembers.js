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
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
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
  next(selectedUsers) {
    if (Object.values(selectedUsers).length === 0) return true;
    return this.props.navigation.navigate('PickInfos');
  }
  selectUser(select, user, selectedUsers) {
    if (!select)
      selectedUsers = {
        [user.objectID]: {...user, id: user.objectID},
      };
    else delete selectedUsers[user.objectID];
    this.props.createChallengeAction('setCaptains', selectedUsers);
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
        selectedUsers={selectedUsers}
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
    let {captains} = this.props;
    const numberUsersSelected = Object.keys(captains).length;
    let addonTextHeader = '';
    if (numberUsersSelected !== 0)
      addonTextHeader = ' (' + numberUsersSelected + ')';
    return (
      <View style={{backgroundColor: colors.white, height: height}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Add participant'}
          inputRange={[0, 0]}
          initialBorderColorIcon={colors.white}
          initialBorderColorHeader={colors.borderColor}
          initialBorderWidth={0}
          initialBackgroundColor={'white'}
          typeIcon2={'font'}
          sizeIcon2={17}
          text2Off={numberUsersSelected === 0}
          initialTitleOpacity={1}
          icon1={'arrow-left'}
          icon2={'text'}
          text2={'Next'}
          clickButton1={() => dismiss()}
          clickButton2={() => this.next(captains)}
          loader={this.state.loaderHeader}
        />

        {this.newConversationPage(captains)}
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
