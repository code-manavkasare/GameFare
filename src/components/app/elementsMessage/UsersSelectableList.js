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

const {height, width} = Dimensions.get('screen');

export default class UsersSelectableList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: {},
    };
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
            usersList.map((user, i) => this.cardUser(user, i, selectedUsers))
          )}
          <View style={{height: 300}} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollViewUsers: {
    paddingTop: 10,
    minHeight: height,
  },
  cardUser: {
    height: 55,
    paddingLeft: 20,
    paddingRight: 20,
  },
  imgUser: {width: 40, height: 40, borderRadius: 20},
});

UsersSelectableList.PropTypes = {
  usersList: PropTypes.array.isRequired,
  loader: PropTypes.bool.isRequired,
  getSelectedUsers: PropTypes.func,
};
