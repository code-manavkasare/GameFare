import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {shape, func, string, object} from 'prop-types';
import {Row, Col} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {boolShouldComponentUpdate} from '../../../functions/redux';
import Button from '../../../layout/buttons/Button';
import CardUser from '../../../layout/cards/CardUser';
import {capitalize} from '../../../functions/coach';
import AllIcon from '../../../layout/icons/AllIcons';

export default class CardInvitation extends Component {
  static propTypes = {
    user: shape({
      userID: string.isRequired,
      prefix: string,
      suffix: string,
    }),
    title: string,
    description: string,
    invitationStatus: shape({
      value: string.isRequired,
      icon: object.isRequired,
      backgroundColor: string,
    }),
    buttonNo: shape({
      text: string,
      action: func.isRequired,
    }),
    buttonYes: shape({
      text: string,
      action: func.isRequired,
    }),
  };
  static defaultProps = {};

  shouldComponentUpdate(nextProps, nextState) {
    return boolShouldComponentUpdate({
      props: this.props,
      nextProps,
      state: this.state,
      nextState,
      component: 'CardInvitation',
    });
  }
  statusIndicator() {
    const {invitationStatus} = this.props;
    if (!invitationStatus) return;
    const {value} = invitationStatus;
    const icon = invitationStatus.icon;
    const backgroundColor = invitationStatus.backgroundColor;
    return (
      <View style={{...styles.statusIndicator, backgroundColor}}>
        <AllIcon
          type={icon.type}
          color={colors.white}
          size={icon.size}
          name={icon.name}
          solid={icon.solid}
        />
        <Text style={styles.statusText}>{capitalize(value.toString())}</Text>
      </View>
    );
  }
  cardUser() {
    const {user} = this.props;
    return (
      <View style={styles.userContainer}>
        <CardUser
          id={user.userID}
          style={styles.cardUser}
          styleText={styles.userText}
          styleImg={styles.userImg}
          prefix={user.prefix}
          suffix={user.suffix}
        />
      </View>
    );
  }
  title() {
    const {title} = this.props;
    if (!title) return;
    return <Text style={styles.title}>{title}</Text>;
  }
  description() {
    const {description} = this.props;
    if (!description) return;
    return <Text style={styles.subtitle}>{description}</Text>;
  }
  noButton = () => {
    const {buttonNo} = this.props;
    if (!buttonNo) return;
    return (
      <Button
        textButton={{fontSize: 16}}
        backgroundColor="red"
        onPressColor={colors.redLight}
        text={buttonNo.text ?? 'Decline'}
        styleButton={styles.button}
        click={buttonNo.action}
      />
    );
  };
  yesButton = () => {
    const {buttonYes} = this.props;
    if (!buttonYes) return;
    return (
      <Button
        textButton={{fontSize: 16}}
        backgroundColor="green"
        onPressColor={colors.greenLight}
        text={buttonYes.text ?? 'Accept'}
        styleButton={styles.button}
        click={buttonYes.action}
      />
    );
  };
  rowButtons() {
    const {buttonYes, buttonNo} = this.props;
    if (!buttonYes && !buttonNo) return;
    return (
      <Row style={styles.inviteRowButtons}>
        <Col size={45}>{this.noButton()}</Col>
        <Col size={5} />
        <Col size={45}>{this.yesButton()}</Col>
      </Row>
    );
  }
  children() {
    const {children} = this.props;
    if (!children) return;
    return <View style={styles.childrenView}>{children}</View>;
  }
  render() {
    const {onPress, style} = this.props;
    const containerStyle = {
      ...styleApp.cardInvitation,
      ...style,
    };
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={containerStyle}>
        {this.cardUser()}
        {this.title()}
        {this.description()}
        {this.children()}
        {this.rowButtons()}
        {this.statusIndicator()}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    ...styleApp.textBold,
    textAlign: 'left',
    fontSize: 19,
    color: colors.greyDarker,
    marginHorizontal: '5%',
  },
  subtitle: {
    ...styleApp.textBold,
    fontSize: 13,
    textAlign: 'left',
    color: colors.greyDarker,
    opacity: 0.8,
    marginTop: 2,
    marginHorizontal: '5%',
  },
  userContainer: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  userImg: {height: 30, width: 30},
  userText: {
    ...styleApp.textBold,
    fontSize: 15,
    marginLeft: -15,
    color: colors.greyDarker,
    opacity: 0.6,
  },
  cardUser: {width: '100%', marginHorizontal: '5%', height: 50},
  inviteRowButtons: {
    marginTop: 10,
    ...styleApp.center,
    marginHorizontal: '5%',
    marginBottom: 5,
  },
  button: {height: 40},
  childrenView: {
    ...styleApp.marginView,
    height: 50,
    width: '100%',
  },
  statusIndicator: {
    ...styleApp.center,
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 10,
    position: 'absolute',
    top: -12.5,
    right: -10,
    height: 25,
    borderRadius: 15,
  },
  statusText: {
    ...styleApp.textBold,
    fontSize: 14,
    color: colors.white,
    marginLeft: 8,
  },
});
