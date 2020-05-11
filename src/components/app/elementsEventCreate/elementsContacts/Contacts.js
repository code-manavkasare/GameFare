import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Keyboard,
  Dimensions,
  View,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import branch from 'react-native-branch';
import SendSMS from 'react-native-sms';
import SwitchSelector from 'react-native-switch-selector';
import FadeInView from 'react-native-fade-in-view';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {date} from '../../../layout/date/date';
import AllIcons from '../../../layout/icons/AllIcons';
import ButtonColor from '../../../layout/Views/Button';
import HeaderBackButton from '../../../layout/headers/HeaderBackButton';
import {sendSMSFunction} from '../../../functions/message';

import AddGroups from './AddGroups';
import AddUsers from './AddUsers';
import ListContacts from './ListContacts';
import {createBranchUrl} from '../../../database/branch';
import {native, timing} from '../../../animations/animations';
import {generateID} from '../../../functions/createEvent';
import FooterContact from './FooterContact';
import sizes from '../../../style/sizes';
import SearchBarContact from './SearchBarContact';

const {height, width} = Dimensions.get('screen');

class Contacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      showAddContact: false,
      showShareIcons: true,
      nameNewContact: '',
      phoneNewContact: '',
      copied: false,
      contactsSelected: {},
      searchInputContacts: '',
      searchInputGameFareUsers: '',
      searchInputGroups: '',
      activeView: 'gamefareUsers',
      fadeInDuration: 500,
    };
    this.counter = 0;
    this.translateYShare = new Animated.Value(0);
    this.addNewContact = this.addNewContact.bind(this);
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  getContactSelected() {
    return this.state.contactsSelected;
  }

  selectContact(val, contact, contactsSelected) {
    Keyboard.dismiss();
    if (!val) {
      this.setState({
        nameNewContact: '',
        phoneNewContact: '',
        showAddContact: false,
        contactsSelected: {
          ...this.state.contactsSelected,
          [contact.id]: contact,
        },
      });
    } else {
      this.deleteContact(contact);
    }
  }
  setFreeContact(contact) {
    if (!this.state.freeContacts[contact]) {
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
    delete contacts[contact.id];
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
          <Col size={75} style={styleApp.center}>
            <Text style={[styleApp.text, {color: 'white', fontSize: 11}]}>
              {contact.givenName} {contact.familyName}
            </Text>
          </Col>
          <Col
            size={30}
            style={styleApp.center}
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
        usersSelected={this.state.contactsSelected}
        selectUser={this.selectContact.bind(this)}
        deleteContact={this.deleteContact.bind(this)}
        setFreeContact={this.setFreeContact.bind(this)}
      />
    );
  }

  changeSearch = (search) => {
    this.setState({searchInputContacts: search});
    if (search.toLowerCase() === '') {
      return this.listContactRef.setState({
        contacts: this.listContactRef.getContacts(),
      });
    }
    return this.listContactRef.setState({
      contacts: this.listContactRef
        .getContacts()
        .filter(
          (contact) =>
            contact.info.firstname
              .toLowerCase()
              .search(search.toLowerCase()) !== -1 ||
            contact.info.lastname.toLowerCase().search(search.toLowerCase()) !==
              -1,
        ),
    });
  };
  changeSearchGameFareUsers = async (search) => {
    this.setState({searchInputGameFareUsers: search});
  };

  changeSearchGroups = (search) => {
    this.setState({searchInputGroups: search});
  };

  addNewContact(data) {
    Keyboard.dismiss();
    const contactID = generateID();
    this.selectContact(
      false,
      {
        info: {
          phoneNumber: data.phoneNumber,
          firstname: data.name.split(' ')[0],
          lastname: !data.name.split(' ')[1] ? '' : data.name.split(' ')[1],
        },
        id: contactID,
      },
      {},
    );
    this.props.navigation.navigate('Contacts');
  }
  addContact() {
    const {showAddContact, nameNewContact, phoneNewContact} = this.state;
    if (showAddContact) {
      return (
        <View style={{width: width, marginLeft: -20}}>
          <Row style={{borderBottomWidth: 1, borderColor: '#eaeaea'}}>
            <Col size={15} style={styleApp.center}>
              <AllIcons
                name="user-alt"
                type="font"
                color={colors.primary}
                size={16}
              />
            </Col>
            <Col size={70} style={[styleApp.center2, {paddingLeft: 15}]}>
              <Row style={{height: 40}}>
                <Col style={styleApp.center2}>
                  <TextInput
                    style={styleApp.input}
                    placeholder={'Full contact name'}
                    returnKeyType={'done'}
                    blurOnSubmit={true}
                    underlineColorAndroid="rgba(0,0,0,0)"
                    autoCorrect={true}
                    onChangeText={(text) =>
                      this.setState({nameNewContact: text})
                    }
                    value={nameNewContact}
                  />
                </Col>
              </Row>
              <Row style={{height: 40}}>
                <Col style={styleApp.center2}>
                  <TextInput
                    style={styleApp.input}
                    placeholder={'Phone number'}
                    returnKeyType={'done'}
                    keyboardType={'phone-pad'}
                    blurOnSubmit={true}
                    underlineColorAndroid="rgba(0,0,0,0)"
                    autoCorrect={true}
                    onChangeText={(text) =>
                      this.setState({phoneNewContact: text})
                    }
                    value={phoneNewContact}
                  />
                </Col>
              </Row>
            </Col>
            {nameNewContact === '' || phoneNewContact === '' ? (
              <Col size={15} style={styleApp.center}>
                <Text style={[styleApp.text, {color: '#eaeaea'}]}>Add</Text>
              </Col>
            ) : (
              <Col
                size={15}
                style={styleApp.center}
                activeOpacity={0.7}
                onPress={() =>
                  this.addNewContact(nameNewContact, phoneNewContact)
                }>
                <Text style={[styleApp.text, {color: colors.primary}]}>
                  Add
                </Text>
              </Col>
            )}
          </Row>
        </View>
      );
    }
    return null;
  }

  openShareEvent(val) {
    if (val)
      return Animated.timing(this.translateYShare, timing(-55, 400)).start();
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
        style={[styles.shareSocials]}
        onPressColor={colors.off}
      />
    );
  }

  createBranchMessage = async () => {
    const {route} = this.props;
    const {data, image, action} = route.params;
    const {url, description, title, objectID} = await createBranchUrl(
      data,
      action,
      image,
    );

    return {url, description, title, image, objectID, action};
  };
  async shareEvent() {
    const {
      url,
      description,
      title,
      image,
      objectID,
      action,
    } = await this.createBranchMessage();
    branch
      .createBranchUniversalObject('canonicalIdentifier', {
        contentDescription: description,
        title: title,
        contentMetadata: {
          customMetadata: {
            objectID: objectID,
            action: action,
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
          .then((channel, completed, error) => {
            console.log('completed', channel);
          });
      });
  }

  async sendSMS() {
    const {navigation} = this.props;
    const contacts = this.state.contactsSelected;
    const {url, description} = await this.createBranchMessage();

    const phoneNumbers = Object.values(contacts).map(
      (contact) => contact.info.phoneNumber,
    );
    const smsSent = await sendSMSFunction(
      phoneNumbers,
      description + ' ' + url,
    );

    if (smsSent.completed) return navigation.dangerouslyGetParent().pop();
    return true;
  }
  translateXView = (value, userConnected) => {
    if (!userConnected && (value === 'gamefareUsers' || value === 'groups'))
      return this.props.navigation.navigate('SignIn');
    this.setState({activeView: value});
  };

  render() {
    const {navigation, userConnected} = this.props;
    const {route} = this.props;
    const {objectID, pageFrom, data, action} = route.params;

    const {
      fadeInDuration,
      searchInputContacts,
      contactsSelected,
      searchInputGroups,
      searchInputGameFareUsers,
    } = this.state;

    return (
      <View style={{height: height}}>
        <HeaderBackButton
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          textHeader={'Invite your friends'}
          inputRange={[5, 10]}
          initialBorderColorIcon={'white'}
          initialBackgroundColor={'white'}
          initialTitleOpacity={1}
          icon1={'times'}
          text2="Skip"
          // clickButton2={() => dismiss()}
          clickButton1={() => navigation.dangerouslyGetParent().pop()}
        />

        <View
          style={[{marginTop: sizes.heightHeaderHome, marginHorizontal: 10}]}>
          {this.rowShare()}
          <SwitchSelector
            initial={0}
            onPress={(value) => this.translateXView(value, userConnected)}
            textStyle={[styleApp.textBold, {color: colors.greyDark}]}
            selectedTextStyle={[styleApp.textBold, {color: colors.white}]}
            textColor={colors.borderColor}
            selectedColor={colors.white}
            marginLeft={-10}
            buttonColor={colors.primary}
            borderColor={colors.borderColor}
            borderRadius={2}
            height={heightSwitch}
            animationDuration={190}
            options={
              this.props.userID === data.info.organizer &&
              action !== 'Challenge'
                ? [
                    {label: 'GameFare', value: 'gamefareUsers'},
                    {label: 'Groups', value: 'groups'},
                    {label: 'Contacts', value: 'contacts'},
                  ]
                : [
                    {label: 'GameFare', value: 'gamefareUsers'},
                    {label: 'Contacts', value: 'contacts'},
                  ]
            }
          />
        </View>

        <View>
          {this.state.activeView === 'contacts' && (
            <FadeInView duration={fadeInDuration}>
              <SearchBarContact
                navigation={this.props.navigation}
                placeHolderMessage={'Search for contact...'}
                updateSearch={this.changeSearch}
                showAddContact={true}
                addNewContact={this.addNewContact}
                searchString={searchInputContacts}
              />
              {this.listContacts()}

              <FooterContact
                sendSMS={this.sendSMS.bind(this)}
                deleteContact={this.deleteContact.bind(this)}
                contactsSelected={contactsSelected}
              />
            </FadeInView>
          )}
          {this.state.activeView === 'gamefareUsers' && (
            <FadeInView duration={fadeInDuration}>
              <AddUsers
                searchString={searchInputGameFareUsers}
                objectID={objectID}
                nameEvent={data.info.name}
                changeSearchGameFareUsers={this.changeSearchGameFareUsers}
                createBranchMessage={this.createBranchMessage}
              />
            </FadeInView>
          )}
          {this.state.activeView === 'groups' && (
            <FadeInView duration={fadeInDuration}>
              <AddGroups
                searchString={searchInputGroups}
                objectID={objectID}
                pageFrom={pageFrom}
                data={data}
                nameEvent={data.info.name}
                changeSearchGroups={this.changeSearchGroups}
              />
            </FadeInView>
          )}
        </View>
      </View>
    );
  }
}
export const heightSwitch = 50;
export const heightShareEventSocials = 55;

const styles = StyleSheet.create({
  cardContactSelected: {
    backgroundColor: '#89DB87',
    margin: 5,
    borderRadius: 5,
  },
  shareSocials: {
    height: heightShareEventSocials,
    width: width,
    marginLeft: -10,
    borderBottomWidth: 0,
    borderColor: colors.off,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps)(Contacts);
