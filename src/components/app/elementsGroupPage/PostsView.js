import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {connect} from 'react-redux';
const {height, width} = Dimensions.get('screen');
import {Col, Row, Grid} from 'react-native-easy-grid';
import CardConversation from '../elementsMessage/CardConversation';

import colors from '../../style/colors';
import FadeInView from 'react-native-fade-in-view';
import {indexDiscussions} from '../../database/algolia';

import LinearGradient from 'react-native-linear-gradient';
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
    let discussions = this.props.data.discussions;
    if (!discussions) discussions = [];
    let {results} = await indexDiscussions.getObjects(discussions);
    if (!results) results = [];
    if (results.filter((convo) => !convo).length !== 0) return this.load();
    this.setState({loader: false, discussions: results});
  }
  newPost() {}
  postsView() {
    const {type} = this.props;
    return (
      <View style={styleApp.viewHome}>
        <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={styleApp.text}>
                {type === 'event'
                  ? 'Event'
                  : type === 'challenge'
                  ? 'Challenge'
                  : 'Group'}{' '}
                chat
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
              <CardConversation
                index={i}
                key={i}
                discussion={discussion}
                discussionID={discussion.objectID}
              />
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
  loader: {
    height: 20,
    borderRadius: 7,
    marginRight: 80,
    marginTop: 10,
    marginLeft: 20,
  },
});
