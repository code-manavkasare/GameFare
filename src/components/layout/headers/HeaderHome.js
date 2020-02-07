import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {createEventAction} from '../../../actions/createEventActions';
import {Grid, Row, Col} from 'react-native-easy-grid';

import sizes from '../../style/sizes';
import colors from '../../style/colors';
import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';
import styleApp from '../../style/style';
import {native, timing} from '../../animations/animations';
import AsyncImage from '../image/AsyncImage';
const {height, width} = Dimensions.get('screen');

class HeaderHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableClickButton: true,
      heightButtonSport: new Animated.Value(50),
      widthButtonSport: new Animated.Value(51),
      heightButtonLeague: new Animated.Value(50),
      widthButtonLeague: new Animated.Value(150),
      openSport: false,
      openLeague: false,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.voile = this.voile.bind(this);
    this.rotateIcon = new Animated.Value(0);
    this.borderWidthButtonLeague = new Animated.Value(0);
    this.borderWidthButtonSport = new Animated.Value(0);
    this.opacityVoile = new Animated.Value(0);
    this.translateXVoile = new Animated.Value(width);
    this.openLeagueVal = false;
  }

  componentDidMount() {
    this.setupEventCreateSport({value: this.props.sportSelected});
  }
  async close() {
    this.setState({enableClickButton: false});
    if (this.props.enableClickButton && this.state.enableClickButton) {
      this.props.close();
      var that = this;
      setTimeout(function() {
        that.setState({enableClickButton: true});
      }, 1500);
    }
  }
  sizeColTitle() {
    if (this.props.headerType) return 25;
    return 70;
  }

  setupEventCreateSport(sport) {
    // store selected sport so create event page pre-selects correct sport
    let sportData = this.props.sports.filter((s) => s.value === sport.value)[0];
    this.props.createEventAction('setStep0', {
      sport: sport.value,
      rule: sportData.typeEvent[0].rules[0].value,
      level: sportData.level.list[0].value,
      league: sportData.typeEvent[0].value,
    });
  }

  async openSport(val, sport) {
    if (val) {
      await this.translateXVoile.setValue(0);
      return Animated.parallel([
        Animated.timing(
          this.state.heightButtonSport,
          timing(Object.values(this.props.sports).length * 50, 200),
        ),
        Animated.timing(this.borderWidthButtonSport, timing(1, 200)),
        Animated.timing(this.opacityVoile, timing(0.65, 200)),
        Animated.timing(this.state.widthButtonSport, timing(170, 200)),
        Animated.timing(this.rotateIcon, timing(1, 200)),
      ]).start(() => {
        this.setState({openSport: true});
      });
    }
    this.props.historicSearchAction('setSport', {
      value: sport.value,
      league: 'all',
    });
    this.setupEventCreateSport(sport);
    return Animated.parallel([
      Animated.timing(this.state.heightButtonSport, timing(50, 200)),
      Animated.timing(this.borderWidthButtonSport, timing(0, 200)),
      Animated.timing(this.opacityVoile, timing(0, 200)),
      Animated.timing(this.state.widthButtonSport, timing(51, 200)),
      Animated.timing(this.rotateIcon, timing(0, 200)),
    ]).start(() => {
      this.setState({openSport: false});
      this.translateXVoile.setValue(width);
    });
  }
  async openLeague(val, league, numberElements) {
    if (val) {
      this.openLeagueVal = true;
      await this.translateXVoile.setValue(0);
      return Animated.parallel([
        Animated.timing(
          this.state.heightButtonLeague,
          timing(numberElements * 50, 200),
        ),
        Animated.timing(this.borderWidthButtonLeague, timing(1, 200)),
        Animated.timing(this.opacityVoile, timing(0.65, 200)),
        Animated.timing(this.state.widthButtonLeague, timing(150, 200)),
        Animated.timing(this.rotateIcon, timing(1, 200)),
      ]).start();
    }
    this.props.historicSearchAction('setLeague', league);
    this.openLeagueVal = false;
    return Animated.parallel([
      Animated.timing(this.state.heightButtonLeague, timing(50, 200)),
      Animated.timing(this.borderWidthButtonLeague, timing(0, 200)),
      Animated.timing(this.opacityVoile, timing(0, 200)),
      Animated.timing(this.state.widthButtonLeague, timing(45, 200)),
      Animated.timing(this.rotateIcon, timing(0, 200)),
    ]).start(() => {});
  }
  closeAll() {
    Animated.parallel([
      Animated.timing(this.state.heightButtonSport, timing(50, 200)),
      Animated.timing(this.state.heightButtonLeague, timing(50, 200)),
      Animated.timing(this.borderWidthButtonSport, timing(0, 200)),
      Animated.timing(this.borderWidthButtonLeague, timing(0, 200)),
      Animated.timing(this.opacityVoile, timing(0, 200)),
      Animated.timing(this.state.widthButtonSport, timing(51, 200)),
      Animated.timing(this.state.widthButtonLeague, timing(45, 200)),
      Animated.timing(this.rotateIcon, timing(0, 200)),
    ]).start(() => {
      this.setState({openSport: false});
      this.translateXVoile.setValue(width);
    });
  }
  buttonSport(sport, i) {
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row style={{height: 45}}>
              <Col size={35} style={[styleApp.center2, {paddingLeft: 5}]}>
                <AsyncImage
                  style={{height: 37, width: 37, borderRadius: 20}}
                  mainImage={sport.card.img.imgSM}
                  imgInitial={sport.card.img.imgXS}
                />
              </Col>

              <Col size={75} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text style={styleApp.text}>
                  {sport.text.charAt(0).toUpperCase() + sport.text.slice(1)}
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() => this.openSport(!this.state.openSport, sport)}
        color={'white'}
        style={[styleApp.center, styles.buttonSport]}
        onPressColor={colors.off}
      />
    );
  }
  buttonLeague(league, i, sport) {
    if (!this.props.league) return null;
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              <Col size={25} style={[styleApp.center2, {paddingLeft: 0}]}>
                <AsyncImage
                  style={{height: 37, width: 37, borderRadius: 20}}
                  mainImage={league.img.icon}
                  imgInitial={league.img.icon}
                />
              </Col>
              <Col size={75} style={[styleApp.center2, {paddingLeft: 0}]}>
                <Text style={[styleApp.input, {fontSize: 15}]}>
                  {league.name.charAt(0).toUpperCase() + league.name.slice(1)}
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() =>
          this.openLeague(
            !this.openLeagueVal,
            league.value,
            Object.values(sport.typeEvent).filter((item) => item).length + 1,
          )
        }
        color={'white'}
        style={styles.buttonLeague}
        onPressColor={colors.off}
      />
    );
  }
  voile() {
    return (
      <Animated.View
        style={[
          styleApp.voile,
          {
            zIndex: -2,
            opacity: this.opacityVoile,
            transform: [{translateX: this.translateXVoile}],
          },
        ]}>
        <TouchableOpacity
          style={[styleApp.fullSize]}
          activeOpacity={1}
          onPress={() => this.closeAll()}
        />
      </Animated.View>
    );
  }
  render() {
    const AnimateBackgroundView = this.props.AnimatedHeaderValue.interpolate({
      inputRange: [0, 100],
      outputRange: [this.props.initialBackgroundColor, 'white'],
      extrapolate: 'clamp',
    });
    const borderWidth = this.props.AnimatedHeaderValue.interpolate({
      inputRange: [0, 10],
      outputRange: [0, 0.5],
      extrapolate: 'clamp',
    });
    const borderColorButton = this.borderWidthButtonLeague.interpolate({
      inputRange: [0, 1],
      outputRange: ['white', colors.grey],
      extrapolate: 'clamp',
    });
    const borderColorButtonSport = this.borderWidthButtonSport.interpolate({
      inputRange: [0, 1],
      outputRange: ['white', colors.grey],
      extrapolate: 'clamp',
    });
    const borderColorIcon = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [colors.white, colors.off],
      extrapolate: 'clamp',
    });
    const borderColorView = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: ['white', colors.grey],
      extrapolate: 'clamp',
    });
    const translateYHeader = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [-10, -10],
      extrapolate: 'clamp',
    });
    const shadeOpacityHeader = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [0, 0.03],
    });
    var sport = Object.values(this.props.sports).filter(
      (sport) => sport.value === this.props.sportSelected,
    )[0];
    var league = Object.values(sport.typeEvent)
      .filter((league) => league)
      .filter((league) => league.value === this.props.leagueSelected)[0];
    if (!league) {
      league = this.props.leagueAll;
    }
    return (
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: AnimateBackgroundView,
            borderBottomWidth: borderWidth,
            height: sizes.heightHeaderHome,
            borderColor: borderColorView,
            shadowOpacity: shadeOpacityHeader,
          },
        ]}>
        <Row style={styles.rowHeader}>
          <Animated.View
            style={[
              {
                ...styles.viewButtonSport,
                height: this.state.heightButtonSport,
                width: this.state.widthButtonSport,
                borderColor: borderColorButtonSport,
                transform: [{translateY: translateYHeader}],
              },
            ]}>
            {this.buttonSport(sport, 0)}

            {Object.values(this.props.sports)
              .filter((item) => item && item.value !== sport.value)
              .map((sportIn, i) => this.buttonSport(sportIn, i + 1))}
          </Animated.View>
          <Animated.View
            style={[
              {
                ...styles.viewButtonLeague,
                height: this.state.heightButtonLeague,
                borderColor: borderColorButton,
                transform: [{translateY: translateYHeader}],
              },
            ]}>
            {this.buttonLeague(league, 0, sport)}

            {Object.values(sport.typeEvent)
              .filter((item) => item && item.value != this.props.leagueSelected)
              .map((league, i) => this.buttonLeague(league, i + 1, sport))}

            {this.buttonLeague(this.props.leagueAll, 9, sport)}
          </Animated.View>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name={this.props.icon2}
                  color={colors.title}
                  size={20}
                  type={this.props.typeIcon2}
                />
              );
            }}
            click={() => this.props.clickButton2()}
            color={'white'}
            style={[
              styleApp.center,
              styles.button2,
              {
                borderColor: borderColorIcon,
                transform: [{translateY: translateYHeader}],
              },
            ]}
            onPressColor={colors.off}
          />
        </Row>

        {this.voile()}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: sizes.heightHeaderFilter,
    paddingTop: sizes.marginTopHeader - 5,
    borderBottomWidth: 1,
    position: 'absolute',
    zIndex: 10,
  },
  voile: {
    height: height,
    width: width,
    position: 'absolute',
    backgroundColor: 'red',
  },
  rowHeader: {
    width: width,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 15,
  },
  viewButtonLeague: {
    width: 190,
    overflow: 'hidden',
    // borderWidth: 1,
    position: 'absolute',
    left: 90,
    borderRadius: 10,
  },
  viewButtonSport: {
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 40,
    left: 20,
    borderWidth: 1,
    borderRadius: 10,
  },
  imgBackground: {
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  },
  viewTitleHeader: {
    position: 'absolute',
    height: '100%',
    width: width,
    zIndex: -1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLeague: {height: 50, width: 190, paddingLeft: 5, paddingRight: 5},
  buttonSport: {
    height: 50,
    width: 170,
  },
  button2: {
    height: 45,
    width: 45,
    position: 'absolute',
    right: 20,
    borderRadius: 25,
    borderWidth: 1,
  },
});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    sportSelected: state.historicSearch.sport,
    leagueSelected: state.historicSearch.league,
    leagueAll: state.globaleVariables.leagueAll,
  };
};

export default connect(mapStateToProps, {
  historicSearchAction,
  createEventAction,
})(HeaderHome);
