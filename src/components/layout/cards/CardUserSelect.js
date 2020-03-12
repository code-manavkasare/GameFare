import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {Col, Row} from 'react-native-easy-grid';
import ButtonColor from '../Views/Button';
import colors from '../../style/colors';
import AllIcons from '../../layout/icons/AllIcons';
import AsyncImage from '../image/AsyncImage';
import styleApp from '../../style/style';

export default class CardUserSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  cardUser(user, selectedUsers) {
    return (
      <ButtonColor
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
                  <View style={[styleApp.center, styles.imgUser]}>
                    <Text style={[styleApp.text, {fontSize: 12}]}>
                      {user.info.firstname[0] + user.info.lastname[0]}
                    </Text>
                  </View>
                )}
              </Col>
              <Col size={75} style={styleApp.center2}>
                <Text style={styleApp.text}>
                  {user.info.firstname} {user.info.lastname}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                {!selectedUsers ? null : selectedUsers[user.objectID] ? (
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
          selectedUsers
            ? this.props.selectUser(
                selectedUsers[user.objectID],
                user,
                selectedUsers,
              )
            : null
        }
        color="white"
        style={styles.cardUser}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    const {user, selectedUsers} = this.props;
    return this.cardUser(user, selectedUsers);
  }
}

const styles = StyleSheet.create({
  cardUser: {
    height: 55,
    paddingLeft: 20,
    paddingRight: 20,
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
});
