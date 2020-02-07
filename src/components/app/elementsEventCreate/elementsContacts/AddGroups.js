import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions, Animated} from 'react-native';
import {connect} from 'react-redux';
import firebase from 'react-native-firebase';
import ramda from 'ramda';
import Toast from 'react-native-easy-toast';
import PropTypes from 'prop-types';

import {Col, Row} from 'react-native-easy-grid';
import Button from '../../../layout/buttons/Button';
import ButtonColor from '../../../layout/Views/Button';
import LinearGradient from 'react-native-linear-gradient';
import NavigationService from '../../../../../NavigationService';

import ScrollView from '../../../layout/scrollViews/ScrollView';
import AllIcons from '../../../layout/icons/AllIcons';
import AsyncImage from '../../../layout/image/AsyncImage';
import {indexGroups} from '../../../database/algolia';
import SearchBarContact from './SearchBarContact';

import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import {heightSwitch, heightShareEventSocials} from './Contacts';

const {height, width} = Dimensions.get('screen');

class AddGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listGroups: [],
      selectedGroups: {},
      searchInputGroups: this.props.searchString,
      loaderSearchCall: true,
      loaderDatabaseUpdate: false,
      loaderButton: false,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.initiaLoad();
  }
  initiaLoad = async () => {
    const {userID, objectID, pageFrom} = this.props;

    indexGroups.clearCache();
    const listGroups = await indexGroups.search({
      filters: 'info.organizer:' + userID + ' AND NOT objectID:' + objectID,
      query: '',
    });
    const selectedGroups = this.checkIfGroupHasEvent(
      listGroups.hits,
      objectID,
      pageFrom,
    );
    //Will work when Algolia update accordingly with firebase

    await this.setState({
      loaderSearchCall: false,
      listGroups: listGroups.hits,
      selectedGroups,
    });
    return true;
  };

  checkIfGroupHasEvent = (listGroups, eventID, pageFrom) => {
    let groupsHasEvent = {};
    if (pageFrom === 'Event') {
      listGroups.forEach((group) => {
        if (group.events && group.events[eventID]) {
          groupsHasEvent = ramda.assoc(group.objectID, group, groupsHasEvent);
        }
      });
    } else {
      listGroups.forEach((group) => {
        if (group.groups && group.groups[eventID]) {
          groupsHasEvent = ramda.assoc(group.objectID, group, groupsHasEvent);
        }
      });
    }
    return groupsHasEvent;
  };

  searchGroups = async (text) => {
    this.props.changeSearchGroups(text);
    await this.setState({loaderSearchCall: true});
    indexGroups.clearCache();

    let listGroups = await indexGroups.search({
      filters: 'info.organizer:' + this.props.userID,
      query: text,
    });

    await this.setState({
      listGroups: listGroups.hits,
      searchInputGroups: text,
      loaderSearchCall: false,
    });
  };

  selectGroup(group) {
    var selectedGroups = this.state.selectedGroups;
    if (
      Object.values(selectedGroups).filter(
        (group1) => group1.objectID === group.objectID,
      ).length == 0
    ) {
      selectedGroups = {
        ...selectedGroups,
        [group.objectID]: group,
      };
    } else {
      delete selectedGroups[group.objectID];
    }
    this.setState({selectedGroups: selectedGroups});
  }

  placeHolder() {
    return (
      <View style={[styles.rowGroup, {flex: 1}]}>
        <Row style={{marginLeft: 20, width: width - 40}}>
          <Col size={15} style={styleApp.center2}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{width: '100%', height: 40, borderRadius: 6}}
            />
          </Col>
          <Col size={75} style={[styleApp.center2, {paddingLeft: 15}]}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{width: '60%', height: 14, borderRadius: 2}}
            />
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={[colors.placeHolder1, colors.placeHolder2]}
              style={{width: '10%', height: 8, borderRadius: 2, marginTop: 3}}
            />
          </Col>
        </Row>
      </View>
    );
  }
  rowGroup(group, i) {
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row
              style={{
                paddingTop: 10,
                paddingBottom: 10,
              }}>
              <Col size={15} style={styleApp.center2}>
                <AsyncImage
                  style={{width: '100%', height: 40, borderRadius: 3}}
                  mainImage={group.pictures[0]}
                  imgInitial={group.pictures[0]}
                />
              </Col>
              <Col size={80} style={[styleApp.center2, {paddingLeft: 15}]}>
                <Text style={styleApp.text}>{group.info.name}</Text>
                <Text style={[styleApp.smallText, {fontSize: 12}]}>
                  {group.info.sport.charAt(0).toUpperCase() +
                    group.info.sport.slice(1)}
                </Text>
              </Col>
              <Col size={10} style={styleApp.center}>
                {Object.values(this.state.selectedGroups).filter(
                  (group1) => group1.objectID === group.objectID,
                ).length != 0 ? (
                  <AllIcons
                    name="check-circle"
                    type="font"
                    size={23}
                    color={colors.primary}
                  />
                ) : (
                  <AllIcons
                    name="circle"
                    type="font"
                    size={23}
                    color={colors.greyDark}
                  />
                )}
              </Col>
            </Row>
          );
        }}
        click={() => this.selectGroup(group)}
        color="white"
        style={[styles.rowGroup, {flex: 1}]}
        onPressColor={colors.off}
      />
    );
  }
  listGroupPage() {
    return <View>{this.listGroups()}</View>;
  }
  listGroups() {
    if (this.state.loaderSearchCall)
      return (
        <View>
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
          {this.placeHolder()}
        </View>
      );
    if (this.state.listGroups.length === 0)
      return (
        <Text style={[styleApp.text, {marginTop: 20, paddingHorizontal: 20}]}>
          You haven't created any groups yet. Please create one first.
        </Text>
      );
    return (
      <View>
        {this.state.listGroups.map((group, i) => this.rowGroup(group, i))}
      </View>
    );
  }
  alertDone(val, nameEvent, selectedGroups) {
    if (!val)
      return NavigationService.navigate('Alert', {
        close: true,
        title: 'Congrats, ' + nameEvent + ' has been successfully updated.',
        textButton: 'Got it!',
        icon: (
          <AllIcons
            name="check-circle"
            color={colors.green}
            size={20}
            type="font"
          />
        ),
      });

    const groupsAlert = Object.values(selectedGroups).map((group) => {
      return {
        info: {
          firstname: group.info.name,
          picture: group.pictures[0],
        },
      };
    });
    return NavigationService.navigate('AlertAddUsers', {
      close: true,
      title: 'Congrats, you have added group(s) to ' + nameEvent + '.',
      users: groupsAlert,
      textButton: 'Got it!',
      icon: (
        <AllIcons
          name="check-circle"
          color={colors.green}
          size={20}
          type="font"
        />
      ),
    });
  }
  async submit(pageFrom) {
    await this.setState({loaderButton: true});
    const {objectID, nameEvent} = this.props;
    const {selectedGroups} = this.state;
    let valueAlert = Object.values(selectedGroups).length !== 0;
    this.state.listGroups.forEach(async (group) => {
      const hasGroup = ramda.has(group.objectID);
      let updatesGroup = {};
      let updatesEvent = {};
      if (pageFrom === 'Event') {
        if (hasGroup(selectedGroups)) {
          updatesGroup['/events/' + objectID] = true;
          updatesEvent['/groups/' + group.objectID] = true;

          await firebase
            .database()
            .ref('groups/' + group.objectID)
            .update(updatesGroup);

          await firebase
            .database()
            .ref('events/' + objectID)
            .update(updatesEvent);
        } else if (!hasGroup(selectedGroups)) {
          await firebase
            .database()
            .ref('groups/' + group.objectID + '/events/' + objectID)
            .remove();

          await firebase
            .database()
            .ref('events/' + objectID + '/groups/' + group.objectID)
            .remove();
        }
      } else {
        if (hasGroup(selectedGroups)) {
          updatesGroup['/groups/' + objectID] = true;
          updatesEvent['/groups/' + group.objectID] = true;

          await firebase
            .database()
            .ref('groups/' + group.objectID)
            .update(updatesGroup);

          await firebase
            .database()
            .ref('groups/' + objectID)
            .update(updatesEvent);
        } else if (!hasGroup(selectedGroups)) {
          await firebase
            .database()
            .ref('groups/' + group.objectID + '/groups/' + objectID)
            .remove();
          await firebase
            .database()
            .ref('groups/' + objectID + '/groups/' + group.objectID)
            .remove();
        }
      }
    });
    this.alertDone(valueAlert, nameEvent, selectedGroups);
    await this.setState({loaderButton: false});
  }

  textButton() {
    const groupLength = Object.values(this.state.selectedGroups).length;
    if (groupLength === 1 || groupLength === 0)
      return 'Add ' + groupLength + ' group';
    return 'Add ' + groupLength + ' groups';
  }
  render() {
    const {searchInputGroups} = this.state;
    const {pageFrom} = this.props;
    return (
      <View style={styles.mainView}>
        <Toast
          ref="toast"
          style={styles.toast}
          position="center"
          fadeInDuration={750}
          fadeOutDuration={1000}
          opacity={0.8}
          textStyle={{color: 'white'}}
        />
        <SearchBarContact
          placeHolderMessage={'Search for GameFare Groups...'}
          updateSearch={this.searchGroups}
          searchString={searchInputGroups}
        />
        <ScrollView
          onRef={(ref) => (this.scrollViewRef = ref)}
          contentScrollView={this.listGroupPage.bind(this)}
          marginBottomScrollView={0}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          offsetBottom={90 + 60}
          showsVerticalScrollIndicator={true}
        />

        <View style={styleApp.footerBooking}>
          <View style={{marginLeft: 20, width: width - 40}}>
            <Button
              backgroundColor={'green'}
              onPressColor={colors.greenClick}
              text={this.textButton()}
              loader={this.state.loaderButton}
              click={() => this.submit(pageFrom)}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    height:
      height - sizes.heightHeaderHome - heightSwitch - heightShareEventSocials,
  },
  rowGroup: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderBottomWidth: 0.3,
    borderColor: colors.grey,
  },
  toast: {
    backgroundColor: colors.green,
  },
});

AddGroups.PropTypes = {
  searchString: PropTypes.string.isRequired,
  eventID: PropTypes.string.isRequired,
  changeSearchGroups: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(AddGroups);
