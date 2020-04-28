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
  }
  async selectSport(sport) {
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
    const {sportSelected} = this.props;
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <View
              style={[
                {
                  borderColor:
                    sport.value === sportSelected ? colors.primary : 'white',
                  ...styles.button,
                },
              ]}>
              <AsyncImage
                style={styles.imgButton}
                mainImage={sport.card.img.imgSM}
                imgInitial={sport.card.img.imgXS}
              />
              {sport.card.img.icon && (
                <AsyncImage
                  style={styles.iconButon}
                  mainImage={sport.card.img.icon}
                  imgInitial={sport.card.img.icon}
                />
              )}
              <Text style={styles.textButton}>{sport.text}</Text>
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
      <FadeInView duration={200} style={{minHeight: height, marginTop: 20}}>
        <View style={[styleApp.marginView]}>
          <Text style={[styleApp.input, {fontSize: 24, marginBottom: 5}]}>
            Welcome to GameFare!
          </Text>
          <Text style={styleApp.subtitle}>
            Pick your sport, join groups and find events.
          </Text>
        </View>

        <View style={styles.rowButtons}>
          {this.props.sports.map((sport, i) => (
            <View style={styles.colButtons}>
              {this.button(sport, i + 1, sport.value)}
            </View>
          ))}
        </View>
      </FadeInView>
    );
  }
  render() {
    return (
      <View style={styleApp.stylePage}>
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={() => this.sportPage()}
          marginBottomScrollView={0}
          marginTop={0}
          offsetBottom={0}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    flex: 1,
  },
  button: {
    borderRadius: 15,
    width: 160,
    borderWidth: 3,
    height: 160,
    overflow: 'hidden',
    backgroundColor: colors.off,
  },
  imgButton: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  iconButon: {
    position: 'absolute',
    height: 23,
    width: 23,
    right: 5,
    top: 5,
  },
  textButton: {
    ...styleApp.textBold,
    ...styleApp.textShade,
    color: 'white',
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  subtitle: {
    ...styleApp.smallText,
    color: colors.title,
    marginBottom: 20,
    marginTop: 10,
    fontSize: 16,
  },
  rowButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    width: width,
  },
  colButtons: {
    height: 170,
    borderColor: colors.title,
    width: width / 2,
    flexDirection: 'column',
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

export default connect(
  mapStateToProps,
  {historicSearchAction},
)(InitialPage);
