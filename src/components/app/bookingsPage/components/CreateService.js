import React, {Component} from 'react';
import {Animated, View, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightHeaderModal} from '../../../style/sizes';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import {createService, editService} from '../../../functions/clubs';
import {userInfoSelector} from '../../../../store/selectors/user';
import Button from '../../../layout/buttons/Button';
import RowPlusMinus from '../../../layout/rows/RowPlusMinus';
import {serviceSelector} from '../../../../store/selectors/services';
import {formatDuration} from '../../../functions/date';

class CreateService extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const {service} = props;
    const {edit} = props.route.params;
    this.state = {
      loader: false,
      title: edit ? service.title : '',
      price: {
        increment: {
          min: 0,
          max: 200,
          step: 5,
        },
        value: edit ? service.price.value : 20,
        unit: '$',
      },
      duration: {
        increment: {
          min: 0,
          max: 2,
          step: 0.25,
        },
        value: edit ? service.duration.value : 1,
        unit: 'hour',
      },
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  createService = async () => {
    const {navigation, route} = this.props;
    const {id, serviceID, edit} = route.params;
    const {title, price, duration} = this.state;
    await this.setState({loader: true});
    if (edit)
      await editService({title, price, duration, clubID: id, serviceID});
    else await createService({title, price, duration, clubID: id});
    navigation.goBack();
  };
  createServiceForm = () => {
    const {title, price, duration} = this.state;
    return (
      <View style={[styleApp.marginView, {marginTop: 15}]}>
        <TextInput
          style={styleApp.textField}
          placeholder="Service name"
          autoFocus={true}
          autoCorrect={true}
          underlineColorAndroid="rgba(0,0,0,0)"
          blurOnSubmit={false}
          returnKeyType={'done'}
          placeholderTextColor={colors.greyDark}
          ref={(input) => {
            this.firstnameInput = input;
          }}
          inputAccessoryViewID={'title'}
          onChangeText={(text) => this.setState({title: text})}
          value={title}
        />

        <RowPlusMinus
          title={'Price'}
          add={(value) => this.setState({price: {...price, value}})}
          value={price.value}
          increment={price.increment}
          textValue={`$${price.value}`}
        />

        <RowPlusMinus
          title={'Duration'}
          add={(value) => this.setState({duration: {...duration, value}})}
          value={duration.value}
          increment={duration.increment}
          textValue={formatDuration({
            duration: duration.value,
            inputUnit: 'hour',
            formatType: 'text',
          })}
        />
        {this.confirmButton()}
      </View>
    );
  };
  confirmButton = () => {
    const {route} = this.props;
    const {edit} = route.params;
    const {title, loader} = this.state;
    return (
      <View style={{marginTop: 30}}>
        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          enabled={true}
          disabled={title === ''}
          text={edit ? 'Save' : 'Add Service'}
          styleButton={{height: 55}}
          loader={loader}
          click={this.createService}
        />
      </View>
    );
  };
  render() {
    const {navigation, route} = this.props;
    const {edit} = route.params;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={edit ? 'Edit Service' : 'Create Service'}
          inputRange={[10, 20]}
          sizeIcon1={17}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'chevron-left'}
          clickButton1={navigation.goBack}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.createServiceForm}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={heightHeaderModal}
          offsetBottom={0}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textField: {
    ...styleApp.inputBox,
    ...styleApp.input,
  },
});

const mapStateToProps = (state, props) => {
  const {route} = props;
  const {serviceID} = route.params;
  return {
    infoUser: userInfoSelector(state),
    service: serviceSelector(state, {id: serviceID}),
  };
};

export default connect(mapStateToProps)(CreateService);
