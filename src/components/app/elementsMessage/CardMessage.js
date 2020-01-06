import React from 'react';
import {View, Text, Dimensions, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {messageAction} from '../../../actions/messageActions';
import firebase from 'react-native-firebase';
import moment from 'moment';
import Loader from '../../layout/loaders/Loader';
import AsyncImage from '../../layout/image/AsyncImage';
import {Col, Row, Grid} from 'react-native-easy-grid';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
const {height, width} = Dimensions.get('screen');

class CardMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  rowDay(props) {
    if (
      !props.previousMessage ||
      moment(props.currentMessage.createdAt).format('DDD') !==
        moment(props.previousMessage.createdAt).format('DDD') ||
      !props.previousMessage.createdAt
    ) {
      console.log('il est la');
      return (
        <Row style={styles.message}>
          <Col style={styleApp.center2}>
            <Text style={[styleApp.text, {marginBottom: 10, marginTop: 10}]}>
              {moment(props.currentMessage.createdAt).format('DDD') ===
              moment().format('DDD')
                ? 'Today'
                : Number(
                    moment(props.currentMessage.createdAt).format('DDD') ===
                      Number(moment().format('DDD')) - 1,
                  )
                ? 'Yesterday'
                : moment(props.currentMessage.createdAt).format('MMMM, Do')}
            </Text>
          </Col>
        </Row>
      );
    }
    return null;
  }
  renderMessage(props) {
    return (
      <View style={styleApp.cardMessage}>
        {this.rowDay(props)}
        <Row>
          <Col size={15}>
            <AsyncImage
              style={{width: 45, height: 45, borderRadius: 5}}
              mainImage={props.currentMessage.user.avatar}
              imgInitial={props.currentMessage.user.avatar}
            />
          </Col>
          <Col size={85} style={[styleApp.center2, {marginBottom: 10}]}>
            <Text style={[styleApp.text, {fontSize: 16}]}>
              {props.currentMessage.user.name}{' '}
              <Text style={{color: colors.grey, fontSize: 12}}>
                {moment(props.currentMessage.createdAt).format('h:mm a')}
              </Text>
            </Text>
            <Text style={[styleApp.smallText, {marginTop: 5}]}>
              {props.currentMessage.text}
            </Text>
          </Col>
        </Row>
      </View>
    );
  }
  render() {
    return this.renderMessage(this.props.message);
  }
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    borderBottomWidth: 0.5,
    marginBottom: 10,
    borderColor: colors.grey,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(CardMessage);
