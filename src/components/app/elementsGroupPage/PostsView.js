import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import firebase from 'react-native-firebase';
import CardConversation from '../elementsMessage/CardConversation';

import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import colors from '../../style/colors';
import FadeInView from 'react-native-fade-in-view';
import {indexDiscussions} from '../../database/algolia';

import LinearGradient from 'react-native-linear-gradient';
import sizes from '../../style/sizes';
import styleApp from '../../style/style';

export default class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      discussions: [],
    };
  }
  componentDidMount() {
    this.load();
  }
  async componentWillReceiveProps(nextProps) {
    if (nextProps.loader) {
      await this.setState({loader: true});
      var that = this;
      setTimeout(function() {
        that.load();
      }, 2000);
    }
  }
  async load() {
    var discussions = this.props.data.discussions;
    if (discussions === undefined) discussions = [];
    var {results} = await indexDiscussions.getObjects(discussions);
    if (results === null) results = [];
    this.setState({loader: false, discussions: results});
  }
  newPost() {}
  postsView() {
    return (
      <View style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={styleApp.text}>
                {this.props.type === 'event' ? 'Event' : 'Group'} chat
              </Text>
            </Col>
          </Row>

          <View style={[styleApp.divider2, {marginBottom: 10}]} />
        </View>

        {this.state.loader ? (
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={[colors.placeHolder1, colors.placeHolder2]}
            style={styles.loader}
          />
        ) : Object.values(this.state.discussions).length == 0 ? (
          <Text style={[styleApp.smallText, {marginTop: 10}]}>
            Be the first one to post a comment.
          </Text>
        ) : (
          <FadeInView duration={300} style={{marginTop: 5}}>
            {Object.values(this.state.discussions).map((discussion, i) => (
              <CardConversation index={i} key={i} discussion={discussion} discussionID={discussion.objectID} />
            ))}
          </FadeInView>
        )}
      </View>
    );
  }
  render() {
    return this.postsView();
  }
}

const styles = StyleSheet.create({
  loader:{
    height: 20,
    borderRadius: 7,
    marginRight: 80,
    marginTop: 10,
    marginLeft: 20,
  }
});
