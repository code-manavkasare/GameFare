import React, {Component} from 'react';
import {Image, Text, View, TouchableOpacity, Dimensions} from 'react-native';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';

import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createBottomTabNavigator} from 'react-navigation-tabs';

import {lockedPortrait, lockedLandscape} from '../hoc/orientation';

import colors from '../style/colors';
import styles from '../style/style';
import MainTabIcon from './navigationElements/MainTabIcon.js';

import HomePage from '../app/HomePage';
import StreamPage from '../app/StreamPage';
import ProfilePage from '../app/ProfilePage';
import Wallet from '../app/elementsUser/elementsProfile/Wallet';
import Settings from '../app/elementsUser/elementsProfile/Settings';
import EventPage from '../app/EventPage';
import MapPage from '../app/elementsHome/MapPage';
import MapFiltersModals from '../app/elementsHome/MapFiltersModal';

import GroupPage from '../app/GroupPage';
import Checkout from '../app/elementsJoining/Checkout';
import Coach from '../app/elementsJoining/Coach';

import Phone from '../login/Phone';
import Verify from '../login/Verify';
import Complete from '../login/Complete';
import ListCountry from '../login/elementsFlags/ListCountry';

import CreateEvent0 from '../app/elementsEventCreate/Page0';
import CreateEvent1 from '../app/elementsEventCreate/Page1';
import CreateEvent2 from '../app/elementsEventCreate/Page2';
import CreateEvent3 from '../app/elementsEventCreate/Page3';
import Contacts from '../app/elementsEventCreate/elementsContacts/Contacts';
import NewContact from '../app/elementsEventCreate/elementsContacts/NewContact';

import CreateGroup0 from '../app/elementsGroupCreate/Page0';

import PickMembers from '../app/elementsCreateChallenge/PickMembers';
import PickInfos from '../app/elementsCreateChallenge/PickInfos';
import PickAddress from '../app/elementsCreateChallenge/PickAddress';

import LocationSelector from '../app/elementsEventCreate/LocationSelector';
import DateSelector from '../app/elementsEventCreate/DateSelector';

import Activity from '../app/elementsActivity/Activity';

import Payments from '../app/elementsUser/elementsPayment/Payments';
import NewCard from '../app/elementsUser/elementsPayment/NewCard';
import NewMethod from '../app/elementsUser/elementsPayment/NewMethod';
import NewBankAccount from '../app/elementsUser/elementsPayment/NewBankAccount';
import CreateConnectAccount from '../app/elementsUser/elementsPayment/CreateConnectAccount';
import DetailCard from '../app/elementsUser/elementsPayment/DetailCard';
import Scan from '../app/elementsUser/elementsPayment/Scan';
import ApplePay from '../app/elementsUser/elementsPayment/ApplePay';

import Alert from '../layout/alerts/Alert';
import AlertAddress from '../layout/alerts/AlertAddress';
import AlertCall from '../layout/alerts/AlertCall';
import AlertAddImage from '../layout/alerts/AlertAddImage';
import AlertAddUsers from '../layout/alerts/AlertAddUsers';
import AlertYesNo from '../layout/alerts/AlertYesNo';

import InitialPage from '../app/elementsOnBoard/InitialPage';
import SportSelect from '../app/elementsOnBoard/SportSelect';
import LocationSelect from '../app/elementsOnBoard/LocationSelect';

import MessageList from '../app/elementsMessage/MessageList';
import Conversation from '../app/elementsMessage/Conversation';
import NewConversation from '../app/elementsMessage/NewConversation';

import LiveStream from '../app/elementsStreaming/LiveStream';
import Calibration from '../app/elementsStreaming/Calibration';

import AddPlayers from '../app/elementsStreamResults/AddPlayers';
import MatchPictures from '../app/elementsStreamResults/MatchPictures';
import StreamResults from '../app/elementsStreamResults/StreamResults';

const CreateEventNavigator = createStackNavigator(
  {
    CreateEvent0: lockedPortrait(CreateEvent0),
    CreateEvent1: lockedPortrait(CreateEvent1),
    CreateEvent2: lockedPortrait(CreateEvent2),
    CreateEvent3: lockedPortrait(CreateEvent3),
  },
  {
    initialRouteName: 'CreateEvent0',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const CreateGroupNavigator = createStackNavigator(
  {
    CreateGroup0: lockedPortrait(CreateGroup0),
  },
  {
    initialRouteName: 'CreateGroup0',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const CreateChallengeNavigator = createStackNavigator(
  {
    PickMembers: lockedPortrait(PickMembers),
    PickInfos: lockedPortrait(PickInfos),
    PickAddress: lockedPortrait(PickAddress),
  },
  {
    initialRouteName: 'PickMembers',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const ContactNavigator = createStackNavigator(
  {
    Contacts: {
      screen: lockedPortrait(Contacts),
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: true,
      },
    },
    NewContact: lockedPortrait(NewContact),
  },
  {
    initialRouteName: 'Contacts',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const JoinNavigator = createStackNavigator(
  {
    Checkout: lockedPortrait(Checkout),
    Event: lockedPortrait(EventPage),
    Coach: lockedPortrait(Coach),
  },
  {
    initialRouteName: 'Event',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const JoinGroupNavigator = createStackNavigator(
  {
    Group: lockedPortrait(GroupPage),
  },
  {
    initialRouteName: 'Group',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const MessageNavigator = createStackNavigator(
  {
    Conversation: lockedPortrait(Conversation),
  },
  {
    initialRouteName: 'Conversation',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const ProfileNavigator = createStackNavigator(
  {
    More: lockedPortrait(ProfilePage),
    Wallet: lockedPortrait(Wallet),
    Settings: lockedPortrait(Settings),
  },
  {
    initialRouteName: 'More',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const LoginNavigator = createStackNavigator(
  {
    Phone: lockedPortrait(Phone),
    Verify: lockedPortrait(Verify),
    Complete: lockedPortrait(Complete),
  },
  {
    initialRouteName: 'Phone',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const PaymentsNavigator = createStackNavigator(
  {
    Payments: lockedPortrait(Payments),
    NewCard: lockedPortrait(NewCard),
    ApplePay: lockedPortrait(ApplePay),
    NewMethod: lockedPortrait(NewMethod),
    NewBankAccount: lockedPortrait(NewBankAccount),
    CreateConnectAccount: lockedPortrait(CreateConnectAccount),
    DetailCard: lockedPortrait(DetailCard),
    Scan: lockedPortrait(Scan),
  },
  {
    initialRouteName: 'Payments',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const StreamNavigator = createStackNavigator(
  {
    LiveStream: lockedLandscape(LiveStream),
    Calibration: lockedLandscape(Calibration),
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
    initialRouteName: 'AddPlayers',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const MainApp = createBottomTabNavigator(
  {
    Home: lockedPortrait(HomePage),
    Activity: lockedPortrait(Activity),
    Stream: lockedPortrait(StreamPage),
    MessageList: lockedPortrait(MessageList),
    More: ProfileNavigator,
  },
  {
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({focused, tintColor}) => {
        const {routeName} = navigation.state;
        return (
          <MainTabIcon
            navigation={navigation}
            focused={focused}
            tintColor={tintColor}
            routeName={routeName}
          />
        );
      },
    }),
    tabBarOptions: {
      activeTintColor: colors.primary2,
      inactiveTintColor: colors.title,
      // tabBarVisible:false,
      showLabel: false,
      style: [
        styles.shade,
        {
          borderTopWidth: 0.5,
          shadowOpacity: 0.04,
          backgroundColor: colors.blue,
          borderTopColor: colors.grey,
          height: 90,
          marginBottom: -35,
        },
      ],
    },
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: true,
  },
);

const InitialPageNavigator = createStackNavigator(
  {
    InitialPage: lockedPortrait(InitialPage),
    LocationSelect: {
      screen: lockedPortrait(LocationSelect),
      navigationOptions: {
        gesturesEnabled: true,
        cardShadowEnabled: true,
      },
    },
    SportSelect: {
      screen: lockedPortrait(SportSelect),
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },
    LocationOnBoard: {
      screen: lockedPortrait(LocationSelector),
      navigationOptions: {
        gesturesEnabled: true,
        cardShadowEnabled: true,
      },
    },
  },
  {
    initialRouteName: 'InitialPage',
    headerMode: 'none',
    mode: 'card',
    cardOverlayEnabled: false,
    cardShadowEnabled: true,
  },
);

const MainStack = createStackNavigator(
  {
    InitialPage: InitialPageNavigator,
    TabsApp: {
      screen: MainApp,
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: false,
      },
    },
    MapPage: {
      screen: lockedPortrait(MapPage),
      navigationOptions: {
        gesturesEnabled: true,
        cardShadowEnabled: false,
      },
    },
    Event: JoinNavigator,
    Conversation: MessageNavigator,
    Group: JoinGroupNavigator,
    LiveStream: StreamNavigator,
    CreateEvent1: CreateEventNavigator,
    CreateGroup1: CreateGroupNavigator,
    CreateChallenge: CreateChallengeNavigator,
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
    Payments: {
      screen: PaymentsNavigator,
      navigationOptions: {
        gesturesEnabled: false,
        cardShadowEnabled: true,
      },
    },
    Date: lockedPortrait(DateSelector),
    Location: lockedPortrait(LocationSelector),
    ContactNavigator: {
      screen: ContactNavigator,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    NewConversation: {
      screen: lockedPortrait(NewConversation),
      navigationOptions: {
        gesturesEnabled: false,
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
