import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Animated,
  Easing,
  Dimensions,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {createEventAction} from '../../../actions/createEventActions';

import {Grid, Row, Col} from 'react-native-easy-grid';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
const AnimatedIcon = Animated.createAnimatedComponent(FontIcon);

import sizes from '../../style/sizes';
import Loader from '../loaders/Loader';
import colors from '../../style/colors';
import ButtonColor from '../Views/Button';
import AllIcons from '../icons/AllIcons';
import styleApp from '../../style/style';
import AllIcon from '../icons/AllIcons';
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
    this.rotateIcon = new Animated.Value(0);
    this.borderWidthButtonLeague = new Animated.Value(0);
    this.borderWidthButtonSport = new Animated.Value(0);
    this.openLeagueVal = false;
  }

  componentDidMount() {
    this.setupEventCreateSport({value: this.props.sportSelected});
    if (this.props.loaderOn === true) {
      this.props.onRef(this);
    }
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

  openSport(val, sport) {
    if (val) {
      return Animated.parallel([
        Animated.timing(
          this.state.heightButtonSport,
          timing(Object.values(this.props.sports).length * 50, 200),
        ),
        Animated.timing(this.borderWidthButtonSport, timing(1, 200)),
        Animated.timing(this.state.widthButtonSport, timing(150, 200)),
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
      Animated.timing(this.state.widthButtonSport, timing(51, 200)),
      Animated.timing(this.rotateIcon, timing(0, 200)),
    ]).start(() => {
      this.setState({openSport: false});
    });
  }
  openLeague(val, league, numberElements) {
    if (val) {
      this.openLeagueVal = true;
      return Animated.parallel([
        Animated.timing(
          this.state.heightButtonLeague,
          timing(numberElements * 50, 200),
        ),
        Animated.timing(this.borderWidthButtonLeague, timing(1, 200)),
        Animated.timing(this.state.widthButtonLeague, timing(150, 200)),
        Animated.timing(this.rotateIcon, timing(1, 200)),
      ]).start();
    }
    this.props.historicSearchAction('setLeague', league);
    this.openLeagueVal = false;
    return Animated.parallel([
      Animated.timing(this.state.heightButtonLeague, timing(50, 200)),
      Animated.timing(this.borderWidthButtonLeague, timing(0, 200)),
      Animated.timing(this.state.widthButtonLeague, timing(45, 200)),
      Animated.timing(this.rotateIcon, timing(0, 200)),
    ]).start(() => {});
  }
  buttonSport(sport, i) {
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row style={{height: 45}}>
              <Col size={35} style={[styleApp.center2, {paddingLeft: 5}]}>
                {/* <View style={{overflow:'hidden',height:40,width:40,borderWidth:1,borderColor:colors.off,borderRadius:20,}}>
                 
              </View> */}
                <AsyncImage
                  style={{height: 37, width: 37, borderRadius: 20}}
                  mainImage={sport.card.img.imgSM}
                  imgInitial={sport.card.img.imgXS}
                />
              </Col>
              {/* <Col size={10} style={[styleApp.center]}>
              {
                i==0?
                <AnimatedIcon name='caret-right' color={colors.title} style={{transform: [{rotate: spin}]}} size={15} />
                :null
              } 
            </Col> */}
              <Col size={75} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text
                  style={[
                    {
                      fontFamily: 'OpenSans-Bold',
                      fontSize: 15,
                      color: colors.title,
                    },
                  ]}>
                  {sport.text.charAt(0).toUpperCase() + sport.text.slice(1)}
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() => this.openSport(!this.state.openSport, sport)}
        color={'white'}
        style={[
          styleApp.center,
          {
            height: 50,
            width: 150,
            borderRadius: 0,
            borderWidth: 0,
            overFlow: 'hidden',
          },
        ]}
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
        style={[{height: 50, width: 190, paddingLeft: 5, paddingRight: 5}]}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    const AnimateOpacityTitle = this.props.AnimatedHeaderValue.interpolate({
      inputRange: [
        this.props.inputRange[1] + 20,
        this.props.inputRange[1] + 30,
      ],
      outputRange: [this.props.initialTitleOpacity, 1],
      extrapolate: 'clamp',
    });
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
    const AnimateColorIcon = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [colors.title, colors.title],
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
      outputRange: [0, -10],
      extrapolate: 'clamp',
    });
    const heightHeaderFilter = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [sizes.heightHeaderFilter, sizes.heightHeaderFilter - 20],
      extrapolate: 'clamp',
    });
    const scaleIcon = this.props.AnimatedHeaderValue.interpolate({
      inputRange: this.props.inputRange,
      outputRange: [35, 20],
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
    if (league === undefined) {
      league = this.props.leagueAll;
    }
    return (
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: AnimateBackgroundView,
            borderBottomWidth: borderWidth,
            height: heightHeaderFilter,
            borderColor: borderColorView,
            shadowOpacity: shadeOpacityHeader,
          },
        ]}>
        <Row
          style={{
            width: width,
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 15,
          }}>
          <Animated.View
            style={[
              {
                height: this.state.heightButtonSport,
                width: this.state.widthButtonSport,
                overflow: 'hidden',
                position: 'absolute',
                zIndex: 40,
                left: 20,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: borderColorButtonSport,
                transform: [{translateY: translateYHeader}],
              },
            ]}>
            {this.buttonSport(sport, 0)}

            {Object.values(this.props.sports)
              .filter((item) => item && item.value != sport.value)
              .map((sportIn, i) => this.buttonSport(sportIn, i + 1))}
          </Animated.View>
          <Animated.View
            style={[
              {
                height: this.state.heightButtonLeague,
                width: 190,
                overflow: 'hidden',
                borderWidth: 1,
                position: 'absolute',
                left: 90,
                borderColor: borderColorButton,
                borderRadius: 10,
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
              {
                height: 45,
                width: 45,
                position: 'absolute',
                right: 20,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: borderColorIcon,
                transform: [{translateY: translateYHeader}],
              },
            ]}
            onPressColor={colors.off}
          />
        </Row>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2: {
    justifyContent: 'center',
  },
  icon: {
    height: 48,
    width: 48,
    borderRadius: 23.8,
    borderWidth: 1,
    backgroundColor: 'white',
    // overFlow:'hidden',
  },
  header: {
    height: sizes.heightHeaderFilter,
    paddingTop: sizes.marginTopHeader - 5,
    borderBottomWidth: 1,
    position: 'absolute',
    zIndex: 10,
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
    // backgroundColor:'red',
    zIndex: -1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    paddingLeft: 7,
    color: '#4B4B4B',
  },
  textTitleHeader: {
    color: colors.title,
    fontSize: 17,
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
