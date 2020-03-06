import React, {Component} from 'react';
import {View, Text, Dimensions} from 'react-native';
import firebase from 'react-native-firebase';
import PropTypes from 'prop-types';
import {Col, Row} from 'react-native-easy-grid';

import NavigationService from '../../../../NavigationService';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import Loader from '../../layout/loaders/Loader';

import colors from '../../style/colors';
import styleApp from '../../style/style';

const {width} = Dimensions.get('screen');

export default class CardStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      stream: null,
    };
  }
  async componentDidMount() {
    this.loadStream(this.props.streamID);
  }
  componentWillUnmount() {
    console.log('CARD STREAM UNMOUNT');
    if (this.state.event) {
      firebase
        .database()
        .ref('streams/' + this.props.streamID)
        .off();
    }
  }
  async loadStream(streamID) {
    const that = this;
    firebase
      .database()
      .ref('streams/' + streamID)
      .on('value', async function(snap) {
        let stream = snap.val();
        if (!stream) return null;
        that.setState({stream: stream, loader: false});
      });
  }

  async onClick() {
    if (!this.state.loader) {
      const {stream} = this.state;
      const {event} = this.props;
      if (stream.liveballResults && !stream.liveballResults.players) {
        return NavigationService.navigate('Alert', {
          close: true,
          textButton: 'Got it!',
          title: 'Sorry! It looks like something went wrong with this stream.',
        });
      } else if (stream.liveballResults && stream.liveballResults.organized) {
        NavigationService.navigate('StreamResults', {
          stream: stream,
          event: event,
          matches: stream.liveballResults.matches,
        });
      } else if (stream.liveballResults && this.props.userIsOrganizer) {
        NavigationService.navigate('OrganizeStreamResults', {
          stream: stream,
          event: event,
        });
      } else if (stream.liveballResults) {
        return NavigationService.navigate('Alert', {
          close: true,
          textButton: 'Got it!',
          title: 'Results must first be organized by the event host.',
        });
      } else {
        return NavigationService.navigate('Alert', {
          close: true,
          textButton: 'Got it!',
          title: 'No stream results available yet.',
        });
      }
    }
  }
  render() {
    const {loader, stream} = this.state;
    return (
      <View>
        <ButtonColor
          view={() => {
            return (
              <Row>
                {loader ? (
                  <Loader size={20} color="green" />
                ) : stream.liveballResults ? (
                  <Col>
                    <Row>
                      <Col
                        size={75}
                        style={[styleApp.center2, {paddingLeft: 10}]}>
                        <Text style={styleApp.text}>
                          {'Stream ' + this.props.name}
                        </Text>
                      </Col>
                      {!stream.liveballResults.organized ? (
                        <Col
                          size={25}
                          style={[
                            styleApp.center2,
                            {alignItems: 'flex-end', paddingRight: 10},
                          ]}>
                          <AllIcons
                            name="exclamation-circle"
                            type="font"
                            color={colors.yellow}
                            size={17}
                          />
                        </Col>
                      ) : null}
                    </Row>
                  </Col>
                ) : (
                  <Col size={75} style={[styleApp.center2, {paddingLeft: 10}]}>
                    <Text style={[styleApp.text, {color: 'grey'}]}>
                      {'Stream ' + this.props.name}
                    </Text>
                  </Col>
                )}
              </Row>
            );
          }}
          click={() => this.onClick()}
          color="white"
          style={{
            width: width,
            height: 55,
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 5,
          }}
          onPressColor={colors.off}
        />
      </View>
    );
  }
}

CardStream.propTypes = {
  streamID: PropTypes.string.isRequired,
  event: PropTypes.object.isRequired,
  key: PropTypes.number.isRequired,
  name: PropTypes.number.isRequired, // change to string when give streams proper names
  userIsOrganizer: PropTypes.bool.isRequired,
};
