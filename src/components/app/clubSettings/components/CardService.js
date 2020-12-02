import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {bool, string, object} from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {navigate} from '../../../../../NavigationService';

import {bindService, unbindService} from '../../../database/firebase/bindings';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userIDSelector} from '../../../../store/selectors/user';
import {removeService} from '../../../functions/clubs';
import AllIcon from '../../../layout/icons/AllIcons';
import {serviceSelector} from '../../../../store/selectors/services';

class CardService extends Component {
  static propTypes = {
    navigation: object,
    id: string,
    clubID: string,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount = () => {
    const {id} = this.props;
    id && bindService(id);
  };
  componentWillUnmount = () => {
    const {id} = this.props;
    id && unbindService(id);
  };
  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardService',
    });
  }
  editService = () => {
    const {service, clubID} = this.props;
    const {id} = service;
    navigate('Club', {
      screen: 'CreateService',
      params: {id: clubID, serviceID: id, edit: true},
    });
  };
  removeService = () => {
    const {service, clubID} = this.props;
    const {id, title} = service;
    navigate('Alert', {
      title: 'Are you sure you want to delete ' + title + '?',
      subtitle: 'This action cannot be undone.',
      textButton: `Delete`,
      colorButton: 'red',
      onPressColor: colors.red,
      onGoBack: async () => removeService({clubID, serviceID: id}),
    });
  };
  render() {
    const {service, userID, clubID} = this.props;

    if (!service) return <View />;
    const {title, price, duration, owner, id} = service;
    const {unit: unitPrice, value: valuePrice} = price;
    const {unit: unitDuration, value: valueDuration} = duration;
    const isUserOwner = owner === userID;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => true}
        style={styles.card}>
        <Row>
          <Col size={60}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {unitPrice}
              {valuePrice} • {valueDuration}
              {unitDuration}
            </Text>
          </Col>
          <Col size={20} style={styleApp.center3}>
            {isUserOwner ? (
              <Text style={styleApp.smallText} onPress={this.editService}>
                Edit
              </Text>
            ) : null}
          </Col>
          <Col size={20} style={styleApp.center3}>
            {isUserOwner ? (
              <Text style={styleApp.smallText} onPress={this.removeService}>
                Delete
              </Text>
            ) : null}
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    height: 55,
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: colors.off,
  },
  title: {
    ...styleApp.textBold,
    fontSize: 17,
    color: colors.title,
  },
  subtitle: {
    ...styleApp.textBold,
    color: colors.title,
    fontSize: 11,
    marginTop: 4,
  },
});

const mapStateToProps = (state, props) => {
  return {
    service: serviceSelector(state, props),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(CardService);
