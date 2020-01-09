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
import {historicSearchAction} from '../../../actions/historicSearchActions';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import ScrollView from '../../layout/scrollViews/ScrollView2';
import AsyncImage from '../../layout/image/AsyncImage';

import sizes from '../../style/sizes';
import styleApp from '../../style/style';

class InitialPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      widthText: new Animated.Value(40),
      sport: '',
      page: 'sport',
    };
    this.translateXText = new Animated.Value(90);
  }
  componentDidMount() {
    console.log('sport selected mounted');
    console.log(this.props.sportSelected);
  }
  async selectSport(sport) {
    // write sport to redux
    console.log('on set league');
    console.log(sport);
    await this.props.historicSearchAction('setSport', {
      value: sport,
      league: 'all',
    });
    this.props.navigation.navigate('LocationSelect');
  }
  isOdd(num) {
    return num % 2;
  }
  button(sport, i) {
    console.log(sport);
    console.log('sport.value');
    // console.log(this.props.leagueSelected);
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <View
              style={[
                {
                  borderWidth: 3,
                  borderColor:
                    sport.value === this.props.sportSelected
                      ? colors.primary
                      : 'white',
                  borderRadius: 15,
                  width: 160,
                  height: 160,
                  overflow: 'hidden',
                  backgroundColor: colors.off,
                },
              ]}>
              <AsyncImage
                style={{position: 'absolute', height: '100%', width: '100%'}}
                mainImage={sport.card.img.imgSM}
                imgInitial={sport.card.img.imgXS}
              />
              {sport.card.img.icon !== undefined ? (
                <AsyncImage
                  style={{
                    position: 'absolute',
                    height: 23,
                    width: 23,
                    right: 5,
                    top: 5,
                  }}
                  mainImage={sport.card.img.icon}
                  imgInitial={sport.card.img.icon}
                />
              ) : null}
              <Text
                style={[
                  styleApp.textBold,
                  styleApp.textShade,
                  {
                    color: 'white',
                    position: 'absolute',
                    bottom: 15,
                    left: 15,
                    right: 15,
                  },
                ]}>
                {sport.text}
              </Text>
            </View>
          );
        }}
        click={() => {
          this.selectSport(sport.value);
        }}
        color={'white'}
        style={{height: 170, width: width / 2}}
        onPressColor={colors.off2}
      />
    );
  }
  sportPage() {
    return (
      <FadeInView duration={200} style={{height: height, paddingTop: 20}}>
        <View style={[styleApp.marginView]}>
          <Text style={[styleApp.input, {marginTop: 20, fontSize: 24}]}>
            Welcome to GameFare!
          </Text>
          <Text
            style={[
              styleApp.smallText,
              {
                color: colors.title,
                marginBottom: 20,
                marginTop: 10,
                fontSize: 16,
              },
            ]}>
            Pick your sport, join groups and find events.
          </Text>
        </View>

        {/* <View style={styleApp.divider2}/> */}

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 20,
            width: width,
          }}>
          {this.props.sports.map((sport, i) => (
            <View
              style={{
                height: 170,
                borderColor: colors.title,
                width: width / 2,
                flexDirection: 'column',
              }}>
              {this.button(sport, i + 1, sport.value)}
            </View>
          ))}
          {/* {this.button(this.props.sports, 8, sport.value)} */}
        </View>
      </FadeInView>
    );
  }
  render() {
    // if (this.props.sportSelected === '') return null;
    // var sport = Object.values(this.props.sports).filter(
    //   sport => sport.value === this.props.sportSelected,
    // )[0];
    // console.log('sport ici');
    // console.log(sport);
    // console.log(this.props.leagueAll);
    return (
      <View style={[{borderLeftWidth: 0, backgroundColor: 'white', flex: 1}]}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.sportPage()}
          marginBottomScrollView={0}
          marginTop={sizes.marginTopApp}
          offsetBottom={0}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    sportSelected: state.historicSearch.sport,
    leagueSelected: state.historicSearch.league,
    leagueAll: state.globaleVariables.leagueAll,
  };
};

export default connect(mapStateToProps, {historicSearchAction})(InitialPage);
