import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';

const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import ButtonColor from '../../layout/Views/Button';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import ScrollView from '../../layout/scrollViews/ScrollView2';
import AsyncImage from '../../layout/image/AsyncImage';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
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
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
  async selectLeague(sport, league) {
    // write sport to redux
    console.log('on set league');
    console.log(league);
    await this.props.historicSearchAction('setLeague', league);
    this.props.navigation.navigate('LocationSelect');
  }
  isOdd(num) {
    return num % 2;
  }
  button(league, i, sport) {
    console.log(league);
    console.log('sport.value');
    console.log(this.props.leagueSelected);
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <View
              style={{
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 15,
                paddingBottom: 15,
              }}>
              <Row>
                <AsyncImage
                  style={{
                    height: 140,
                    width: '100%',
                    borderRadius: 5,
                    borderTopRightRadius: 5,
                  }}
                  mainImage={league.img.imgSM}
                  imgInitial={league.img.imgXS}
                />
                <AsyncImage
                  style={{
                    position: 'absolute',
                    height: 23,
                    width: league.value === 'usta' ? 26 : 23,
                    right: 5,
                    top: 5,
                  }}
                  mainImage={league.img.icon}
                  imgInitial={league.img.icon}
                />
              </Row>

              <Text style={[styleApp.textBold, {marginTop: 10}]}>
                {league.name}
              </Text>
              <Text style={[styleApp.smallText, {marginTop: 5}]}>
                {league.description}
              </Text>
            </View>
          );
        }}
        click={() => {
          this.selectLeague(sport, league.value);
        }}
        color={'white'}
        style={{
          // height: 170,
          flex: 1,
          width: width,
          marginTop: 0,
        }}
        onPressColor={colors.off}
      />
    );
  }
  rowTopSport(sport) {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center}>
                <AsyncImage
                  style={{height: 45, borderRadius: 22.5, width: 45}}
                  mainImage={sport.card.img.imgSM}
                  imgInitial={sport.card.img.imgXS}
                />
              </Col>
              <Col size={85} style={[styleApp.center2, {paddingLeft: 20}]}>
                <Text style={styleApp.input}>{sport.card.name}</Text>
              </Col>
            </Row>
          );
        }}
        click={() => {
          // this.selectSport(sport.value)
          // this.setState({sport:sport.value})
        }}
        color={'white'}
        style={{height: 55, paddingLeft: 20, paddingRight: 20}}
        onPressColor={colors.off}
      />
    );
  }
  sportPage(sport) {
    return (
      <View style={{width: width}}>
        {this.rowTopSport(sport)}

        <View style={[styleApp.marginView]}>
          <Text
            style={[
              styleApp.input,
              {marginTop: 20, fontSize: 24, marginBottom: 10},
            ]}>
            What are you looking for?
          </Text>
        </View>

        {/* <View style={styleApp.divider2}/> */}

        {Object.values(sport.typeEvent)
          .filter(type => type)
          .map((league, i) => this.button(league, i + 1, sport.value))}
        {this.button(this.props.leagueAll, 8, sport.value)}
      </View>
    );
  }
  render() {
    if (this.props.sportSelected === '') return null;
    var sport = Object.values(this.props.sports).filter(
      sport => sport.value === this.props.sportSelected,
    )[0];
    console.log('sport ici');
    console.log(sport);
    console.log(this.props.leagueAll);
    return (
      <View style={{flex: 1}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={''}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1="arrow-left"
          icon2={null}
          clickButton1={() => this.props.navigation.goBack()}
        />
        <ScrollView
          onRef={ref => (this.scrollViewRef = ref)}
          contentScrollView={() => this.sportPage(sport)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={90}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  imgBackground: {
    height: 155,
    width: width / 2 - 30,
    // position:'absolute',
    zIndex: 30,
    // borderRadius:24,
    borderColor: colors.off,
    borderWidth: 0,
    // borderRadius:20
  },
  cardSport: {
    marginRight: 0,
    height: 60,
    width: width,
    borderColor: colors.off,
    borderWidth: 1,
    borderRadius: 10,
  },
});

const mapStateToProps = state => {
  return {
    sports: state.globaleVariables.sports.list,
    sportSelected: state.historicSearch.sport,
    leagueSelected: state.historicSearch.league,
    leagueAll: state.globaleVariables.leagueAll,
  };
};

export default connect(mapStateToProps, {historicSearchAction})(InitialPage);
