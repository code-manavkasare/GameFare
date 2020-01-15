import React, {Component} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  Keyboard,
  Dimensions,
  View,
  Animated,
} from 'react-native';
import {Col, Row} from 'react-native-easy-grid';
import Permissions from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import branch from 'react-native-branch';
import SendSMS from 'react-native-sms';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {date} from '../../../layout/date/date';
import AllIcons from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';

import ListContacts from './ListContacts';
import {timing} from '../../../animations/animations';
import FooterContact from './FooterContact';
import sizes from '../../../style/sizes';
const {height, width} = Dimensions.get('screen');

export default class ContactsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      showAddContact: false,
      showShareIcons: true,
      copied: false,
      contactsSelected: {},
      search: '',
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
    };
    this.counter = 0;
    this.componentDidMount = this.componentDidMount.bind(this);
    this.translateYShare = new Animated.Value(0);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  componentDidMount() {}
  getContactSelected() {
    return this.state.contactsSelected;
  }

  goToSettings() {
    if (Platform.OS === 'ios') {
      Permissions.openSettings();
    } else {
      AndroidOpenSettings.appDetailsSettings();
    }
  }
  selectContact(contact, val) {
    if (!val) {
      this.setState({
        nameNewContact: '',
        phoneNewContact: '',
        showAddContact: false,
        contactsSelected: {
          ...this.state.contactsSelected,
          [contact.recordID]: contact,
        },
      });
    } else {
      this.deleteContact(contact);
    }
  }
  setFreeContact(contact) {
    if (this.state.freeContacts[contact] == undefined) {
      this.setState({
        freeContacts: {...this.state.freeContacts, [contact]: true},
      });
    } else {
      this.setState({
        freeContacts: {
          ...this.state.freeContacts,
          [contact]: !this.state.freeContacts[contact],
        },
      });
    }
  }
  deleteContact(contact) {
    var contacts = {...this.state.contactsSelected};
    delete contacts[contact.recordID];
    this.setState({contactsSelected: contacts});
  }
  widthCard(val) {
    return val.length * 8 + 25;
  }
  cardContactSelected(contact, key) {
    return (
      <View
        key={key}
        style={{
          height: 35,
          width: this.widthCard(contact.givenName + ' ' + contact.familyName),
        }}>
        <Row style={styles.cardContactSelected}>
          <Col size={75} style={styles.center}>
            <Text
              style={[
                styles.text,
                {color: 'white', fontSize: 11, fontFamily: 'OpenSans-SemiBold'},
              ]}>
              {contact.givenName} {contact.familyName}
            </Text>
          </Col>
          <Col
            size={30}
            style={styles.center}
            activeOpacity={0.7}
            onPress={() => {
              this.deleteContact(contact);
            }}>
            <FontIcon
              style={{marginTop: 0, marginRight: 5}}
              name="times-circle"
              color="white"
              size={13}
            />
          </Col>
        </Row>
      </View>
    );
  }
  listContacts() {
    return (
      <ListContacts
        openShareEvent={this.openShareEvent.bind(this)}
        onRef={(ref) => (this.listContactRef = ref)}
        translateYShare={this.translateYShare}
        contactsSelected={this.state.contactsSelected}
        selectContact={this.selectContact.bind(this)}
        deleteContact={this.deleteContact.bind(this)}
        setFreeContact={this.setFreeContact.bind(this)}
      />
    );
  }
  listContactsSelected() {
    if (Object.values(this.state.contactsSelected).length == 0) return null;
    return (
      <Row style={styles.rowContactSelected}>
        {Object.values(this.state.contactsSelected).map((contact, i) =>
          this.cardContactSelected(contact, i),
        )}
      </Row>
    );
  }

  changeSearch(search) {
    this.setState({search: search});
    if (search.toLowerCase() == '') {
      return this.listContactRef.setState({
        contacts: this.listContactRef.getContacts(),
      });
    }
    return this.listContactRef.setState({
      contacts: this.listContactRef
        .getContacts()
        .filter(
          (contact) =>
            contact.givenName.toLowerCase().search(search.toLowerCase()) !=
              -1 ||
            contact.familyName.toLowerCase().search(search.toLowerCase()) != -1,
        ),
    });
  }

  searchBar() {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styles.center}>
                <AllIcons
                  name="search"
                  type="font"
                  color={colors.grey}
                  size={16}
                />
              </Col>
              <Col size={55} style={[styles.center2, {paddingLeft: 15}]}>
                <TextInput
                  style={styleApp.input}
                  placeholder={'Search for contact...'}
                  returnKeyType={'done'}
                  blurOnSubmit={true}
                  ref={(input) => {
                    this.searchRef = input;
                  }}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  autoCorrect={true}
                  onChangeText={(text) => this.changeSearch(text)}
                  value={this.state.search}
                />
              </Col>
              {this.state.search != '' ? (
                <Col
                  size={15}
                  activeOpacity={0.7}
                  style={styles.center}
                  onPress={() => this.changeSearch('')}>
                  <FontIcon name="times-circle" color={'#eaeaea'} size={12} />
                </Col>
              ) : (
                <Col size={15}></Col>
              )}
              <Col
                size={15}
                activeOpacity={0.7}
                style={styles.center}
                onPress={() =>
                  this.props.navigation.navigate('NewContact', {
                    onGoBack: (data) => this.addNewContact(data),
                  })
                }>
                <FontIcon name={'user-plus'} color={colors.green} size={14} />
              </Col>
            </Row>
          );
        }}
        click={() => {
          this.searchRef.focus();
        }}
        color="white"
        style={{
          height: 55,
          width: width,
          borderBottomWidth: 0.5,
          borderColor: colors.off,
        }}
        onPressColor={colors.off}
      />
    );
  }
  addNewContact(data) {
    Keyboard.dismiss();
    var id = Math.random()
      .toString(36)
      .substring(7);
    this.selectContact(
      {
        color:
          '#' +
          (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6),
        givenName: data.name.split(' ')[0],
        recordID: id,
        familyName:
          data.name.split(' ')[1] == undefined ? '' : data.name.split(' ')[1],
        phoneNumbers: [{label: 'mobile', number: data.phoneNumber}],
      },
      false,
    );
    this.props.navigation.navigate('Contacts');
  }
  addContact() {
    if (this.state.showAddContact) {
      return (
        <View style={{width: width, marginLeft: -20}}>
          <Row style={{borderBottomWidth: 1, borderColor: '#eaeaea'}}>
            <Col size={15} style={styles.center}>
              <AllIcons
                name="user-alt"
                type="font"
                color={colors.primary}
                size={16}
              />
            </Col>
            <Col size={70} style={[styles.center2, {paddingLeft: 15}]}>
              <Row style={{height: 40}}>
                <Col style={styles.center2}>
                  <TextInput
                    style={styles.input}
                    placeholder={'Full contact name'}
                    returnKeyType={'done'}
                    blurOnSubmit={true}
                    underlineColorAndroid="rgba(0,0,0,0)"
                    autoCorrect={true}
                    onChangeText={(text) =>
                      this.setState({nameNewContact: text})
                    }
                    value={this.state.nameNewContact}
                  />
                </Col>
              </Row>
              <Row style={{height: 40}}>
                <Col style={styles.center2}>
                  <TextInput
                    style={styles.input}
                    placeholder={'Phone number'}
                    returnKeyType={'done'}
                    keyboardType={'phone-pad'}
                    blurOnSubmit={true}
                    underlineColorAndroid="rgba(0,0,0,0)"
                    autoCorrect={true}
                    onChangeText={(text) =>
                      this.setState({phoneNewContact: text})
                    }
                    value={this.state.phoneNewContact}
                  />
                </Col>
              </Row>
            </Col>
            {this.state.nameNewContact == '' ||
            this.state.phoneNewContact == '' ? (
              <Col size={15} style={styles.center}>
                <Text style={[styles.text, {color: '#eaeaea'}]}>Add</Text>
              </Col>
            ) : (
              <Col
                size={15}
                style={styles.center}
                activeOpacity={0.7}
                onPress={() =>
                  this.addNewContact(
                    this.state.nameNewContact,
                    this.state.phoneNewContact,
                  )
                }>
                <Text style={[styles.text, {color: colors.primary}]}>Add</Text>
              </Col>
            )}
          </Row>
        </View>
      );
    }
    return null;
  }
  shareEvent() {
    var infoEvent = this.props.navigation.getParam('data');
    if (this.props.navigation.getParam('openPageLink') === 'openGroupPage') {
      var description =
        'Join my group ' + infoEvent.info.name + ' by following the link!';
      var image = infoEvent.pictures[0];
    } else {
      var description =
        'Join my event ' +
        infoEvent.info.name +
        ' on ' +
        date(infoEvent.date.start, 'ddd, MMM D') +
        ' at ' +
        date(infoEvent.date.start, 'h:mm a') +
        ' by following the link!';
      var image = infoEvent.images[0];
    }

    branch
      .createBranchUniversalObject('canonicalIdentifier', {
        contentDescription: description,
        title: infoEvent.info.name,
        contentMetadata: {
          customMetadata: {
            eventID: infoEvent.objectID,
            action: this.props.navigation.getParam('openPageLink'),
            $uri_redirect_mode: '1',
            $og_image_url: image,
          },
        },
      })
      .then((branchUniversalObject) => {
        let shareOptions = {
          messageHeader: description,
          messageBody: description,
        };
        let linkProperties = {
          channel: 'facebook',
        };
        let controlParams = {
          $desktop_url: 'https://getgamefare.com',
        };
        branchUniversalObject
          .showShareSheet(shareOptions, linkProperties, controlParams)
          .then((channel, completed, error) => {});
      });
  }
  openShareEvent(val) {
    if (val == true) {
      return Animated.timing(this.translateYShare, timing(-55, 400)).start();
    }
    return Animated.timing(this.translateYShare, timing(0, 400)).start();
  }
  rowShare() {
    return (
      <ButtonColor
        view={() => {
          return (
            <Row>
              <Col size={15} style={styleApp.center}>
                <AllIcons
                  name="share"
                  type="moon"
                  color={colors.primary}
                  size={17}
                />
              </Col>
              <Col size={85} style={[styleApp.center2, {paddingLeft: 15}]}>
                <Text style={[styleApp.input, {fontSize: 14}]}>
                  Share on Facebook, Messenger...
                </Text>
              </Col>
            </Row>
          );
        }}
        click={() => {
          this.shareEvent();
        }}
        color="white"
        style={{
          height: 55,
          width: width,
          borderBottomWidth: 0.5,
          borderColor: colors.off,
        }}
        onPressColor={colors.off}
      />
    );
  }
  async sendSMS() {
    var contacts = this.state.contactsSelected;

    var infoEvent = this.props.navigation.getParam('data');
    if (this.props.navigation.getParam('openPageLink') === 'openGroupPage') {
      var description =
        'Join my group ' + infoEvent.info.name + ' by following the link!';
      var image = infoEvent.pictures[0];
    } else {
      var description =
        'Join my event ' +
        infoEvent.info.name +
        ' on ' +
        date(infoEvent.date.start, 'ddd, MMM D') +
        ' at ' +
        date(infoEvent.date.start, 'h:mm a') +
        ' by following the link!';
      var image = infoEvent.images[0];
    }
    let branchUniversalObject = await branch.createBranchUniversalObject(
      'canonicalIdentifier',
      {
        contentDescription: description,
        title: infoEvent.info.name,
        contentMetadata: {
          customMetadata: {
            eventID: infoEvent.objectID,
            action: this.props.navigation.getParam('openPageLink'),
            $uri_redirect_mode: '1',
            $og_image_url: image,
          },
        },
      },
    );

    let linkProperties = {feature: 'share', channel: 'GameFare'};
    let controlParams = {$desktop_url: 'http://getgamefare.com'};

    let {url} = await branchUniversalObject.generateShortUrl(
      linkProperties,
      controlParams,
    );

    var phoneNumbers = Object.values(contacts).map(
      (contact) => contact.phoneNumbers[0].number,
    );
    SendSMS.send(
      {
        body: description + ' ' + url,
        recipients: phoneNumbers,
        successTypes: ['sent', 'queued'],
        allowAndroidSendWithoutReadPermission: true,
      },
      (completed, cancelled, error) => {
        if (cancelled || error) {
          return true;
        }
        return this.props.navigation.dismiss();
      },
    );
  }
  icon1Header() {
    if (
      this.props.navigation.getParam('pageFrom') == 'CreateEvent3' ||
      this.props.navigation.getParam('pageFrom') == 'CreateGroup1'
    )
      return null;
    return 'times';
  }
  icon2Header() {
    if (
      this.props.navigation.getParam('pageFrom') == 'CreateEvent3' ||
      this.props.navigation.getParam('pageFrom') == 'CreateGroup1'
    )
      return 'text';
    return null;
  }
  pageFromNextPage() {
    if (this.props.navigation.getParam('pageFrom') == 'CreateEvent3')
      return 'Home';
    else if (this.props.navigation.getParam('pageFrom') == 'CreateGroup1')
      return 'LstGroups';
    return 'Home';
  }
  render() {
    const {dismiss} = this.props.navigation;
    return (
      <View style={{height: height}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Invite your friends'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1={this.icon1Header()}
          icon2={this.icon2Header()}
          text2="Skip"
          clickButton2={() => dismiss()}
          clickButton1={() => dismiss()}
        />

        <View style={{marginTop: sizes.heightHeaderHome}}>
          {this.rowShare()}
          {this.searchBar()}

          {this.listContacts()}
        </View>

        <FooterContact
          sendSMS={this.sendSMS.bind(this)}
          deleteContact={this.deleteContact.bind(this)}
          contactsSelected={this.state.contactsSelected}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    width: '100%',
    marginBottom: 10,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContactSelected: {
    width: width,
    flexDirection: 'row',
    marginLeft: -20,
    borderBottomWidth: 0.3,
    borderColor: colors.borderColor,
    flexWrap: 'wrap',
    backgroundColor: 'white',
  },
  cardContactSelected: {
    backgroundColor: '#89DB87',
    margin: 5,
    borderRadius: 5,
  },
  center2: {
    justifyContent: 'center',
  },
  input: {
    color: colors.title,
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  roundView: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: colors.off,
  },
  text: {
    color: colors.title,
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
  },
});
