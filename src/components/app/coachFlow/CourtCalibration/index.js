import React, {Component} from 'react';
import {View, Text, Image, StyleSheet, Animated} from 'react-native';
import {connect} from 'react-redux';
import StatusBar from '@react-native-community/status-bar';
import {Col, Row} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {resolutionP} from '../../../functions/pictures';
import {displayTime} from '../../../functions/coach';
import {date} from '../../../layout/date/date';

import {coachAction} from '../../../../actions/coachActions';

import {
  heightFooter,
  heightHeaderHome,
  marginTopAppLanscape,
} from '../../../style/sizes';

import ScrollView from '../../../layout/scrollViews/ScrollView2';
import Button from '../../../layout/buttons/Button';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import AsyncImage from '../../../layout/image/AsyncImage';
import ButtonColor from '../../../layout/Views/Button';
import AllIcon from '../../../layout/icons/AllIcons';

class CourtCalibration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      angleSelected: '',
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {
    StatusBar.setBarStyle('dark-content', true);
  }

  courtCalibration() {
    const {route} = this.props;
    const {onGoBack, archive} = route.params;
    const {size, thumbnail, durationSeconds, startTimestamp} = archive;
    const optionsAngle = [
      {text: 'Left', value: 'left', id: 1},
      {text: 'Center', value: 'center', id: 2},
      {text: 'Right', value: 'right', id: 3},
    ];
    const {angle} = this.state;
    return (
      <View style={styleApp.marginView}>
        <Row>
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
        </Row>
        <Text style={[styleApp.title, {marginTop: 20}]}>
          What is the angle of the camera?
        </Text>

        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
          {optionsAngle.map((angle) => (
            <ButtonColor
              key={angle.id}
              style={{height: 140, width: '50%'}}
              view={() => {
                const {id, text, value} = angle;
                const {angleSelected} = this.state;
                let img = require('../../../../img/tennis/cameraAngleLeft.png');
                if (id === 2)
                  img = require('../../../../img/tennis/cameraAngleCenter.png');
                if (id === 3)
                  img = require('../../../../img/tennis/cameraAngleRight.png');
                return (
                  <View style={[styleApp.center]} key={id}>
                    {angleSelected === value && (
                      <View style={styles.greenTickMark}>
                        <AllIcon
                          size={30}
                          name="check"
                          type="font"
                          color={colors.greenConfirm}
                        />
                      </View>
                    )}
                    <Image source={img} style={{width: 150, height: 110}} />
                    <Text style={[styleApp.textBold, {marginTop: 0}]}>
                      {text}
                    </Text>
                  </View>
                );
              }}
              click={() => this.setState({angleSelected: angle.value})}
              color="white"
              onPressColor={colors.off}
            />
          ))}
        </View>
      </View>
    );
  }
  render() {
    const {currentScreenSize, navigation, route} = this.props;
    const {navigate} = navigation;
    const {angleSelected} = this.state;
    const {noUpdateStatusBar, archive} = route.params;
    const {portrait} = currentScreenSize;
    let marginTop = heightHeaderHome;
    if (!portrait) marginTop = marginTopAppLanscape + heightHeaderHome;

    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          inputRange={[5, 10]}
          colorLoader={'white'}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          initialBorderColorIcon={colors.white}
          //   colorIcon1={colors.greyDark}
          textHeader="Analytics"
          sizeLoader={40}
          // sizeIcon1={16}
          nobackgroundColorIcon1={true}
          initialBorderWidth={1}
          // backgroundColorIcon1={colors.white}

          icon1="times"
          backgroundColorIcon2={colors.title + '70'}
          clickButton2={() => this.rightButtonsRef.openToolBox()}
          sizeIcon2={20}
          typeIcon2="font"
          colorIcon2={colors.white}
          initialTitleOpacity={1}
          clickButton1={() => {
            if (!noUpdateStatusBar)
              StatusBar.setBarStyle('light-content', true);
            navigation.goBack();
          }}
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

        {angleSelected !== '' && (
          <FadeInView
            duration={300}
            style={[styleApp.footerBooking, styleApp.marginView]}>
            <Button
              text={'Confirm ' + angleSelected + ' angle'}
              backgroundColor={'green'}
              onPressColor={colors.greenLight}
              click={async () =>
                navigate('CourtPositioning', {
                  angleSelected: angleSelected,
                  archive: archive,
                })
              }
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
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {coachAction},
)(CourtCalibration);
