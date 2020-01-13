import React, {Component, PureComponent} from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Image,
  ScrollView,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import FadeInView from 'react-native-fade-in-view';
import AsyncImage from '../../layout/image/AsyncImage';
import NavigationService from '../../../../NavigationService';
import {getZone} from '../../functions/location';

import {Col, Row, Grid} from 'react-native-easy-grid';
import colors from '../../style/colors';
import Icon from '../../layout/icons/icons';
import AllIcons from '../../layout/icons/AllIcons';
import PlacelHolder from '../../placeHolders/CardEvent.js';
import ButtonColor from '../../layout/Views/Button';
import styleApp from '../../style/style';
import {indexEvents} from '../../database/algolia';
import {timing, native} from '../../animations/animations';

var {height, width} = Dimensions.get('screen');
import {date, time, timeZone} from '../../layout/date/date';

class CardEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      player: false,
      loader: false,
    };
  }
  async componentDidMount() {
    // if (this.props.loadData) {
    //   indexEvents.clearCache()
    //   var group = await indexEvents.getObject(this.props.item.eventID)
    //   return this.setState({loader:false,item:group})
    // }
    // return this.setState({loader:false})
  }
  entreeFee(entreeFee) {
    if (entreeFee == 0) return 'Free entry';
    return '$' + entreeFee + ' entry fee';
  }
  userAlreadyJoined(data) {
    if (!data.members) return false;
    if (
      Object.values(data.members).filter(
        (user) => user.userID === this.props.userID,
      ).length === 0
    )
      return false;
    return true;
  }
  click(data) {
    if (
      !data.info.public &&
      !this.props.allAccess &&
      data.info.organizer !== this.props.userID &&
      !this.userAlreadyJoined(data)
    )
      return NavigationService.navigate('Alert', {
        close: true,
        textButton: 'Got it!',
        title: 'This is a private group.',
        subtitle: 'You need an invite to join.',
      });
    return NavigationService.push('Group', {
      objectID: data.objectID,
      pageFrom: this.props.pageFrom,
    });
  }
  card(color, data) {
    if (this.state.loader)
      return (
        <View style={styleApp.cardGroup}>
          <PlacelHolder />
        </View>
      );
    return this.displayCard(color, data);
  }
  numberMember(data) {
    if (data.members != undefined) return Object.values(data.members).length;
    return 0;
  }
  cardAttendee(member, i) {
    if (!member.info.picture)
      return (
        <View
          key={i}
          style={{
            ...styleApp.roundView,
            left: i * 15,
          }}>
          <Text
            style={[
              styleApp.text,
              {fontSize: 10, fontFamily: 'OpenSans-Bold'},
            ]}>
            {member.info.firstname[0] + member.info.lastname[0]}
          </Text>
        </View>
      );
    return (
      <View
        style={{
          ...styleApp.roundView,
          left: i * 15,
        }}
        key={i}>
        <AsyncImage
          style={{width: '100%', height: '100%'}}
          mainImage={member.info.picture}
          imgInitial={member.info.picture}
        />
      </View>
    );
  }
  rowMembers(data) {
    return (
      <Row style={{marginTop: 0, height: 50}}>
        <Col size={15} style={[{paddingRight: 10}, styleApp.center2]}>
          <View
            style={[
              styleApp.viewNumber,
              styleApp.center,
              {backgroundColor: colors.primary2, borderWidth: 0},
            ]}>
            <Text
              style={[
                styleApp.text,
                {fontSize: 10, color: 'white', fontFamily: 'OpenSans-Bold'},
              ]}>
              {this.numberMember(data)}
            </Text>
          </View>
        </Col>
        {data.members != undefined ? (
          <Col size={30} style={[{paddingRight: 10}, styleApp.center2]}>
            {Object.values(data.members)
              .slice(0, 3)
              .map((member, i) => this.cardAttendee(member, i))}
          </Col>
        ) : null}
        <Col style={styleApp.center2} size={55}>
          <Text style={[styleApp.input, {fontSize: 12}]}>Members</Text>
        </Col>
      </Row>
    );
  }
  displayCard(data) {
    return (
      <ButtonColor
        view={() => {
          return (
            <FadeInView duration={300} style={{width: '100%', height: '100%'}}>
              <Row style={{height: 115}}>
                <AsyncImage
                  style={{
                    width: '100%',
                    height: 115,
                    borderTopLeftRadius: 7,
                    borderTopRightRadius: 7,
                  }}
                  mainImage={data.pictures[0]}
                  imgInitial={data.pictures[0]}
                />
              </Row>
              <View style={{paddingLeft: 10, paddingRight: 10, marginTop: 5}}>
                <Text
                  style={[
                    styleApp.input,
                    {fontSize: 15, minHeight: 20, marginTop: 5},
                  ]}>
                  {data.info.name}
                </Text>
                <Text
                  style={[
                    styleApp.subtitle,
                    {minHeight: 20, marginTop: 5, fontSize: 11},
                  ]}>
                  {getZone(data.location.address)}
                </Text>
                {this.rowMembers(data)}
              </View>

              {/* <Text style={[styleApp.input,{color:colors.primary2,fontSize:12}]}>{date(data.date.start,'ddd, Do MMM')} <Text style={{color:colors.title,fontSize:10}}>•</Text> {time(data.date.start,'h:mm a')}</Text>
           
            <Text style={[styles.subtitle,{marginTop:5,minHeight:35}]}>{data.location.area}</Text>
        
  
            {this.rowMembers(data)} */}
            </FadeInView>
          );
        }}
        click={() => this.click(data)}
        color={'white'}
        style={[styleApp.cardGroup, styleApp.shade]}
        onPressColor={colors.off}
      />
    );
  }

  render() {
    return this.card(this.props.data);
  }
}

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {})(CardEvent);
