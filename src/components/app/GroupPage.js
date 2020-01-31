import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Button,
  KeyboardAvoidingView,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import firebase from 'react-native-firebase';
import {connect} from 'react-redux';
import {createEventAction} from '../../actions/createEventActions';
import {groupsAction} from '../../actions/groupsActions';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
// import ParallaxKeyboardAwareScrollView from 'react-native-keyboard-aware-parallax-scroll-view';

const {height, width} = Dimensions.get('screen');
import colors from '../style/colors';
import styleApp from '../style/style';
import CardUser from './elementsEventPage/CardUser';
import {Grid, Row, Col} from 'react-native-easy-grid';
import FadeInView from 'react-native-fade-in-view';

import AsyncImage from '../layout/image/AsyncImage';
import AllIcons from '../layout/icons/AllIcons';
import HeaderBackButton from '../layout/headers/HeaderBackButton';
import Button2 from '../layout/buttons/Button';

import {indexGroups} from '../database/algolia';
import PlaceHolder from '../placeHolders/EventPage';

import DescriptionView from './elementsGroupPage/DescriptionView';
import MembersView from './elementsGroupPage/MembersView';
import PostsView from './elementsGroupPage/PostsView';
import EventsView from './elementsGroupPage/EventsView';
import ButtonColor from '../layout/Views/Button';
import GroupsEvent from './elementsGroupPage/GroupsEvent';


import {editGroup, removeUserFromGroup} from '../functions/editGroup';
import {takePicture, pickLibrary, resize} from '../functions/pictures';

const noEdit = {
  editMode: false,
  editPic: '',
  editName: '',
  editLocation: null,
  editDescription: '',
};

class GroupPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersConfirmed: true,
      loader: true,
      group: null,
      ...noEdit,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    console.log('GroupPage did mount');
    this.loadGroup(this.props.navigation.getParam('objectID'));
  }
  async loadGroup(objectID) {
    const that = this;
    firebase
      .database()
      .ref('groups/' + objectID)
      .on('value', async function(snap) {
        let group = snap.val();
        group.objectID = objectID;
        if (group.allMembers) {
          if (group.allMembers.includes(that.props.userID)) {
            await that.props.groupsAction('setAllGroups', {[objectID]: group});
          }
        }
        that.setState({group: group, loader: false});
      });
  }
  rowIcon(data, component, button, icon, alert, dataAlert, image) {
    return (
      <TouchableOpacity
        style={{marginTop: 20}}
        activeOpacity={alert ? 0.7 : 1}
        onPress={() =>
          alert &&
          this.props.navigation.navigate('AlertAddress', {data: dataAlert})
        }>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {image ? (
              image
            ) : (
              <AllIcons name={icon} color={colors.grey} size={18} type="font" />
            )}
          </Col>
          <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
            {component}
          </Col>
          <Col size={20} style={styleApp.center}>
            {button}
          </Col>
        </Row>
      </TouchableOpacity>
    );
  }
  title(text) {
    return <Text style={styleApp.text}>{text}</Text>;
  }

  groupInfo(data, sport) {
    return (
      <View style={{marginTop: -10}}>
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
            {this.state.editMode ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => this.nameRef.focus()}>
                <TextInput
                  style={styleApp.title}
                  placeholder={String(data.info.name)}
                  returnKeyType={'done'}
                  ref={(input) => {
                    this.nameRef = input;
                  }}
                  underlineColorAndroid="rgba(0,0,0,0)"
                  autoCorrect={true}
                  onChangeText={(text) => this.setState({editName: text})}
                  value={this.state.editName}
                />
              </TouchableOpacity>
            ) : (
              <Text style={styleApp.title}>{data.info.name}</Text>
            )}

            <View style={[styleApp.divider2, {marginBottom: 25}]} />
            <Row>
              <Col size={15} style={styleApp.center2}>
                <AsyncImage
                  style={{width: 35, height: 35, borderRadius: 17.5}}
                  mainImage={sport.card.img.imgM}
                  imgInitial={sport.card.img.imgSM}
                />
              </Col>
              <Col size={85} style={[styleApp.center2, {paddingLeft: 10}]}>
                <Text style={styleApp.text}>{sport.text}</Text>
              </Col>
            </Row>
            {this.rowIcon(
              data,
              this.title(
                this.state.editLocation === noEdit.editLocation
                  ? data.location.address
                  : this.state.editLocation.address,
              ),
              this.state.editMode ? (
                <ButtonColor
                  view={() => {
                    return <Text style={styleApp.text}>Edit</Text>;
                  }}
                  click={() =>
                    this.props.navigation.navigate('Location', {
                      location: data.location,
                      pageFrom: this.props.navigation.state.routeName,
                      onGoBack: (location) => {
                        this.props.navigation.navigate(
                          this.props.navigation.state.routeName,
                        );
                        this.setState({editLocation: location});
                      },
                    })
                  }
                  color="white"
                  onPressColor={colors.off}
                />
              ) : null,
              'map-marker-alt',
              'AlertAddress',
              data.location,
              <View
                style={[
                  styleApp.viewNumber,
                  styleApp.center,
                  {backgroundColor: 'white', borderWidth: 0},
                ]}>
                <AllIcons
                  name={'map-marker-alt'}
                  color={colors.grey}
                  size={18}
                  type="font"
                />
              </View>,
            )}
          </View>
        </View>

        <CardUser
          user={data.organizer}
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
          userID={this.props.userID}
          objectID={data.objectID}
        />
      </View>
    );
  }
  userAlreadyMember(members, userID,organizer) {
    if (!members) return false;
    return (members[userID] !== undefined || organizer === userID);
  }
  scrollToDescription () {
    this.scrollRef.scrollTo({y:200})
  }
  group(data, userID,userConnected) {
    if (!data || this.state.loader) return <PlaceHolder />;
    var sport = this.props.sports.filter(
      (sport) => sport.value === data.info.sport,
    )[0];
    return (
      <View style={{width: width}}>
        {this.groupInfo(data, sport)}

        <DescriptionView
          objectID={data.objectID}
          loader={this.state.loader}
          data={data}
          scrollToDescription={() => this.scrollToDescription()}
          editMode={this.state.editMode}
          onChangeText={(text) => this.setState({editDescription: text})}
          value={this.state.editDescription}
        />

        <MembersView
          data={data}
          objectID={data.objectID}
          userID={userID}
          loader={this.state.loader}
          infoUser={this.props.infoUser}
          editMode={this.state.editMode}
          onRemoveMember={(user) => this.askRemoveUser(data, user)}
        />

        {this.userAlreadyMember(data.members, userID,data.info.organizer) && userConnected && (
          <PostsView
            objectID={data.objectID}
            data={data}
            loader={this.state.loader}
            infoUser={this.props.infoUser}
          />
        )}

        <EventsView
          data={data}
          objectID={data.objectID}
          userID={userID}
          loader={this.state.loader}
          createEventAction={(val, data) =>
            this.props.createEventAction(val, data)
          }
          sport={sport}
          navigate={(val, data) => this.props.navigation.navigate(val, data)}
          push={(val, data) => this.props.navigation.push(val, data)}
        />

        
        

        {data.groups && (
          <View style={{marginTop: 35}}>
            <GroupsEvent groups={data.groups} />
          </View>
        )}

        <View style={{height: 100}} />
      </View>
    );
  }
  conditionAdmin() {
    if (!this.state.group) {
      return false;
    } else {
      return this.state.group.info.organizer === this.props.userID;
    }
    // *** getParam('pageFrom') returning undefined in some cases
    // *** are these conditions necessary?
    // else if (
    //   this.props.navigation.getParam('pageFrom') !== 'Home' &&
    //   this.state.group.info.organizer === this.props.userID &&
    //   this.state.group.info.public
    // ) {
    //   return true;
    // } else {
    //   return false;
    // }
  }
  async addPicture(val) {
    await this.setState({loader: true});
    if (val === 'take') {
      var uri = await takePicture();
    } else if (val === 'pick') {
      var uri = await pickLibrary();
    }
    if (!uri) return this.setState({loader: false});
    const uriResized = await resize(uri);
    if (!uriResized) return this.setState({loader: false});
    await this.setState({editPic: uriResized});
    this.setState({loader: false});
  }
  async askRemoveUser(data, user) {
    this.props.navigation.navigate('AlertYesNo', {
      textYesButton: 'Yes',
      textNoButton: 'No',
      title:
        'Are you sure you want to remove ' +
        user.info.firstname +
        ' ' +
        user.info.lastname +
        '?',
      icon: undefined,
      yesClick: () => this.removeUser(user.userID, data),
      noClick: () => null,
      onGoBack: () => this.props.navigation.navigate('Group'),
    });
  }
  async removeUser(playerID, group) {
    try {
      removeUserFromGroup(playerID, group);
    } catch (err) {
      console.log(err);
      return;
    }
    let index = group.allMembers.indexOf(playerID);
    delete group.allMembers[index];
    delete group.members[playerID];
    await this.props.groupsAction('setAllGroups', {[group.objectId]: group});
  }
  async saveEdits() {
    const {group} = this.state;
    if (
      this.state.editPic !== noEdit.editPic ||
      this.state.editName !== noEdit.editName ||
      this.state.editDescription !== noEdit.editDescription ||
      this.state.editLocation !== noEdit.editLocation
    ) {
      let newData = {
        ...group,
        img: this.state.editPic ? this.state.editPic : undefined, // gets deleted in editGroup
        info: {
          ...group.info,
          name:
            this.state.editName === noEdit.editName
              ? group.info.name
              : this.state.editName,
          description:
            this.state.editDescription === noEdit.editDescription
              ? group.info.description
              : this.state.editDescription,
        },
        location:
          this.state.editLocation === noEdit.editLocation
            ? group.location
            : this.state.editLocation,
      };
      // firebase update, sends notification to group members
      editGroup(newData, () => console.log('edit group failed'));
      // // local data update
      if (this.state.editPic !== noEdit.editPic) {
        await this.props.groupsAction('setAllGroups', {
          [newData.objectID]: {...newData, pictures: {0: this.state.editPic}},
        });
      } else {
        await this.props.groupsAction('setAllGroups', {
          [newData.objectID]: newData,
        });
      }
    }
    // this update
    this.setState({
      ...this.state,
      ...noEdit,
    });
  }
  goToShareGroup = (data) => {
    if (!this.props.userConnected) {
      return this.props.navigation.navigate('SignIn');
    }
    this.props.navigation.navigate('Contacts', {
      openPageLink: 'openGroupPage',
      pageTo: 'Group',
      objectID: data.objectID,
      pageFrom: 'Group',
      data: {...data, eventID: data.objectID},
    });
  };

  render() {
    const {dismiss} = this.props.navigation;
    const {group} = this.state;
    const {userID,userConnected} = this.props;
    return (
      <View
      style={{ flex: 1 }}
  >
        {this.conditionAdmin() ? (
          <HeaderBackButton
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={''}
            inputRange={[20, 50]}
            initialTitleOpacity={0}
            initialBackgroundColor={'transparent'}
            initialBorderColorIcon={colors.grey}
            typeIcon2={this.state.editMode ? 'font' : 'moon'}
            typeIconOffset={'font'}
            colorIconOffset={this.state.editMode ? colors.blue : 'white'}
            sizeIcon2={15}
            icon1="arrow-left"
            icon2={this.state.editMode ? 'camera' : 'share'}
            iconOffset="pen"
            clickButton1={() => dismiss()}
            clickButton2={() =>
              !this.state.editMode
                ? this.goToShareGroup(group)
                : this.props.navigation.navigate('AlertAddImage', {
                    title: 'Add picture',
                    onGoBack: (val) => this.addPicture(val),
                  })
            }
            clickButtonOffset={() =>
              this.setState({editMode: !this.state.editMode})
            }
          />
        ) : (
          <HeaderBackButton
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={''}
            inputRange={[20, 50]}
            initialTitleOpacity={0}
            initialBackgroundColor={'transparent'}
            initialBorderColorIcon={colors.grey}
            typeIcon2={'moon'}
            sizeIcon2={15}
            icon1="arrow-left"
            icon2="share"
            clickButton1={() => dismiss()}
            clickButton2={() => this.goToShareGroup(group)}
          />
        )}
        <ParallaxScrollView
          style={styles.parallaxScrollView}
          showsVerticalScrollIndicator={false}
          stickyHeaderHeight={100}
          outputScaleValue={6}
          fadeOutForeground={true}
          backgroundScrollSpeed={2}
          backgroundColor={'white'}
          onScroll={Animated.event([
            {nativeEvent: {contentOffset: {y: this.AnimatedHeaderValue}}},
          ])}
          scrollToOverflowEnabled={true}
          ref={(ref) => {
            this.scrollRef = ref;
          }}
          renderBackground={() => {
            if (group) {
              return (
                <AsyncImage
                  style={styles.mainImg}
                  mainImage={group.pictures[0]}
                  imgInitial={group.pictures[0]}
                />
              );
            }
          }}
          parallaxHeaderHeight={280}>
          {this.group(group, userID,userConnected)}
        </ParallaxScrollView>

        {!this.state.editMode ? null : (
          <FadeInView duration={300} style={styleApp.footerBooking}>
            <Button2
              icon={'next'}
              backgroundColor="green"
              onPressColor={colors.greenClick}
              styleButton={{marginLeft: 20, width: width - 40}}
              disabled={false}
              text="Save edits"
              loader={false}
              click={() => this.saveEdits()}
            />
          </FadeInView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  parallaxScrollView: {
    height: height,
    backgroundColor: 'white',
    overflow: 'hidden',
    position: 'absolute',
  },
  mainImg: {width: '100%', height: 280},
});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    allGroups: state.groups.allGroups,
    userConnected: state.user.userConnected,
  };
};

export default connect(mapStateToProps, {createEventAction, groupsAction})(
  GroupPage,
);
