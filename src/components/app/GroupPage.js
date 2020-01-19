import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Button,
  RefreshControl,
  Animated,
  Image,
  TextInput,
} from 'react-native';
import {connect} from 'react-redux';
import {createEventAction} from '../../actions/createEventActions';
import {groupsAction} from '../../actions/groupsActions';

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
import ParalaxScrollView from '../layout/scrollViews/ParalaxScrollView';
import ButtonColor from '../layout/Views/Button';

import {editGroup, removeUserFromGroup} from '../functions/editGroup';
import {takePicture,pickLibrary,resize} from '../functions/pictures';


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
      loader: false,
      ...noEdit,
    };
    this.AnimatedHeaderValue = new Animated.Value(0);
  }
  async componentDidMount() {
    if (!this.props.allGroups[this.props.navigation.getParam('objectID')]) {
      await this.setState({loader: true});
      this.loadGroup(this.props.navigation.getParam('objectID'));
    }
  }
  async loadGroup(objectID) {
    indexGroups.clearCache();
    var group = await indexGroups.getObject(objectID);
    await this.props.groupsAction('editGroup', group);
    return this.setState({loader: false});
  }
  rowIcon(data, component, button, icon, alert, dataAlert, image) {
    return (
      <TouchableOpacity
        style={{marginTop: 20}}
        activeOpacity={alert !== undefined ? 0.7 : 1}
        onPress={() =>
          alert != undefined
            ? this.props.navigation.navigate('AlertAddress', {data: dataAlert})
            : null
        }>
        <Row>
          <Col size={15} style={styleApp.center2}>
            {image != undefined ? (
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
            {this.state.editMode
              ? <TouchableOpacity
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
              : <Text style={styleApp.title}>{data.info.name}</Text>}

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
              this.title(this.state.editLocation === noEdit.editLocation
                ? data.location.address
                : this.state.editLocation.address),
              this.state.editMode
                ? <ButtonColor
                    view={() => {
                      return (
                        <Text style={styleApp.text}>
                          Edit
                        </Text>
                      );
                    }}
                    click={() => 
                      this.props.navigation.navigate('Location', {
                        location: data.location,
                        pageFrom: this.props.navigation.state.routeName,
                        onGoBack: (location) => {
                          this.props.navigation.navigate(this.props.navigation.state.routeName);
                          this.setState({editLocation: location});
                        },
                      })
                    }
                    color="white"
                    onPressColor={colors.off}
                  />
                : null,
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

            {/* 
            {this.rowIcon(
              data,
              this.title(data.organizer.name),
              'user-alt',
              undefined,
              undefined,
              <View
                style={[
                  styleApp.viewNumber,
                  styleApp.center,
                  {backgroundColor: colors.grey},
                ]}>
                <Text
                  style={[
                    styleApp.text,
                    {fontSize: 10, color: 'white', fontFamily: 'OpenSans-Bold'},
                  ]}>
                  {data.organizer.name.split(' ')[0][0] +
                    data.organizer.name.split(' ')[1][0]}
                </Text>
              </View>,
            )} */}
          </View>
        </View>

        <CardUser
          user={data.organizer}
          infoUser={this.props.infoUser}
          userConnected={this.props.userConnected}
          userID={this.props.userID}
        />
      </View>
    );
  }
  group(data) {
    if (!data || this.state.loader) return <PlaceHolder />;
    var sport = this.props.sports.filter(
      (sport) => sport.value === data.info.sport,
    )[0];
    return (
      <View style={{width: width, marginTop: 0}}>
        {this.groupInfo(data, sport)}

        <DescriptionView
          objectID={data.objectID}
          loader={this.state.loader}
          data={data}
          editMode={this.state.editMode}
          onChangeText={(text) => this.setState({editDescription: text})}
          value={this.state.editDescription}
        />

        <MembersView
          data={data}
          objectID={data.objectID}
          userID={this.props.userID}
          loader={this.state.loader}
          infoUser={this.props.infoUser}
          editMode={this.state.editMode}
          onRemoveMember={(user) => this.askRemoveUser(data, user)}
        />

        <EventsView
          data={data}
          objectID={data.objectID}
          userID={this.props.userID}
          loader={this.state.loader}
          createEventAction={(val, data) =>
            this.props.createEventAction(val, data)
          }
          sport={sport}
          navigate={(val, data) => this.props.navigation.navigate(val, data)}
          push={(val, data) => this.props.navigation.push(val, data)}
        />

        <PostsView
          objectID={data.objectID}
          data={data}
          loader={this.state.loader}
          infoUser={this.props.infoUser}
        />

        <View style={{height: 100}} />
      </View>
    );
  }
  conditionAdmin(data) {
    // what are the commented out conditions for?
    //this.props.navigation.getParam('pageFrom') !== 'Home' &&
    //data.info.public

    if (data.info.organizer === this.props.userID) return true;
    return false;
  }
  async refresh() {
    await this.setState({loader: true});
    return this.loadGroup(this.props.navigation.getParam('objectID'));
  }
  refreshControl() {
    return (
      <RefreshControl
        refreshing={this.state.loader}
        colors={['white']}
        progressBackgroundColor={'white'}
        tintColor="white"
        onRefresh={() => this.refresh()}
        size={'small'}
      />
    );
  }
  async addPicture(val) {
    await this.setState({loader:true});
    if (val === 'take') {
      var uri = await takePicture();
    } else if (val === 'pick') {
      var uri = await pickLibrary();
    }
    if (!uri) return this.setState({loader:false});
    const uriResized = await resize(uri);
    if (!uriResized) return this.setState({loader:false});
    await this.setState({editPic: uriResized});
    this.setState({loader:false});
  }
  async askRemoveUser(data, user) {
    console.log(user);
    console.log(data);
    this.removeUser(user.userID, data);
    // this.props.navigation.navigate('AlertYesNo', {
    //   textYesButton: 'Yes',
    //   textNoButton: 'No',
    //   title: 'Are you sure you want to remove ' + user.info.firstname + ' ' + user.info.lastname + '?',
    //   icon: undefined,
    //   yesClick: () => this.removeUser(user.userID, data),
    //   noClick: () => null,
    //   onGoBack: () => this.props.navigation.navigate('Group'),
    // });
  }
  async removeUser(playerID, group) {
    console.log('removeUser');
    console.log(group);
    try {
      removeUserFromGroup(playerID, group);
    } catch (err) {
      console.log(err);
      return;
    }
    let index = group.allMembers.indexOf(playerID);
    delete group.allMembers[index];
    delete group.members[playerID];
    console.log(group.members);
    await this.props.groupsAction('setAllGroups', {[group.objectId]: group});
  }
  async saveEdits(data) {
    if (
      this.state.editPic !== noEdit.editPic ||
      this.state.editName !== noEdit.editName ||
      this.state.editDescription !== noEdit.editDescription ||
      this.state.editLocation !== noEdit.editLocation
    ) {
      let newData = {
        ...data,
        img: this.state.editPic, //will get deleted in editGroup
        info: {
          ...data.info,
          name: this.state.editName === noEdit.editName ? data.info.name : this.state.editName,
          description: this.state.editDescription === noEdit.editDescription ? data.info.description : this.state.editDescription,
        },
        location: this.state.editLocation === noEdit.editLocation ? data.location : this.state.editLocation,
      };
      // firebase update, sends notification to group members
      editGroup(newData, () => console.log('edit group failed'));
      // // local data update
      if (this.state.editPic !== noEdit.editPic) {
        await this.props.groupsAction('setAllGroups', {[newData.objectID]: {...newData, pictures: {0: this.state.editPic}}});
      } else {
        await this.props.groupsAction('setAllGroups', {[newData.objectID]: newData});
      }
    }
    // this update
    this.setState({
      ...this.state,
      ...noEdit,
    });
  }
  render() {
    const {goBack, dismiss} = this.props.navigation;
    var data = this.props.allGroups[this.props.navigation.getParam('objectID')];

    console.log('render');
    console.log(this.props.allGroups);
    console.log(this.props.navigation.getParam('objectID'));
    console.log(data);
    console.log('editMode: ' + this.state.editMode);
    return (

      <View style={{flex: 1}}>
        {this.conditionAdmin(data)
        ? <HeaderBackButton
            AnimatedHeaderValue={this.AnimatedHeaderValue}
            textHeader={data !== undefined ? data.info.name.slice(0, 20) : ''}
            inputRange={[20, 50]}
            initialTitleOpacity={0}
            initialBackgroundColor={'transparent'}
            initialBorderColorIcon={colors.grey}
            typeIcon2={'moon'}
            typeIconOffset={'font'}
            sizeIcon2={15}
            icon1="arrow-left"
            icon2="share"
            iconOffset={this.state.editMode ? 'camera' : 'edit'}
            clickButton1={() => dismiss()}
            clickButton2={() =>
              this.props.navigation.navigate('Contacts', {
                openPageLink: 'openGroupPage',
                pageTo: 'Group',
                objectID: data.objectID,
                pageFrom: 'Group',
                data: {...data, eventID: data.objectID},
              })
            }
            clickButtonOffset={() =>
              !this.state.editMode
              ? this.setState({editMode: true})
              : this.props.navigation.navigate(
                  'AlertAddImage',
                  { title:'Add picture',
                    onGoBack:(val) => this.addPicture(val),
                  }
                )
            }
          />
        : <HeaderBackButton
              AnimatedHeaderValue={this.AnimatedHeaderValue}
              textHeader={data != undefined ? data.info.name.slice(0, 20) : ''}
              inputRange={[20, 50]}
              initialTitleOpacity={0}
              initialBackgroundColor={'transparent'}
              initialBorderColorIcon={colors.grey}
              typeIcon2={'moon'}
              sizeIcon2={15}
              icon1="arrow-left"
              icon2="share"
              // clickButton1 = {() => this.props.navigation.navigate(this.props.navigation.getParam('pageFrom'))}
              clickButton1={() => dismiss()}
              clickButton2={() =>
                this.props.navigation.navigate('Contacts', {
                  openPageLink: 'openGroupPage',
                  pageTo: 'Group',
                  objectID: data.objectID,
                  pageFrom: 'Group',
                  data: {...data, eventID: data.objectID},
                })
              }
            />
        }

        <ParalaxScrollView
          setState={(val) => this.setState(val)}
          AnimatedHeaderValue={this.AnimatedHeaderValue}
          image={
            //Does not register touches. Edit button changes to edit picture button
            <TouchableOpacity
              activeOpacity={0.3}
              style={{height: 280, width: '100%'}}
              onPress={() => {
                console.log('touch');
                this.props.navigation.navigate(
                  'AlertAddImage',
                  { title:'Add picture',
                    onGoBack:(val) => console.log(val),
                  }
                );
              }}>
                <View>
                  {data !== undefined
                    ? <AsyncImage
                        style={{width: '100%', height: 280, borderRadius: 0}}
                        mainImage={data.pictures[0]}
                        imgInitial={data.pictures[0]}
                      />
                    : <View
                        style={{
                          width: '100%',
                          height: 280,
                          borderRadius: 0,
                          backgroundColor: colors.off,
                        }}
                      />
                  }
                </View>
            </TouchableOpacity>
          }
          refresh={() => this.refresh()}
          content={() => this.group(data)}
          icon1="arrow-left"
          icon2="share"
          colorRefreshControl={colors.title}
          initialColorIcon={'white'}
        />

        {!this.state.editMode ? null :
        <FadeInView duration={300} style={styleApp.footerBooking}>
          <Button2
          icon={'next'}
          backgroundColor="green"
          onPressColor={colors.greenClick}
          styleButton={{marginLeft: 20, width: width - 40}}
          disabled={false}
          text="Save edits"
          loader={false}
          click={() => this.saveEdits(data)}
          />
        </FadeInView>
        }
      </View>
    );
  }
}

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
