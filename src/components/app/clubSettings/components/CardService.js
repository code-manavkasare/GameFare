import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {bool, string, object} from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {goBack, navigate} from '../../../../../NavigationService';

import {bindService, unbindService} from '../../../database/firebase/bindings';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import {userIDSelector} from '../../../../store/selectors/user';
import {removeService} from '../../../functions/clubs';
import {formatDuration} from '../../../functions/date';
import {serviceSelector} from '../../../../store/selectors/services';
import CardUser from '../../../layout/cards/CardUser';
import ButtonColor from '../../../layout/Views/Button';
import PlaceHolder from '../../../placeHolders/CardService';
import AllIcon from '../../../layout/icons/AllIcons';
import {timeout} from '../../../functions/coach';

class CardService extends Component {
  static propTypes = {
    navigation: object,
    id: string,
    clubID: string,
    book: bool,
    displayOwner: bool,
    disableBookButton: bool,
    disableEdit: bool,
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
  editService = async () => {
    const {service, clubID} = this.props;
    const {id} = service;
    goBack();
    await timeout(300);
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
  removeService = async () => {
    const {service, clubID} = this.props;
    const {id, title} = service;
    goBack();
    await timeout(300);
    navigate('Alert', {
      title: 'Are you sure you want to delete ' + title + '?',
      subtitle: 'This action cannot be undone.',
      textButton: `Delete`,
      colorButton: 'red',
      onPressColor: colors.red,
      onGoBack: async () => removeService({clubID, serviceID: id}),
    });
  };
  showOptions = async () => {
    navigate('Alert', {
      title: 'Service Options',
      displayList: true,
      forceVertical: true,
      listOptions: [
        {
          title: 'Edit Service',
          icon: {
            type: 'font',
            name: 'edit',
            size: 19,
            color: colors.white,
            solid: true,
          },
          operation: this.editService,
          forceNavigation: true,
        },
        {
          title: 'Delete Service',
          icon: {
            type: 'font',
            name: 'trash',
            size: 19,
            color: colors.white,
          },
          operation: this.removeService,
          forceNavigation: true,
          color: colors.red,
        },
      ],
    });
  };
  render() {
    const {
      service,
      userID,
      displayOwner,
      styleContainer,
      disableEdit,
    } = this.props;
    const containerStyle = {
      ...styles.card,
      ...styleContainer,
    };
    if (!service) return <PlaceHolder style={containerStyle} />;
    const {title, price, duration, owner} = service;
    const {unit: unitPrice, value: valuePrice} = price;
    const {unit: unitDuration, value: valueDuration} = duration;
    const isUserOwner = owner === userID;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={!isUserOwner ? this.bookService : () => {}}
        style={containerStyle}>
        {displayOwner && <CardUser id={owner} />}
        <Row>
          <Col size={60} style={styleApp.center2}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              {formatDuration({
                duration: valueDuration,
                inputUnit: unitDuration,
                formatType: 'text',
              })}
            </Text>
          </Col>
          <Row size={40} style={styles.buttonRow}>
            <ButtonColor
              view={() => {
                return (
                  <Text style={styles.textPrice}>
                    {unitPrice}
                    {valuePrice}
                  </Text>
                );
              }}
              click={!isUserOwner ? this.bookService : () => {}}
              color={colors.greyDarker}
              style={styles.price}
              onPressColor={!isUserOwner ? colors.greyDark : colors.greyDarker}
            />
            {!disableEdit ? (
              <ButtonColor
                view={() => {
                  return (
                    <AllIcon
                      name={'ellipsis-h'}
                      size={15}
                      color={colors.greyDarker}
                      type="font"
                      solid
                    />
                  );
                }}
                click={this.showOptions}
                color={colors.off2}
                style={styles.button}
                onPressColor={colors.off}
              />
            ) : null}
          </Row>
        </Row>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: '5%',
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: colors.greyLight,
    ...styleApp.shadowWeak,
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
    marginTop: 5,
  },
  textPrice: {
    ...styleApp.textBold,
    color: colors.white,
    fontSize: 14,
  },
  price: {
    height: 35,
    paddingHorizontal: 12,
    backgroundColor: colors.off2,
    borderRadius: 15,
    ...styleApp.center,
    ...styleApp.shadowWeak,
  },
  buttonRow: {justifyContent: 'flex-end', alignItems: 'center'},
  button: {
    marginLeft: 15,
    height: 35,
    width: 35,
    borderRadius: 20,
    ...styleApp.shadowWeak,
  },
});

const mapStateToProps = (state, props) => {
  return {
    service: serviceSelector(state, props) ?? props.service,
    userID: userIDSelector(state),
  };
};

export default connect(mapStateToProps)(CardService);
