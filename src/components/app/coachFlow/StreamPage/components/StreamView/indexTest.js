import React, {Component} from 'react';
import {Text, View, Button} from 'react-native';
import {connect} from 'react-redux';
import database from '@react-native-firebase/database';

import {coachAction} from '../../../../../../actions/coachActions';
import {userAction} from '../../../../../../actions/userActions';
import {layoutAction} from '../../../../../../actions/layoutActions';

import {timeout} from '../../../../../functions/coach';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

class SessionView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: this.props.session,
      backgroundColor: 'red',
    };
  }
  async componentDidMount() {
    this.props.onRef(this);
    console.log('card streamView mounted: ', this.state.session.id);
    await timeout(1000);
    this.setState({backgroundColor: 'grey'});
  }
  static getDerivedStateFromProps(props, state) {
    // console.log('card stream getDerivedStateFromProps', state.session);
    return {};
  }
  componentWillUnmount() {
    console.log('componentWillUnmount :', this.state.session.id);
  }
  open = () => {
    console.log('open', this.state.session.id);
  };
  delete = async (objectID, userID) => {
    let updates = {};
    console.log('delete user from', objectID);
    // addSession(objectID, true);
    updates[`users/${userID}/coachSessions/${objectID}`] = null;
    updates[`coachSessions/${objectID}/members/${userID}`] = null;
    updates[`coachSessions/${objectID}/allMembers/${userID}`] = null;
    console.log('updates', updates);
    await database()
      .ref()
      .update(updates);
  };

  card = () => {
    const {session, backgroundColor} = this.state;
    const {userID} = this.props;
    console.log('render card stream');
    if (!session) return <View style={{height: 200, backgroundColor: 'red'}} />;
    return (
      <View style={{margin: 10, backgroundColor: backgroundColor, height: 100}}>
        <Text>{session.id}</Text>

        <View style={{height: 20}} />

        <Button
          onPress={() => this.delete(session.id, userID)}
          title="Delete"
          color="white"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
    );
  };

  render() {
    return this.card();
  }
}

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    infoUser: state.user.infoUser.userInfo,
    sessionInfo: state.coach.sessionInfo,
  };
};

export default connect(
  mapStateToProps,
  {
    coachAction,
    userAction,
    layoutAction,
  },
)(SessionView);
