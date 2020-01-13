import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Keyboard,
  Dimensions,
  FlatList,
  ScrollView,
  Animated,
  View,
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import Contacts from 'react-native-contacts';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import AllIcons from '../../../layout/icons/AllIcons';
import Loader from '../../../layout/loaders/Loader';

import sizes from '../../../style/sizes';
// import ScrollView from '../../../layout/scrollViews/ScrollView'
import Button from '../../../layout/buttons/Button';
import ButtonColor from '../../../layout/Views/Button';

const {height, width} = Dimensions.get('screen');

export default class ContactsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allContacts: [],
      contacts: [],
      showAddContact: false,
      contactsSelected: {},
      search: '',
      nameNewContact: '',
      phoneNewContact: '',
      freeContacts: {},
      alphabeth: [
        '',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ],
      authorizedContact: true,
      stickyHeader: [],
      initialLoader: true,
    };
    this.counter = 0;
    this.componentWillMount = this.componentWillMount.bind(this);
    this.scrollViewY = 0;
  }
  componentWillMount() {
    this.props.onRef(this);
    this.loadContacts();
  }
  getContactSelected() {
    return this.state.contactsSelected;
  }
  getContacts() {
    return this.state.allContacts;
  }

  goToSettings() {
    if (Platform.OS == 'ios') {
      Permissions.openSettings();
    } else {
      AndroidOpenSettings.appDetailsSettings();
    }
  }
  async loadContacts() {
    var that = this;
    Contacts.getAll((err, contacts) => {
      if (err) {
        return that.setState({
          contacts: [],
          authorizedContact: false,
          initialLoader: false,
        });
      }
      var Contacts = contacts.filter(
        (contact) => contact.phoneNumbers.length != 0,
      );
      var Contacts = Contacts.sort(function(a, b) {
        var textA = a.givenName.toUpperCase();
        var textB = b.givenName.toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });
      Contacts = Contacts.map((contact, i) => {
        contact.color =
          '#' +
          (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
        contact.index = i;
        if (i == 0) {
          contact.header = contact.givenName[0];
        } else if (Contacts[i - 1].givenName[0] != Contacts[i].givenName[0]) {
          contact.header = contact.givenName[0];
        }
        return contact;
      });
      return that.setState({
        contacts: Contacts,
        authorizedContact: true,
        allContacts: Contacts,
        initialLoader: false,
      });
    });
  }
  rowContact(contact, key) {
    var initial = contact.givenName[0] + contact.familyName[0];
    if (contact.familyName == '') {
      initial = contact.givenName[0];
    }
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styles.center}>
                <View
                  style={[
                    styleApp.center,
                    {
                      height: 30,
                      width: 30,
                      backgroundColor: contact.color,
                      borderRadius: 15,
                      borderWidth: 0.5,
                      borderColor: colors.off,
                    },
                  ]}>
                  <Text
                    style={[
                      styleApp.subtitle,
                      {
                        color: 'white',
                        fontSize: 11,
                        fontFamily: 'OpenSans-SemiBold',
                      },
                    ]}>
                    {initial}
                  </Text>
                </View>
              </Col>
              <Col size={70} style={[styles.center2, {paddingLeft: 15}]}>
                <Text style={[styles.input, {fontSize: 14}]}>
                  {contact.givenName} {contact.familyName}
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {fontSize: 12, marginTop: 4, color: colors.greyDark},
                  ]}>
                  {contact.phoneNumbers[0].number}
                  {/* • {contact.phoneNumbers[0].label} */}
                </Text>
              </Col>
              <Col size={15} style={styleApp.center}>
                {Object.values(this.props.contactsSelected).filter(
                  (contact1) => contact1.recordID == contact.recordID,
                ).length != 0 ? (
                  <AllIcons
                    name="check"
                    type="mat"
                    color={colors.green}
                    size={13}
                  />
                ) : null}
              </Col>
            </Row>
          );
        }}
        click={() =>
          this.props.selectContact(
            contact,
            Object.values(this.props.contactsSelected).filter(
              (contact1) => contact1.recordID == contact.recordID,
            ).length != 0,
          )
        }
        color={colors.white}
        style={{
          marginTop: 0,
          borderBottomWidth: 0.5,
          borderColor: colors.off,
          height: 55,
        }}
        onPressColor={colors.off}
      />
    );
  }
  headerLetter(letter) {
    return (
      <Row
        style={{
          height: 25,
          backgroundColor: colors.off2,
          borderBottomWidth: 0.5,
          borderColor: colors.off,
        }}>
        <Col style={styles.center} size={15}>
          <Text
            style={[
              styles.text,
              {fontSize: 12, fontFamily: 'OpenSans-SemiBold'},
            ]}>
            {letter}
          </Text>
        </Col>
        <Col size={85}></Col>
      </Row>
    );
  }
  contact(contact, i) {
    return (
      <View key={i}>
        {contact.header != undefined ? this.headerLetter(contact.header) : null}
        {this.rowContact(contact, i)}
      </View>
    );
  }

  handleScroll(event) {
    // this.setAnimation((event.nativeEvent.contentOffset.y > 64));
    // this.setState({ isNavBarHidden: !this.state.isNavBarHidden });
    // if (event.nativeEvent.contentOffset.y > this.scrollViewY) {
    //   this.props.openShareEvent(true)
    // } else {
    //   this.props.openShareEvent(false)
    // }
    // return this.scrollViewY = event.nativeEvent.contentOffset.y
  }
  listContacts() {
    return (
      <ScrollView
        keyboardShouldPersistTaps={true}
        onScroll={this.handleScroll.bind(this)}
        style={{
          height:
            height -
            sizes.heightHeaderHome -
            50 -
            sizes.heightFooterBooking -
            sizes.marginTopApp -
            25,
          marginBottom: sizes.heightFooterBooking,
        }}
        stickyHeaderIndices={this.state.stickyHeader}>
        {this.state.contacts.map((contact, i) => this.contact(contact, i))}
        <View style={{height: 70}} />
      </ScrollView>
    );
  }
  viewNotAuthorized() {
    return (
      <View
        style={[
          styles.center,
          {marginTop: 20, width: width - 40, marginLeft: 20},
        ]}>
        <Image
          source={require('../../../../img/animals/bird.png')}
          style={{height: 70, width: 70, marginBottom: 20}}
        />
        <Text style={[styles.text, {fontFamily: 'OpenSans-SemiBold'}]}>
          We need to access your contacts. Please go to your settings and turn
          the contacts authorisation.
        </Text>

        <Button
          click={this.goToSettings.bind(this)}
          text={'Settings'}
          styleText={{color: colors.primary, fontSize: 14}}
          styleButton={{
            height: 35,
            backgroundColor: 'white',
            marginBottom: 10,
            marginTop: 20,
          }}
          onPressColor="white"
        />
        <Button
          click={() => this.loadContacts()}
          text={'Load contacts'}
          styleText={{color: colors.primary, fontSize: 14}}
          styleButton={{height: 35, backgroundColor: 'white', marginBottom: 15}}
          onPressColor="white"
        />
      </View>
    );
  }
  listContactsComponent() {
    if (this.state.initialLoader)
      return (
        <View style={[styleApp.center, {marginTop: 130}]}>
          <Loader color="primary" size={20} />
        </View>
      );
    if (!this.state.authorizedContact) return this.viewNotAuthorized();
    return this.listContacts();
  }
  render() {
    return this.listContactsComponent();
  }
}

const styles = StyleSheet.create({
  content: {
    // height:height-sizes.marginTopApp-105-70,
    width: width,
    height: '100%',
    // paddingBottom:100,
    marginLeft: 0,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContactSelected: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
  },
  center2: {
    justifyContent: 'center',
  },
  input: {
    color: colors.title,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  text: {
    color: colors.title,
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
  },
  viewTick: {
    position: 'absolute',
    bottom: -7,
    right: -7,
    backgroundColor: colors.green,
    height: 18,
    width: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.6,
    borderColor: colors.off,
  },
});
