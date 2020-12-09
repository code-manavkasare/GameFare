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
import {formatDuration} from '../../../functions/date';
import {serviceSelector} from '../../../../store/selectors/services';
import CardUser from '../../../layout/cards/CardUser';
import ButtonColor from '../../../layout/Views/Button';

class CardService extends Component {
  static propTypes = {
    navigation: object,
    id: string,
    clubID: string,
    book: bool,
    displayOwner: bool,
    disableBookButton: bool,
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
  bookService = () => {
    const {service, clubID, disableBookButton} = this.props;
    if (disableBookButton) return;
    const {id} = service;
    navigate('Club', {
      screen: 'BookingSummary',
      params: {clubID, serviceID: id},
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
    const {service, userID, displayOwner} = this.props;

    if (!service) return <View />;
    const {title, price, duration, owner} = service;
    const {unit: unitPrice, value: valuePrice} = price;
    const {unit: unitDuration, value: valueDuration} = duration;
    const isUserOwner = owner === userID;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => true}
        style={styles.card}>
        {displayOwner && <CardUser id={owner} />}
        <Row>
          <Col size={80}>
            <Text style={styles.title}>
              {title}{' '}
              {isUserOwner ? (
                <Text
                  style={[styleApp.smallText, {fontWeight: 'normal'}]}
                  onPress={this.editService}>
                  Edit
                </Text>
              ) : null}{' '}
              {isUserOwner ? (
                <Text
                  style={[styleApp.smallText, {fontWeight: 'normal'}]}
                  onPress={this.removeService}>
                  Delete
                </Text>
              ) : null}
            </Text>
            <Text style={styles.subtitle}>
              {formatDuration({
                duration: valueDuration,
                inputUnit: unitDuration,
                formatType: 'text',
              })}
            </Text>
          </Col>
          <Col size={20} style={styleApp.center3}>
            <ButtonColor
              view={() => {
                return (
                  <Text style={styles.textPrice}>
                    {unitPrice}
                    {valuePrice}
                  </Text>
                );
              }}
              click={this.bookService}
              color={colors.off2}
              style={styles.price}
              onPressColor={colors.off}
            />
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
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
  textPrice: {
    ...styleApp.textBold,
    color: colors.title,
    fontSize: 13,
    marginTop: 4,
  },
  price: {
    height: 35,
    width: 55,
    backgroundColor: colors.off2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.grey,
    ...styleApp.center,
  },
});

const mapStateToProps = (state, props) => {
  return {
    service: serviceSelector(state, props),
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(CardService);
