import React from 'react';
import {StyleSheet, Text, Dimensions, View} from 'react-native';
import {connect} from 'react-redux';
import FadeInView from 'react-native-fade-in-view';
import {Col, Row} from 'react-native-easy-grid';

import NavigationService from '../../../../NavigationService';
import colors from '../../style/colors';
import AsyncImage from '../../layout/image/AsyncImage';

import PlacelHolder from '../../placeHolders/CardEvent';
import {arrayAttendees} from '../../functions/createEvent';
import ButtonColor from '../../layout/Views/Button';
import styleApp from '../../style/style';
import {stylesMapPage} from './MapPage';
import {date, time} from '../../layout/date/date';

class CardEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      player: false,
      loader: false,
    };
  }
  async componentDidMount() {}
  entreeFee(entreeFee) {
    if (entreeFee === 0) return 'Free entry';
    return '$' + entreeFee + ' entry fee';
  }
  card(color, data) {
    if (this.state.loader)
      return (
        <View style={styleApp.cardEventSM}>
          <PlacelHolder />
        </View>
      );
    return this.displayCard(color, data);
  }
  numberMember(attendees) {
    return attendees.length;
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
  rowAttendees(attendees) {
    return (
      <Row style={{marginTop: 15}}>
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
              {this.numberMember(attendees)}
            </Text>
          </View>
        </Col>
        {attendees.length !== 0 && (
          <Col
            size={this.props.size === 'SM' ? 40 : 20}
            style={styleApp.center2}>
            {attendees
              .slice(0, 3)
              .map((member, i) => this.cardAttendee(member, i))}
          </Col>
        )}
        <Col size={this.props.size === 'SM' ? 55 : 65} style={styleApp.center2}>
          <Text style={[styleApp.text, {fontSize: 11}]}>
            Player
            {attendees.length === 0 || attendees.length === 1 ? null : 's'}{' '}
            coming
          </Text>
        </Col>
      </Row>
    );
  }
  displayCard(data, attendees) {
    var sport = Object.values(this.props.sports).filter(
      (sport) => sport.value === data.info.sport,
    )[0];
    var league = Object.values(sport.typeEvent)
      .filter((item) => item)
      .filter((item) => item.value === data.info.league)[0];
    if (!league) return null;

    return (
      <ButtonColor
        key={this.props.index}
        view={() => {
          return (
            <FadeInView duration={300} style={styleApp.fullSize}>
              {this.props.league === 'all' && (
                <AsyncImage
                  style={styles.logoLeague}
                  mainImage={league.icon}
                  imgInitial={league.icon}
                />
              )}

              <Text
                style={[
                  styleApp.input,
                  {color: colors.primary2, fontSize: 12},
                ]}>
                {date(data.date.start, 'ddd, Do MMM')}{' '}
                <Text style={{color: colors.title, fontSize: 10}}>•</Text>{' '}
                {time(data.date.start, 'h:mm a')}
              </Text>
              <Text
                style={[
                  styleApp.input,
                  {fontSize: 15, minHeight: 20, marginTop: 5},
                ]}>
                {data.info.name}
              </Text>
              <Text style={[styleApp.subtitle, {marginTop: 5, minHeight: 35}]}>
                {data.location.address}
              </Text>

              {this.rowAttendees(attendees)}

              {this.props.size === 'M' && <View style={styles.dividerBottom} />}
            </FadeInView>
          );
        }}
        click={() => NavigationService.push('Event', {objectID: data.objectID})}
        color={'white'}
        style={[
          this.props.size === 'SM'
            ? [
                styleApp.cardEventSM,
                styleApp.shade,
                this.props.pagingEnabled && stylesMapPage.cardEventMap,
              ]
            : styleApp.cardEvent,
        ]}
        onPressColor={colors.off}
      />
    );
  }

  render() {
    const {data, userID} = this.props;
    const attendees = arrayAttendees(data, userID);
    return this.card(data, attendees);
  }
}

const styles = StyleSheet.create({
  dividerBottom: {
    height: 0.5,
    borderTopWidth: 0.5,
    borderColor: colors.grey,
    marginTop: 15,
  },
  logoLeague: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    sports: state.globaleVariables.sports.list,
    league: state.historicSearch.league,
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps, {})(CardEvent);
