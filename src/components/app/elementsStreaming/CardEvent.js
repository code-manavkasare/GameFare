import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {connect} from 'react-redux';
import FadeInView from 'react-native-fade-in-view';
import {Col, Row} from 'react-native-easy-grid';

import NavigationService from '../../../../NavigationService';
import colors from '../../style/colors';
import AsyncImage from '../../layout/image/AsyncImage';
import AllIcons from '../../layout/icons/AllIcons';

import ButtonColor from '../../layout/Views/Button';
import styleApp from '../../style/style';
import {date, time} from '../../layout/date/date';

class CardEvent extends React.Component {
  constructor(props) {
    super(props);
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
            <Row style={styles.container}>
              <Col size={90} style={styles.leftText}>
                <Row style={styles.row}>
                  <Text style={[styleApp.text, {fontSize: 19}]}>
                    {this.props.eventTitle}
                  </Text>
                </Row>
                <Row style={styles.row}>
                  <Text
                    style={[
                      styleApp.input,
                      {color: colors.primary2, fontSize: 12},
                    ]}>
                    {date(this.props.start, 'ddd, Do MMM')}{' '}
                    <Text style={{color: colors.title, fontSize: 12}}>•</Text>{' '}
                    {time(this.props.start, 'h:mm a')}
                  </Text>
                </Row>
              </Col>
              <Col size={10} style={styleApp.center3}>
                <AllIcons
                  type="mat"
                  size={15}
                  color={colors.black}
                  name="keyboard-arrow-right"
                />
              </Col>
            </Row>
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
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  leftText: {
    alignItems: 'flex-start',
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
