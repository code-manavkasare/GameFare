import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import FadeInView from 'react-native-fade-in-view';
import {Col, Row} from 'react-native-easy-grid';

import NavigationService from '../../../../NavigationService';
import colors from '../../style/colors';
import AsyncImage from '../../layout/image/AsyncImage';

import ButtonColor from '../../layout/Views/Button';
import styleApp from '../../style/style';
import {date, time} from '../../layout/date/date';

class CardEvent extends React.Component {
  constructor(props) {
    super(props);
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
        style={styleApp.cardEvent}
        onPressColor={colors.off}
      />
    );
  }

  render() {
    return (
      <ButtonColor
        style={styles.cardEvent}
        click={() => this.props.click(this.props.index)}
        color={'white'}
        onPressColor={colors.off}
        view={() => {
          return (
            <Col style={styles.fullWidth}>
              <Row style={styles.row}>
                <Text style={styleApp.title}>{this.props.eventTitle}</Text>
              </Row>
              <Row style={styles.row}>
                <Text
                  style={[styleApp.input, {color: colors.primary2, fontSize: 12}]}>
                  {date(this.props.start, 'ddd, Do MMM')}{' '}
                  <Text style={{color: colors.title, fontSize: 12}}>•</Text>{' '}
                  {time(this.props.start, 'h:mm a')}
                </Text>
              </Row>
            </Col>
          );
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  cardEvent: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5,
    borderColor: colors.borderColor,
  },
  row: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
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
