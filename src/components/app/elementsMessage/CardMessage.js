import React from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Alert,
  Linking,
  Image,
} from 'react-native';

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
import Hyperlink from 'react-native-hyperlink';
import {getParams, openUrl} from '../../database/branch';
import LinkPreview from 'react-native-link-preview';
import NavigationService from '../../../../NavigationService';

const {height, width} = Dimensions.get('screen');

class CardMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewUrl: null,
      text: '',
      url: '',
    };
    this.clickLink.bind(this);
  }
  componentDidMount() {
    console.log('csrd message mount');
    // this.getDataUrl('https://docs.branch.io/apps/react-native/');
    this.urlify(this.props.message.currentMessage.text);
  }
  urlify(text) {
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    const that = this;
    return text.replace(urlRegex, function(url, b, c) {
      return that.getDataUrl(url);
    });
  }
  async getDataUrl(url) {
    console.log('get url', url);
    var params = await getParams(url);
    console.log('click link');
    console.log(params);
    this.setState({viewUrl: params, url: url});
    // var doc = Jsoup.connect('http://www.google.com').get();
    // Linking.openURL(url);
    // const dataUrl = await LinkPreview.getPreview(url);
    // console.log('data url !');
    // console.log(dataUrl);
  }
  openPage(type, id) {
    NavigationService.push(type, {
      objectID: id,
    });
  }
  async clickLink(url, viewUrl) {
    console.log('click url', url);
    console.log(viewUrl);
    if (viewUrl && url.includes('gamefare.app.link'))
      return this.openPage(
        viewUrl.action === 'openEventPage' ? 'Event' : 'Group',
        viewUrl.eventID,
      );
    // return true;
    if (!viewUrl) return openUrl(url);
    if (!viewUrl.id) return openUrl(url);
    var params = await getParams(url);
    console.log('click link');
    console.log(params);
    if (!params) return Linking.openURL(url);
    if (params.action === 'openEventPage') {
      return this.openPage('Event', params.eventID);
    } else if (params.action === 'openGroupPage') {
      return this.openPage('Group', params.eventID);
    }
    return openUrl(url);
  }

  rowDay(props) {
    console.log('props.', props);
    if (
      !props.previousMessage ||
      moment(props.currentMessage.createdAt).format('DDD') !==
        moment(props.previousMessage.createdAt).format('DDD') ||
      !props.previousMessage.createdAt
    ) {
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
  viewTopVideo(duration, play) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          position: 'absolute',
          zIndex: 20,
          // backgroundColor: 'red',
        }}>
        <View
          style={{
            ...styleApp.center,
            position: 'absolute',
            height: '100%',
            backgroundColor: colors.title,
            opacity: 0.1,
            zIndex: 20,
            width: '100%',
          }}>
          <AllIcons name="play" type="font" color={colors.white} size={30} />
        </View>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            zIndex: 60,
            height: 20,
            // backgroundColor: 'blue',
          }}>
          <Row style={{height: 20, paddingLeft: 5, paddingRight: 5}}>
            <Col style={styleApp.center2}>
              <AllIcons
                name="video"
                type="font"
                color={colors.white}
                size={13}
              />
            </Col>
            <Col style={styleApp.center3}>
              <Text
                style={[
                  styleApp.input,
                  {color: colors.white, fontWeight: 'bold'},
                ]}>
                {duration ? duration.toFixed(0) + ' sec' : '2sec'}
              </Text>
            </Col>
          </Row>
        </View>
      </View>
    );
  }
  renderImages(images) {
    if (images)
      return Object.values(images).map((image, i) => (
        <View style={styles.viewImg}>
          {image.type === 'video' && this.viewTopVideo(image.duration)}
          <Image style={styles.image} source={{uri: image.uri}} key={i} />
        </View>
      ));
    return null;
  }
  renderMessage(props) {
    if (props.currentMessage.images)
      console.log('render message', Object.values(props.currentMessage.images));

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
            <Hyperlink
              // linkDefault={true}
              onPress={(url) => this.clickLink(url, this.state.viewUrl)}
              linkStyle={{color: colors.blue, fontWeight: 'bold'}}>
              <Text style={[styleApp.smallText, {marginTop: 5, fontSize: 14}]}>
                {this.state.viewUrl
                  ? props.currentMessage.text
                  : props.currentMessage.text}
              </Text>
            </Hyperlink>

            {this.renderImages(props.currentMessage.images)}

            {this.state.viewUrl ? (
              <ButtonColor
                view={() => {
                  return (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                      }}>
                      <Row>
                        <Col>
                          <AsyncImage
                            style={{
                              width: '100%',
                              height: 150,
                              borderRadius: 5,
                              marginBottom: 10,
                            }}
                            mainImage={this.state.viewUrl.$og_image_url}
                            imgInitial={this.state.viewUrl.$og_image_url}
                          />
                        </Col>
                      </Row>

                      <Text style={styleApp.text}>
                        {this.state.viewUrl.$og_title}
                      </Text>
                      <Text
                        style={[
                          styleApp.smallText,
                          {marginTop: 5, color: colors.greyDark},
                        ]}>
                        {this.state.url}
                      </Text>
                    </View>
                  );
                }}
                click={() => this.clickLink(this.state.url, this.state.viewUrl)}
                color={colors.white}
                style={{
                  ...styleApp.center2,
                  marginTop: 20,
                  flex: 1,
                  width: '100%',
                  borderLeftWidth: 3,
                  paddingRight: 20,
                  borderColor: colors.grey,
                  paddingLeft: 20,
                  paddingBottom: 10,
                  paddingTop: 10,
                }}
                onPressColor={colors.off}
              />
            ) : null}
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
  viewImg: {
    borderRadius: 5,
    width: 120,
    height: 120,
    marginTop: 10,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(CardMessage);
