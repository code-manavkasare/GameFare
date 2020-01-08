import React, {Component} from 'react';
import firebase from 'react-native-firebase';
import {View, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import branch from 'react-native-branch';
import FadeInView from 'react-native-fade-in-view';

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
    var variables = await firebase
      .database()
      .ref('variables')
      .once('value');
    variables = variables.val();
    await this.props.globaleVariablesAction(variables);
    await this.goToHomePageDirectlyFromRefLink();

    if (this.props.sportSelected !== '' && this.props.leagueSelected !== '') {
      return this.props.navigation.navigate('TabsApp');
    }
    return this.props.navigation.navigate('SportSelect');
  }

  goToHomePageDirectlyFromRefLink = async () => {
    branch.subscribe(async ({error, params}) => {
      if (error) {
        console.log('Error from Branch: ' + error);
        return;
      }
      const {eventID, action} = params;

      if (params['+clicked_branch_link']) {
        if (
          this.props.sportSelected === '' &&
          this.props.leagueSelected === ''
        ) {
          await this.initialSetupFromRefLink(
            action === 'openEventPage' ? true : false,
            eventID,
          );
        }
        this.props.navigation.navigate('TabsApp');
        if (action === 'openEventPage') {
          this.props.navigation.push('Event', {objectID: eventID});
        } else if (action === 'openGroupPage') {
          this.props.navigation.push('Group', {objectID: eventID});
        }
      }
    });
  };

  initialSetupFromRefLink = async (isEvent, eventID) => {
    const eventFirebase = await firebase
      .database()
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
    return (
      <FadeInView duration={200} style={[styleApp.center, {height: height}]}>
        <View
          style={[
            styleApp.center,
            {height: 70, width: width, marginBottom: 0},
          ]}>
          <Animated.Image
            style={{width: 35, height: 35, position: 'absolute'}}
            source={require('../../../img/logos/logoWhite.png')}
          />
          {/* <Animated.Text style={[styleApp.title,{color:'white',transform:[{translateX:this.translateXText}]}]}>GameFare</Animated.Text> */}
        </View>
        <View style={{position: 'absolute'}}>
          <Loader color="white" size={60} />
        </View>
      </FadeInView>
    );
  }
  render() {
    return (
      <View
        style={[
          {borderLeftWidth: 0, backgroundColor: colors.blue, height: height},
        ]}>
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
  };
};

export default connect(mapStateToProps, {
  globaleVariablesAction,
  historicSearchAction,
})(InitialPage);
