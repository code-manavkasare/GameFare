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

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import ButtonColor from '../../layout/Views/Button';
import Button from '../../layout/buttons/Button';
import AsyncImage from '../../layout/image/AsyncImage';

import ScrollView from '../../layout/scrollViews/ScrollView';
import AllIcons from '../../layout/icons/AllIcons';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

class PublishResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: false,
      winnerID: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
  rowTeam(team, i, winnerID) {
    const {captain} = team;
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              <Col size={20} style={styleApp.center2}>
                <AsyncImage
                  style={{height: 35, width: 35, borderRadius: 20}}
                  mainImage={captain.info.picture}
                  imgInitial={captain.info.picture}
                />
              </Col>
              <Col size={60} style={styleApp.center2}>
                <Text style={styleApp.text}>
                  {captain.info.firstname} {captain.info.lastname}
                </Text>
              </Col>
              <Col size={20} style={styleApp.center3}>
                <AllIcons
                  name={winnerID === team.id ? 'check-circle' : 'circle'}
                  color={winnerID === team.id ? colors.green : colors.greyDark}
                  size={23}
                  type="font"
                />
              </Col>
            </Row>
          );
        }}
        click={() => this.setState({winnerID: team.id})}
        color="white"
        style={{
          flex: 1,
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 20,
          paddingRight: 20,
        }}
        onPressColor={colors.off}
      />
    );
  }
  publishResultContent(challenge) {
    const {teams} = challenge;
    const {winnerID} = this.state;
    return (
      <View>
        <View style={styleApp.marginView}>
          <Text style={[styleApp.title, {marginBottom: 15}]}>
            Who won the challenge?
          </Text>
        </View>

        {Object.values(teams).map((team, i) => this.rowTeam(team, i, winnerID))}
      </View>
    );
  }
  async submitResult(challenge) {
    const {goBack} = this.props.navigation;
    const {userID, infoUser} = this.props;
    const {objectID} = challenge;
    const {winnerID} = this.state;
    await this.setState({loader: true});
    await firebase
      .database()
      .ref('challenges/' + objectID + '/results')
      .update({
        winner: winnerID,
        date: new Date().toString(),
        status: 'pending',
        postedBy: {id: userID, info: infoUser},
      });
    await this.setState({loader: false});
    return goBack();
  }
  conditionOn() {
    if (this.state.winnerID) return false;
    return true;
  }
  render() {
    const {navigate, goBack} = this.props.navigation;
    const challenge = this.props.navigation.getParam('challenge');
    console.log('render piublish result', challenge);
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
            text="Confirm result"
            backgroundColor={'green'}
            onPressColor={colors.greenLight}
            disabled={this.conditionOn()}
            loader={this.state.loader}
            click={() => this.submitResult(challenge)}
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
