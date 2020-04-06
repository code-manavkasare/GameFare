import MapPage from '../app/elementsHome/MapPage';
import MapFiltersModals from '../app/elementsHome/MapFiltersModal';

import Alert from '../layout/alerts/Alert';
import AlertAddress from '../layout/alerts/AlertAddress';
import AlertCall from '../layout/alerts/AlertCall';
import AlertAddImage from '../layout/alerts/AlertAddImage';
import AlertAddUsers from '../layout/alerts/AlertAddUsers';
import AlertYesNo from '../layout/alerts/AlertYesNo';

const StreamNavigator = createStackNavigator(
  {
    LiveStream: lockedPortrait(LiveStream),
    Calibration: lockedPortrait(Calibration),
    DrawLines: lockedPortrait(DrawLines),
  },
  {
    initialRouteName: 'Calibration',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const StreamResultsNavigator = createStackNavigator(
  {
    AddPlayers: lockedPortrait(AddPlayers),
    MatchPictures: lockedPortrait(MatchPictures),
    StreamResults: lockedPortrait(StreamResults),
  },
  {
    initialRouteName: 'MatchPictures',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const MainStack = createStackNavigator(
  {
    MapPage: {
      screen: lockedPortrait(MapPage),
      navigationOptions: {
        gesturesEnabled: true,
        cardShadowEnabled: false,
      },
    },
    Conversation: MessageNavigator,

    LiveStream: StreamNavigator,
    StreamResults: {
      screen: lockedPortrait(StreamResults),
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },
    OrganizeStreamResults: StreamResultsNavigator,
  },
  {
    initialRouteName: 'InitialPage',
    headerMode: 'none',
  },
);

const RootStack = createStackNavigator(
  {
    MainStack: MainStack,
    SignIn: LoginNavigator,
    ListCountry: {
      screen: lockedPortrait(ListCountry),
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    Alert: {
      screen: Alert,
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },
    AlertAddress: {
      screen: lockedPortrait(AlertAddress),
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },
    AlertCall: {
      screen: lockedPortrait(AlertCall),
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },
    AlertAddImage: lockedPortrait(AlertAddImage),
    AlertAddUsers: {
      screen: lockedPortrait(AlertAddUsers),
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },
    AlertYesNo: {
      screen: AlertYesNo,
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },

    MapFiltersModals: lockedPortrait(MapFiltersModals),
  },
  {
    initialRouteName: 'MainStack',
    headerMode: 'none',
    mode: 'modal',
    transparentCard: true,
    cardStyle: {opacity: 1},
    cardOverlayEnabled: false,
    navigationOptions: {
      gesturesEnabled: false,
    },
  },
);

export default createAppContainer(RootStack);
