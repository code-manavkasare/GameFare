import React from 'react';
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import PropTypes from 'prop-types';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import Loader from '../../layout/loaders/Loader';
import AllIcons from '../../layout/icons/AllIcons';

import ButtonColor from '../../layout/Views/Button';
import AsyncImage from '../../layout/image/AsyncImage';
import CardUserSelect from '../../layout/cards/CardUserSelect';

const {height, width} = Dimensions.get('screen');

export default class UsersSelectableList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: {},
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  reset() {
    this.setState({selectedUsers: {}});
  }
  selectUser = async (select, user, selectedUsers) => {
    if (!select)
      selectedUsers = {
        ...selectedUsers,
        [user.objectID]: user,
      };
    else delete selectedUsers[user.objectID];
    await this.setState({selectedUsers: selectedUsers});
    this.props.getSelectedUsers(this.state.selectedUsers);
  };
  render() {
    let {selectedUsers} = this.state;
    const {usersList, loader} = this.props;
    return (
      <View style={{backgroundColor: colors.white}}>
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          style={styles.scrollViewUsers}>
          {loader ? (
            <View style={[styleApp.center, {height: 200}]}>
              <Loader size={35} color={'green'} />
            </View>
          ) : (
            usersList.map((user, i) => (
              <CardUserSelect
                user={user}
                key={i}
                selectUser={this.selectUser.bind(this)}
                selectedUsers={selectedUsers}
              />
            ))
          )}

          <View style={{height: 350}} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewUsers: {
    paddingTop: 10,
    //minHeight: height,
  },
});

UsersSelectableList.PropTypes = {
  usersList: PropTypes.array.isRequired,
  loader: PropTypes.bool.isRequired,
  getSelectedUsers: PropTypes.func,
};
