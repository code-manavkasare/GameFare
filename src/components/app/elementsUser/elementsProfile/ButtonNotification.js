import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row, Grid} from 'react-native-easy-grid';

import {navigate} from '../../../../../NavigationService';
import {permission} from '../../../functions/pictures';

import AllIcons from '../../../layout/icons/AllIcons';
import styleApp from '../../../style/style';
import ButtonColor from '../../../layout/Views/Button';
import colors from '../../../style/colors';

class CardTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      permission: false,
    };
  }
  async componentDidMount() {
    const permissionNotification = await permission('notification');
    console.log('permissionNotification', permissionNotification);
    this.setState({permission: permissionNotification});
  }

  render() {
    const {loader, permission} = this.state;
    const {displayBeforeLoader} = this.props;
    if (!displayBeforeLoader && (!loader || permission)) return null;

    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={10} style={styleApp.center2}>
                <AllIcons
                  name={permission ? 'bell' : 'bell-slash'}
                  color={permission ? colors.greenConfirm : colors.red}
                  size={20}
                  type="font"
                />
              </Col>
              <Col size={80} style={styleApp.center2}>
                <Text style={[styleApp.titleSmall, {fontSize: 16}]}>
                  Notifications
                </Text>
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  name="keyboard-arrow-right"
                  color={colors.grey}
                  size={20}
                  type="mat"
                />
              </Col>
            </Row>
          );
        }}
        click={() => navigate('NotificationPage', {permission: permission})}
        color="white"
        style={styles.button}
        onPressColor={colors.off}
      />
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 55,
    marginLeft: 0,
    width: '100%',
    paddingLeft: '5%',
    paddingRight: '5%',
    borderColor: colors.borderColor,
    backgroundColor: 'white',
    borderBottomWidth: 0,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(
  mapStateToProps,
  {},
)(CardTransfer);
