import React, {Component} from 'react';
import {Animated, View, Text, TextInput, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightHeaderModal} from '../../../style/sizes';
import {store} from '../../../../store/reduxStore';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import ScrollView from '../../../layout/scrollViews/ScrollView';
import {createClub} from '../../../functions/clubs';
import {userInfoSelector} from '../../../../store/selectors/user';
import Button from '../../../layout/buttons/Button';

class CreateClub extends Component {
  static propTypes = {
    navigation: PropTypes.object,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      // title: props.infoUser.firstname + ' ' + props.infoUser.lastname,
      title: '',
      description: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  createClub = async () => {
    const {navigation} = this.props;
    const {title, description} = this.state;
    await this.setState({loader: true});
    await createClub({title, description});
    navigation.goBack();
  };
  createClubForm = () => {
    const {title, description, loader} = this.state;
    return (
      <View style={[styleApp.marginView, {marginTop: 0}]}>
        <TextInput
          style={styles.textField}
          placeholder="Club name"
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
        <TextInput
          style={[styles.textField, {height: 100, paddingTop: 5}]}
          placeholder="Description"
          multiline={true}
          autoCorrect={true}
          underlineColorAndroid="rgba(0,0,0,0)"
          blurOnSubmit={false}
          returnKeyType={'done'}
          placeholderTextColor={colors.greyDark}
          ref={(input) => {
            this.firstnameInput = input;
          }}
          inputAccessoryViewID={'title'}
          onChangeText={(text) => this.setState({description: text})}
          value={description}
        />

        <Button
          backgroundColor="primary"
          onPressColor={colors.primaryLight}
          enabled={true}
          disabled={title === '' || description === ''}
          text={'Create club'}
          styleButton={{height: 55, marginTop: 30}}
          loader={loader}
          click={this.createClub}
        />
      </View>
    );
  };
  render() {
    const {navigation} = this.props;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          marginTop={10}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Create club'}
          inputRange={[10, 20]}
          initialBorderColorIcon={'transparent'}
          initialBackgroundColor={'transparent'}
          initialTitleOpacity={1}
          initialBorderWidth={1}
          initialBorderColorHeader={'transparent'}
          icon1={'times'}
          clickButton1={navigation.goBack}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.createClubForm}
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

const mapStateToProps = (state) => {
  return {
    infoUser: userInfoSelector(state),
  };
};

export default connect(mapStateToProps)(CreateClub);
