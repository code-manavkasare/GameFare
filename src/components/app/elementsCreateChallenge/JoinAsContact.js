import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
import NavigationService from '../../../../NavigationService';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import ButtonColor from '../../layout/Views/Button';
import Button from '../../layout/buttons/Button';
import Loader from '../../layout/loaders/Loader';
import AsyncImage from '../../layout/image/AsyncImage';
import {listContactUser} from '../../functions/createChallenge';

import ScrollView from '../../layout/scrollViews/ScrollView';
import AllIcons from '../../layout/icons/AllIcons';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import CardUserSelect from '../../layout/cards/CardUserSelect';
import {createDiscussion, searchDiscussion} from '../../functions/message';
import {indexUsers} from '../../database/algolia';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

class PublishResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      loaderDiscussion: false,
      selectedUser: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
  buttonContactOrganizer(challenge) {
    const {organizer} = challenge.info;
    const {loaderDiscussion} = this.state;
    const {userID, infoUser} = this.props;
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col style={styleApp.center}>
                {loaderDiscussion ? (
                  <Loader color="grey" size={20} />
                ) : (
                  <Text style={styleApp.text}>Contact the organizer</Text>
                )}
              </Col>
            </Row>
          );
        }}
        click={async () => {
          await this.setState({loaderDiscussion: true});
          const organizerInfo = await indexUsers.getObject(organizer);
          // return true;
          var discussion = await searchDiscussion([userID, organizer], 2);

          //return false;
          if (!discussion) {
            discussion = await createDiscussion(
              {
                0: {
                  id: organizer,
                  info: organizerInfo.info,
                },
                1: {
                  id: userID,
                  info: infoUser,
                },
              },
              'General',
            );
            if (!discussion) {
              await this.setState({loaderDiscussion: false});
              return NavigationService.navigate('Alert', {
                close: true,
                title: 'An unexpected error has occured.',
                subtitle: 'Please contact us.',
                textButton: 'Got it!',
              });
            }
          }
          await NavigationService.navigate('Conversation', {data: discussion});
          await this.setState({loaderDiscussion: false});
        }}
        color={colors.white}
        style={styleApp.buttonCancel}
        onPressColor={colors.off}
      />
    );
  }
  publishResultContent(challenge) {
    const {selectedUser} = this.state;
    const arrrayContactUser = listContactUser(challenge);
    return (
      <View>
        <View style={styleApp.marginView}>
          <Text style={[styleApp.title, {marginBottom: 15}]}>
            You are joining the challenge as...
          </Text>

          {arrrayContactUser.map((user, i) => (
            <CardUserSelect
              marginOnScrollView={true}
              user={user}
              key={i}
              hideIcon={false}
              selectUser={(val, user, selectedUsers) => {
                this.setState({selectedUser: user});
              }}
              usersSelected={{[selectedUser.id]: selectedUser}}
            />
          ))}

          {this.buttonContactOrganizer(challenge)}
        </View>
      </View>
    );
  }
  async submit(challenge) {
    const {goBack, navigate} = this.props.navigation;
    const {userID, infoUser} = this.props;
    const {objectID} = challenge;
    const {selectedUser} = this.state;
    if (selectedUser.team.captain.id === selectedUser.id)
      return navigate('SummaryChallenge', {
        challenge: challenge,
        subscribe: true,
        selectedUser: selectedUser,
      });

    await this.setState({loader: true});
    await firebase
      .database()
      .ref(
        'challenges/' +
          objectID +
          '/teams/' +
          selectedUser.team.id +
          '/members/' +
          selectedUser.id,
      )
      .remove();
    await firebase
      .database()
      .ref(
        'challenges/' +
          objectID +
          '/teams/' +
          selectedUser.team.id +
          '/members/' +
          userID,
      )
      .update({
        id: userID,
        status: 'confirmed',
        info: infoUser,
      });
    await this.setState({loader: false});
    return goBack();
  }
  conditionOn() {
    if (this.state.winnerID) return false;
    return true;
  }
  textButton() {
    const {selectedUser} = this.state;
    if (!selectedUser) return 'Confirm attendance';
    if (selectedUser.team.captain.id === selectedUser.id) return 'Next';
    return 'Confirm attendance';
  }
  render() {
    const {navigate, goBack} = this.props.navigation;
    const {selectedUser, loader} = this.state;
    const challenge = this.props.navigation.getParam('challenge');
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          icon1="arrow-left"
          initialTitleOpacity={1}
          icon2={null}
          clickButton1={() => goBack()}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.publishResultContent(challenge)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styleApp.footerBooking, styleApp.marginView]}>
          <Button
            text={this.textButton()}
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            disabled={!selectedUser}
            loader={loader}
            click={() => this.submit(challenge)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  placeHolderImage: {
    height: 120,
    backgroundColor: colors.off2,
    borderBottomWidth: 1,
    borderColor: colors.off,
  },
  viewImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 20,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
  };
};

export default connect(mapStateToProps, {})(PublishResult);