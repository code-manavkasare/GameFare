import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  View,
  Animated,
  InteractionManager,
} from 'react-native';

import MatIcon from 'react-native-vector-icons/MaterialIcons';
import {Col, Row, Grid} from 'react-native-easy-grid';
const {height, width} = Dimensions.get('screen');

import ScrollView from '../../layout/scrollViews/ScrollView2';
import HeaderBackButton from '../../layout/headers/HeaderBackButton';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';

import styleApp from '../../style/style';
import sizes from '../../style/sizes';
import BackButton from '../../layout/buttons/BackButton';
const ListCountry = require('./country.json');

import RNFS from 'react-native-fs';

export default class SelectCountry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slice: 30,
    };
    this.componentDidMount = this.componentDidMount.bind(this);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.letter = '-';
  }
  async componentDidMount() {
    var that = this;
    setTimeout(function() {
      that.setState({slice: ListCountry.length});
    }, 1150);
  }
  back() {
    this.props.close();
  }
  async selectCountry(country) {
    const {params} = this.props.route;
    params.onGoBack(country);
  }
  conditionCheck(country) {
    return false;
  }
  cardCountry(country, displayHeader, i) {
    var displayLetter = false;
    if (country.name[0] !== this.letter && displayHeader) {
      displayLetter = true;
      this.letter = country.name[0];
    }
    return (
      <View key={i}>
        {displayLetter && displayHeader && (
          <Row style={styles.rowLetter}>
            <Col style={styleApp.center2}>
              <Text style={[styles.subtitle, {fontWeight: 'bold'}]}>
                {this.letter}
              </Text>
            </Col>
          </Row>
        )}

        <ButtonColor
          view={() => {
            return (
              <Row>
                <Col size={15} style={styleApp.center2}>
                  <Image
                    source={{uri: country.flag}}
                    style={{width: 23, height: 23, borderRadius: 11.5}}
                  />
                </Col>
                <Col size={70} style={styleApp.center2}>
                  <Text style={styles.subtitle}>{country.name}</Text>
                </Col>
                <Col size={15} style={styleApp.center}>
                  {this.conditionCheck(country) ? (
                    <MatIcon name="check" color={colors.primary} size={18} />
                  ) : null}
                </Col>
              </Row>
            );
          }}
          click={() => this.selectCountry(country)}
          color="white"
          style={styles.buttonCountry}
          onPressColor={colors.off}
        />
      </View>
    );
  }
  contryComponent() {
    return (
      <View>
        <Row style={styles.rowLetter}>
          <Col style={styleApp.center2}>
            <Text style={[styles.subtitle, {fontWeight: 'bold'}]}>
              Common countries
            </Text>
          </Col>
        </Row>
        {this.cardCountry(
          ListCountry.filter((country) => country.name === 'United States')[0],
          false,
          0,
        )}
        {this.cardCountry(
          ListCountry.filter((country) => country.name === 'Canada')[0],
          false,
          1,
        )}
        {this.cardCountry(
          ListCountry.filter((country) => country.name === 'France')[0],
          false,
          2,
        )}
        {this.cardCountry(
          ListCountry.filter((country) => country.name === 'Australia')[0],
          false,
          3,
        )}

        {ListCountry.slice(0, this.state.slice).map((country) =>
          this.cardCountry(country, true, country.code),
        )}
      </View>
    );
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Select your country'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={0}
          icon1="times"
          icon2={null}
          clickButton1={() => this.selectCountry(false)}
        />

        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          contentScrollView={this.contryComponent.bind(this)}
          marginBottomScrollView={0}
          marginTop={sizes.heightHeaderHome}
          offsetBottom={180}
          showsVerticalScrollIndicator={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: width,
    backgroundColor: 'white',
  },
  rowLetter: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.off,
    paddingLeft: 20,
  },
  buttonCountry: {
    backgroundColor: 'white',
    paddingTop: 5,
    paddingBottom: 5,
    height: 40,
    width: width,
    paddingLeft: 20,
    paddingRight: 20,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'OpenSans-SemiBold',
    color: colors.title,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center2: {
    // alignItems: 'center',
    justifyContent: 'center',
  },
});
