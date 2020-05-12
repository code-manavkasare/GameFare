import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  Image,
  Keyboard,
  Dimensions,
  View,
} from 'react-native';
import {Col, Row, Grid} from 'react-native-easy-grid';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import Contacts from 'react-native-contacts';
import CardUserSelect from '../../../layout/cards/CardUserSelect';

import colors from '../../../style/colors';
import styleApp from '../../../style/style';
import AllIcons from '../../../layout/icons/AllIcons';
import Loader from '../../../layout/loaders/Loader';

import Button from '../../../layout/buttons/Button';
import ButtonColor from '../../../layout/Views/Button';

const {width} = Dimensions.get('screen');

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
      let Contacts = contacts
        .filter((contact) => contact.phoneNumbers.length !== 0)
        .sort(function(a, b) {
          var textA = a.givenName.toUpperCase();
          var textB = b.givenName.toUpperCase();
          return textA < textB ? -1 : textA > textB ? 1 : 0;
        });
      // Contacts = Contacts.sort(function(a, b) {
      //   var textA = a.givenName.toUpperCase();
      //   var textB = b.givenName.toUpperCase();
      //   return textA < textB ? -1 : textA > textB ? 1 : 0;
      // });
      Contacts = Contacts.map((contact, i) => {
        let header = '';
        if (i == 0) {
          header = contact.givenName[0];
        } else if (Contacts[i - 1].givenName[0] !== Contacts[i].givenName[0]) {
          header = contact.givenName[0];
        }
        let contactToAdd = {
          id: contact.recordID,
          index: i,
          header: header,
          objectID: contact.recordID,
          displayPhone: true,
          info: {
            firstname: contact.givenName,
            lastname: contact.familyName,
            phoneNumber: contact.phoneNumbers[0].number,
          },
        };
        return contactToAdd;
      });
      return that.setState({
        contacts: Contacts,
        authorizedContact: true,
        allContacts: Contacts,
        initialLoader: false,
      });
    });
  }
  cardUser(user, i, usersSelected) {
    return (
      <CardUserSelect
        user={user}
        key={user.id}
        captain={false}
        usersSelected={usersSelected}
        selectUser={(selected, user, usersSelected) =>
          this.props.selectUser(selected, user, usersSelected)
        }
      />
    );
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
              <Col size={15} style={styleApp.center2}>
                <View
                  style={[
                    styleApp.center,
                    {
                      height: 40,
                      width: 40,
                      backgroundColor: colors.off,
                      borderRadius: 20,
                      borderWidth: 0.5,
                      borderColor: colors.off,
                    },
                  ]}>
                  <Text style={[styleApp.text, {fontSize: 11}]}>{initial}</Text>
                </View>
              </Col>
              <Col size={70} style={[styleApp.center2]}>
                <Text style={[styleApp.text, {fontSize: 14}]}>
                  {contact.givenName} {contact.familyName}
                </Text>
                <Text
                  style={[
                    styleApp.subtitle,
                    {fontSize: 12, marginTop: 4, color: colors.greyDark},
                  ]}>
                  {contact.phoneNumbers[0].number}
                </Text>
              </Col>
              <Col size={15} style={styleApp.center}>
                {Object.values(this.props.contactsSelected).filter(
                  (contact1) => contact1.recordID === contact.recordID,
                ).length != 0 ? (
                  <AllIcons
                    name="check"
                    type="mat"
                    color={colors.green}
                    size={22}
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
              (contact1) => contact1.recordID === contact.recordID,
            ).length !== 0,
          )
        }
        color={colors.white}
        style={{
          marginTop: 0,
          borderBottomWidth: 0.5,
          borderColor: colors.off,
          height: 55,
          paddingLeft: 20,
          paddingRight: 20,
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
        <Col style={styleApp.center} size={15}>
          <Text style={[styleApp.text, {fontSize: 12}]}>{letter}</Text>
        </Col>
        <Col size={85} />
      </Row>
    );
  }
  contact(contact, i) {
    const {usersSelected} = this.props;
    return (
      <View key={i}>
        {contact.header ? this.headerLetter(contact.header) : null}
        {this.cardUser(contact, i, usersSelected)}
      </View>
    );
  }

  handleScroll(event) {
    Keyboard.dismiss();
  }
  listContacts() {
    return (
      <View>
        {this.state.initialLoader ? (
          <View style={[styleApp.center4, {paddingTop: 130}]}>
            <Loader color={colors.primary} size={50} />
          </View>
        ) : !this.state.authorizedContact ? (
          this.viewNotAuthorized()
        ) : (
          this.state.contacts.map((contact, i) => this.contact(contact, i))
        )}
      </View>
    );
  }
  viewNotAuthorized() {
    return (
      <View
        style={[
          styleApp.center,
          {marginTop: 20, width: width - 40, marginLeft: 20},
        ]}>
        <Image
          source={require('../../../../img/animals/bird.png')}
          style={{height: 70, width: 70, marginBottom: 20}}
        />
        <Text style={styleApp.text}>
          We need to access your contacts. Please go to your settings and turn
          the contacts authorisation.
        </Text>

        <Button
          click={this.goToSettings.bind(this)}
          text={'Settings'}
          styleText={{color: colors.primary, fontSize: 14}}
          backgroundColor={'red'}
          styleButton={{
            height: 45,
            backgroundColor: 'white',
            marginBottom: 10,
            marginTop: 20,
          }}
          onPressColor={colors.redLight}
        />
        {/* <Button
          click={() => this.loadContacts()}
          text={'Load contacts'}
          backgroundColor={'primary'}
          styleText={{color: colors.primary, fontSize: 14}}
          styleButton={{
            height: 45,
            backgroundColor: 'white',
            marginBottom: 15,
          }}
          onPressColor={colors.primaryLight}
        /> */}
      </View>
    );
  }
  listContactsComponent() {
    return this.listContacts();
  }
  render() {
    return this.listContactsComponent();
  }
}

const styles = StyleSheet.create({
  content: {
    width: width,
    height: '100%',
    marginLeft: 0,
  },
  rowContactSelected: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
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
