import React, {Component} from 'react';
import database from '@react-native-firebase/database';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import branch from 'react-native-branch';
import FadeInView from 'react-native-fade-in-view';
import StatusBar from '@react-native-community/status-bar';

import {globaleVariablesAction} from '../../../actions/globaleVariablesActions';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import colors from '../../style/colors';
import styleApp from '../../style/style';
import Loader from '../../layout/loaders/Loader';

const {height, width} = Dimensions.get('screen');
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
  async componentDidMount() {
    var variables = await database()
      .ref('variables')
      .once('value');
    variables = variables.val();
    await this.props.globaleVariablesAction(variables);
    await this.goToHomePageDirectlyFromRefLink();
    await StatusBar.setBarStyle('dark-content', true);
    await StatusBar.setHidden(false, true);
    // if (this.props.sportSelected !== '' && this.props.leagueSelected !== '') {
    //   return this.props.navigation.navigate('TabsApp');
    // }
    return this.props.navigation.navigate('TabsApp');
  }

  goToHomePageDirectlyFromRefLink = async () => {
    branch.subscribe(async ({error, params}) => {
      if (error) return;
      const {objectID, action} = params;

      if (params['+clicked_branch_link']) {
        if (
          this.props.sportSelected === '' &&
          this.props.leagueSelected === ''
        ) {
          await this.initialSetupFromRefLink(
            action === 'Event' ? true : false,
            objectID,
          );
        }
        console.log('open link brancj', params);
        await this.props.navigation.navigate('TabsApp');
        if (action)
          return this.props.navigation.push(action, {objectID: objectID});
        return true;
      }
    });
  };

  initialSetupFromRefLink = async (isEvent, eventID) => {
    const eventFirebase = await database()
      .ref((isEvent ? '/events/' : '/groups/') + eventID)
      .once('value');
    const event = eventFirebase.val();

    this.props.historicSearchAction('setSport', {
      value: event.info.sport,
      league: 'all',
    });

    const {address, lat, lng} = event.location;
    this.props.historicSearchAction('setLocationSearch', {
      address,
      lat,
      lng,
    });
  };

  loader() {
    const {currentWidth, currentHeight} = this.props.currentScreenSize;
    return (
      <FadeInView
        duration={200}
        style={[styleApp.center, {height: currentHeight}]}>
        <View
          style={[
            styleApp.center,
            {height: 100, width: currentWidth, marginBottom: 0},
          ]}>
          <Animated.Image
            style={{width: 40, height: 40, position: 'absolute'}}
            source={require('../../../img/logos/logoWhite.png')}
          />
        </View>
        <View style={{position: 'absolute'}}>
          <Loader color={colors.white} size={100} type={2} speed={2.2} />
        </View>
      </FadeInView>
    );
  }
  render() {
    return (
      <View style={[{backgroundColor: colors.blue, height: height}]}>
        {this.loader()}
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    variables: state.globaleVariables,
    sportSelected: state.historicSearch.sport,
    leagueSelected: state.historicSearch.league,
    currentScreenSize: state.layout.currentScreenSize,
  };
};

export default connect(
  mapStateToProps,
  {
    globaleVariablesAction,
    historicSearchAction,
  },
)(InitialPage);
