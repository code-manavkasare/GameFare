import React, {Component} from 'react';
import {View, Text, Image, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import {Col, Row} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import axios from 'axios';
import Config from 'react-native-config';

import HeaderBackButton from '../../../../layout/headers/HeaderBackButton';
import {resolutionP} from '../../../../functions/pictures';
import {displayTime} from '../../../../functions/coach';
import {date} from '../../../../layout/date/date';

import {
  heightFooter,
  heightHeaderHome,
  marginTopAppLanscape,
} from '../../../../style/sizes';

import ScrollView from '../../../../layout/scrollViews/ScrollView2';
import Button from '../../../../layout/buttons/Button';

import colors from '../../../../style/colors';
import styleApp from '../../../../style/style';
import AsyncImage from '../../../../layout/image/AsyncImage';
import ButtonColor from '../../../../layout/Views/Button';
import AllIcon from '../../../../layout/icons/AllIcons';
import Loader from '../../../../layout/loaders/Loader';

class CourtPositioning extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      error: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    StatusBar.setBarStyle('dark-content', true);
    this.getCourtCalibration();
  }
  async getCourtCalibration() {
    const {userID} = this.props;
    const urlCreateUserConnectAccount = `${
      Config.FIREBASE_CLOUD_FUNCTIONS_URL
    }courtCalibration`;
    const {route} = this.props;
    const {archive, angleSelected} = route.params;
    const {thumbnail} = archive;
    let thumbnailsAnalytics = archive.thumbnailsAnalytics;
    if (!thumbnailsAnalytics) thumbnailsAnalytics = [thumbnail];
    thumbnailsAnalytics = ['https://bit.ly/3c6Js2m'];
    let responseCourtCalibration = await axios.get(
      urlCreateUserConnectAccount,
      {
        params: {
          userID: userID,
          thumbnail: thumbnailsAnalytics[0],
          angleSelected: angleSelected,
        },
      },
    );
    const {data} = responseCourtCalibration;

    this.setState({loader: false, error: data.message});
  }
  courtCalibration() {
    const {route} = this.props;
    const {archive} = route.params;
    const {error} = this.state;
    const {size, thumbnail, durationSeconds, startTimestamp} = archive;
    const {loader} = this.state;
    let thumbnailsAnalytics = archive.thumbnailsAnalytics;
    if (!thumbnailsAnalytics) thumbnailsAnalytics = [thumbnail];
    thumbnailsAnalytics = [
      'https://firebasestorage.googleapis.com/v0/b/gamefare-dev-cfc88.appspot.com/o/test%2Ftest.png?alt=media&token=e7d2ea0e-950c-4956-be98-5f257f356ea0',
    ];
    return (
      <View style={styleApp.marginView}>
        {/* <Row>
          <Col style={styleApp.center2} size={25}>
            <AsyncImage mainImage={thumbnail} style={styles.img} />
          </Col>
          <Col style={styleApp.center2} size={75}>
            <Text style={styleApp.textBold}>
              {resolutionP(size)} • {displayTime(durationSeconds)}
            </Text>
            <Text style={[styleApp.text, {fontSize: 13}]}>
              {date(
                new Date(startTimestamp).toString(),
                'ddd, MMM Do • h:mm a',
              )}
            </Text>
          </Col>
        </Row> */}
        <Text style={[styleApp.title, {marginTop: 0}]}>
          Confirm the position of the court.
        </Text>

        <View style={{height: 200, width: '100%', marginTop: 20}}>
          <AsyncImage
            mainImage={thumbnailsAnalytics[0]}
            style={[styleApp.fullSize, {borderRadius: 6}]}
          />
          {loader && (
            <View
              style={[
                styleApp.center,
                styleApp.fullSize,
                {position: 'absolute', backgroundColor: colors.off + '70'},
              ]}>
              <Loader size={55} color={colors.white} />
            </View>
          )}
        </View>
        {<Text style={[styleApp.subtitle, {marginTop: 20}]}>{error}</Text>}
      </View>
    );
  }
  render() {
    const {navigation, route} = this.props;
    const {loader} = this.state;
    const {goBack} = navigation;
    let marginTop = heightHeaderHome;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          inputRange={[5, 10]}
          colorLoader={'white'}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          initialBorderColorIcon={colors.white}
          //   colorIcon1={colors.greyDark}
          textHeader="Court position"
          sizeLoader={40}
          // sizeIcon1={15}
          nobackgroundColorIcon1={true}
          initialBorderWidth={1}
          // backgroundColorIcon1={colors.white}

          icon1="arrow-left"
          backgroundColorIcon2={colors.title + '70'}
          sizeIcon2={20}
          typeIcon2="font"
          colorIcon2={colors.white}
          initialTitleOpacity={1}
          clickButton1={() => goBack()}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={() => this.courtCalibration()}
          marginBottomScrollView={0}
          marginTop={marginTop}
          offsetBottom={heightFooter + 90}
          showsVerticalScrollIndicator={false}
        />

        {!loader && (
          <FadeInView
            duration={300}
            style={[styleApp.footerBooking, styleApp.marginView]}>
            <Button
              text={'Confirm court position'}
              backgroundColor={'green'}
              onPressColor={colors.greenLight}
              click={async () => {
                true;
              }}
            />
          </FadeInView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  img: {
    width: '90%',
    height: 60,
    borderRadius: 5,
  },
  greenTickMark: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 10,
    backgroundColor: colors.off + '95',
    ...styleApp.center,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {},
)(CourtPositioning);
