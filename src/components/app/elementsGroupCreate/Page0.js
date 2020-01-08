import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import {connect} from 'react-redux';
import {createGroupAction} from '../../../actions/createGroupActions';
import {groupsAction} from '../../../actions/groupsActions';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';

import Button from '../../layout/buttons/Button';
import ButtonColor from '../../layout/Views/Button';
import ButtonAddImage from '../../layout/buttons/ButtonAddImage';

import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ScrollView from '../../layout/scrollViews/ScrollView';
import ExpandableCard from '../../layout/cards/ExpandableCard';
import Switch from '../../layout/switch/Switch';
import TextField from '../../layout/textField/TextField';
import AllIcons from '../../layout/icons/AllIcons';
import Communications from 'react-native-communications';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

import {createGroup} from '../../functions/createGroup';

class Page0 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    console.log('page 1 mount');
    console.log(this.props.createGroupData);
    if (this.props.createGroupData.info.sport === '') {
      console.log('set balue');
      this.props.createGroupAction('setInfoCreateGroup', {
        sport: this.props.sportSelected,
      });
    }
  }
  sports() {
    console.log('this.props.createGroupData.info.sport');
    console.log(this.props.createGroupData.info.sport);
    console.log(this.props.sports);

    // return null

    return (
      <ExpandableCard
        valueSelected={this.props.createGroupData.info.sport}
        image={true}
        list={this.props.sports}
        tickFilter={(value) => {
          console.log('ou pas val');
          console.log(value);
          this.props.createGroupAction('setInfoCreateGroup', {
            sport: value.value,
          });
        }}
      />
    );
  }
  sendMessage() {
    var email1 = 'contact@getgamefare.com';
    var subject = '';
    Communications.email([email1], null, null, subject, '');
    this.props.navigation.navigate('CreateEvent0');
  }
  async setAccess(state, val) {
    await this.props.createGroupAction('setInfoCreateGroup', {[state]: val});
    return true;
  }
  switch(textOn, textOff, state, translateXComponent0, translateXComponent1) {
    return (
      <Switch
        textOn={textOn}
        textOff={textOff}
        translateXTo={width / 2 - 20}
        height={50}
        translateXComponent0={translateXComponent0}
        translateXComponent1={translateXComponent1}
        state={this.props.createGroupData.info[state]}
        setState={(val) => this.setAccess(state, val)}
      />
    );
  }
  tournamentName() {
    return (
      <TextInput
        style={styleApp.input}
        placeholder="Add name"
        returnKeyType={'done'}
        ref={(input) => {
          this.nameInput = input;
        }}
        underlineColorAndroid="rgba(0,0,0,0)"
        autoCorrect={true}
        onChangeText={(text) =>
          this.props.createGroupAction('setInfoCreateGroup', {name: text})
        }
        value={this.props.createGroupData.info.name}
      />
    );
  }
  description() {
    return (
      <TextInput
        style={styleApp.input}
        placeholder="Add description"
        returnKeyType={'done'}
        ref={(input) => {
          this.descriptionInput = input;
        }}
        underlineColorAndroid="rgba(0,0,0,0)"
        autoCorrect={true}
        multiline={true}
        blurOnSubmit={true}
        onChangeText={(text) =>
          this.props.createGroupAction('setInfoCreateGroup', {
            description: text,
          })
        }
        value={this.props.createGroupData.info.description}
      />
    );
  }
  async setLocation(data) {
    await this.props.createGroupAction('setLocationCreateGroup', data);
    this.props.navigation.navigate('CreateGroup0');
  }
  button(icon, component, click, img) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={[styleApp.center2, {paddingLeft: 0}]}>
                {img ? (
                  <AsyncImage
                    style={{height: '100%', width: '100%', borderRadius: 20}}
                    mainImage={icon}
                    imgInitial={icon}
                  />
                ) : (
                  <AllIcons
                    name={icon}
                    size={18}
                    color={colors.grey}
                    type="font"
                  />
                )}
              </Col>
              <Col size={70} style={[styleApp.center2, {paddingLeft: 0}]}>
                {component}
              </Col>
              <Col size={15} style={[styleApp.center3, {paddingLeft: 0}]}>
                <AllIcons
                  name={'arrow-right'}
                  size={14}
                  color={colors.title}
                  type="font"
                />
              </Col>
            </Row>
          );
        }}
        click={() => click()}
        color={'white'}
        style={[
          {
            height: 50,
            width: width,
            paddingLeft: 20,
            paddingRight: 20,
            marginLeft: -20,
          },
        ]}
        onPressColor={colors.off}
      />
    );
  }
  textPrivate() {
    if (this.props.createGroupData.info.public)
      return 'New players can only join with an invite from existing members.';
    return 'Anyone will be able to join your group.';
  }
  async setImg(img) {
    await this.props.createGroupAction('setImgCreateGroup', img);
    return true;
  }
  page0() {
    return (
      <View style={{marginTop: 0, marginLeft: 0, width: width}}>
        <ButtonAddImage
          setState={(val) => this.setImg(val)}
          img={this.props.createGroupData.img}
        />

        <View style={{marginBottom: 10}}>{this.sports()}</View>

        <View style={[styleApp.marginView, {marginTop: 0, marginBottom: 10}]}>
          {this.switch('Open access', 'Invite only', 'public')}
          <Text style={[styleApp.text, {marginTop: 20, fontSize: 13}]}>
            {this.textPrivate()}
          </Text>
          <View style={{height: 20}} />

          {this.button(
            'map-marker-alt',
            <Text
              style={
                this.props.createGroupData.location.address == ''
                  ? styleApp.inputOff
                  : styleApp.input
              }>
              {this.props.createGroupData.location.address == ''
                ? 'Add group area'
                : this.props.createGroupData.location.address}
            </Text>,
            () =>
              this.props.navigation.navigate('Location', {
                pageFrom: 'CreateGroup0',
                onGoBack: (data) => this.setLocation(data),
              }),
            false,
          )}
          {this.button('ribbon', this.tournamentName(), () =>
            this.nameInput.focus(),
          )}
          {this.button('info-circle', this.description(), () =>
            this.descriptionInput.focus(),
          )}
        </View>
      </View>
    );
  }
  conditionOn() {
    if (
      this.props.createGroupData.info.name == '' ||
      this.props.createGroupData.info.description == '' ||
      this.props.createGroupData.img == '' ||
      this.props.createGroupData.location.address == ''
    )
      return false;
    return true;
  }
  async submit(data) {
    await this.setState({loader: true});
    var group = await createGroup(
      this.props.createGroupData,
      this.props.userID,
      this.props.infoUser,
    );
    console.log('submitt group');
    console.log(this.props.infoUser);
    console.log(this.props.userID);
    // var group = false
    if (!group) {
      await this.setState({loader: false});
      return this.props.navigation.navigate('Alert', {
        title: 'An error has occured',
        subtitle: 'Please check your connection.',
        textButton: 'Got it!',
        close: true,
      });
    }
    console.log('groupCreation done');
    console.log(group);
    var newGroups = this.props.mygroups.slice(0).reverse();
    newGroups.push(group.objectID);
    newGroups = newGroups.reverse();
    console.log(newGroups);
    await this.props.groupsAction('setAllGroups', {[group.objectID]: group});
    await this.props.groupsAction('setMygroups', newGroups);
    var that = this;
    return setTimeout(async function() {
      await that.props.navigation.dismiss();
      return that.props.createGroupAction('reset');
    }, 700);

    // return this.props.navigation.navigate('Group', {
    //   objectID: group.objectID,
    //   pageFrom: 'ListGroups',
    // });
  }
  render() {
    if (this.props.createGroupData.info.sport == '') return null;
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Create your group'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => this.props.navigation.dismiss()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.page0.bind(this)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={150}
          showsVerticalScrollIndicator={false}
        />
        <View style={styleApp.footerBooking}>
          <View style={styleApp.marginView}>
            {!this.props.userConnected ? (
              <Button
                icon={'next'}
                text="Sign in to proceed"
                backgroundColor={'green'}
                onPressColor={colors.greenLight}
                enabled={true}
                loader={false}
                click={() =>
                  this.props.navigation.navigate('SignIn', {
                    pageFrom: 'CreateGroup0',
                  })
                }
              />
            ) : this.conditionOn() ? (
              <Button
                icon={'next'}
                text="Create group"
                backgroundColor={'green'}
                onPressColor={colors.greenLight}
                enabled={this.conditionOn()}
                loader={this.state.loader}
                click={() => this.submit()}
              />
            ) : (
              <Button
                icon={'next'}
                text="Create group"
                backgroundColor={'green'}
                styleButton={{borderWidth: 1, borderColor: colors.grey}}
                disabled={true}
                onPressColor={colors.greenLight}
                loader={false}
              />
            )}
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    sportSelected: state.historicSearch.sport,
    infoUser: state.user.infoUser.userInfo,
    userConnected: state.user.userConnected,
    createGroupData: state.createGroup,
    mygroups: state.groups.mygroups,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {createGroupAction, groupsAction})(
  Page0,
);
