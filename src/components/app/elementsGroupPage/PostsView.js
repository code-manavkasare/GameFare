import React, {Component} from 'react';
import { 
    View, 
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,TextInput,
    Animated
} from 'react-native';
import {connect} from 'react-redux';
const { height, width } = Dimensions.get('screen')
import { Col, Row, Grid } from "react-native-easy-grid";
import firebase from 'react-native-firebase'

import ButtonColor from '../../layout/Views/Button'
import AllIcons from '../../layout/icons/AllIcons'
import Communications from 'react-native-communications';
import FadeInView from 'react-native-fade-in-view';
import LinearGradient from 'react-native-linear-gradient';

import sizes from '../../style/sizes'
import styleApp from '../../style/style'

export default class Posts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader:true,
      posts:[]
    };
  }
  componentDidMount() {
    this.load()
  }
  async componentWillReceiveProps(nextProps) {
    if (nextProps.loader) {
      await this.setState({loader:true})
      this.load()
    }
  }
  async load() {
    var posts = await firebase.database().ref('groups/' + this.props.objectID + '/posts/').once('value')
    posts = posts.val()
    if (posts == null) posts = []
    this.setState({loader:false,posts:posts})
  }
  newPost() {

  }
  postsView() {
      return (
        <View style={styleApp.viewHome}>
          <View style={styleApp.marginView}>
          <Row>
            <Col style={styleApp.center2} size={80}>
              <Text style={styleApp.text}>Posts</Text>
            </Col >
            <Col style={styleApp.center3} size={20}>
              <ButtonColor view={() => {
                return <AllIcons name='comment-alt' color={colors.title} size={14} type='font' />
              }}
              click={() => this.newPost()}
              color='white'
              style={[styleApp.center,{borderColor:colors.off,height:40,width:40,borderRadius:20,borderWidth:1}]}
              onPressColor={colors.off}
              />
              </Col>
          </Row>

          <View style={[styleApp.divider2,{marginBottom:10}]} />

          {
            this.state.loader?
            <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}   colors={[colors.placeHolder1, colors.placeHolder2]} style={{height:20,borderRadius:7,marginRight:80,marginTop:10,marginLeft:0}} />
            :
            Object.values(this.state.posts).length == 0?
            <Text style={[styleApp.smallText,{marginTop:10}]}>Be the first one to post a comment.</Text>
            :
            <FadeInView duration={300} style={{marginTop:5}}>
              {Object.values(this.state.posts).map((post,i) => (
                this.postView(post,i)
              ))}
            </FadeInView>
          }

          </View>
        </View>
      )
  }
  render() {
    return (this.postsView());
  }
}

const styles = StyleSheet.create({

});


