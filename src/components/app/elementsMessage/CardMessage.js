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
import moment from 'moment';
import Hyperlink from 'react-native-hyperlink';
import {Col, Row, Grid} from 'react-native-easy-grid';

import AsyncImage from '../../layout/image/AsyncImage';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import sizes from '../../style/sizes';
import ButtonColor from '../../layout/Views/Button';
import CardImg from './elementsChat/CardImg';
import AllIcons from '../../layout/icons/AllIcons';

import {getParams, openUrl} from '../../database/branch';
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
    var params = await getParams(url);
    this.setState({viewUrl: params, url: url});
    // var doc = Jsoup.connect('http://www.google.com').get();
    // Linking.openURL(url);
    // const dataUrl = await LinkPreview.getPreview(url);
  }
  openPage(type, id) {
    NavigationService.push(type, {
      objectID: id,
    });
  }
  async clickLink(url, viewUrl) {
    if (viewUrl && url.includes('gamefare.app.link'))
      return this.openPage(
        viewUrl.action === 'openEventPage' ? 'Event' : 'Group',
        viewUrl.eventID,
      );
    // return true;
    if (!viewUrl) return openUrl(url);
    if (!viewUrl.id) return openUrl(url);
    var params = await getParams(url);

    if (!params) return Linking.openURL(url);
    if (params.action === 'openEventPage') {
      return this.openPage('Event', params.eventID);
    } else if (params.action === 'openGroupPage') {
      return this.openPage('Group', params.eventID);
    }
    return openUrl(url);
  }

  rowDay(props) {
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
  renderImages(images, message, discussionID) {
    if (images)
      return Object.values(images).map((image, i) => (
        <CardImg
          image={image}
          key={i}
          index={i}
          discussionID={discussionID}
          indexMessage={this.props.index}
          user={this.props.user}
          message={message}
        />
      ));
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
            {props.currentMessage.text !== '' && (
              <Hyperlink
                // linkDefault={true}
                onPress={(url) => this.clickLink(url, this.state.viewUrl)}
                linkStyle={{color: colors.blue, fontWeight: 'bold'}}>
                <Text
                  style={[
                    styleApp.smallText,
                    {marginTop: 5, fontSize: 14, marginBottom: 10},
                  ]}>
                  {this.state.viewUrl
                    ? props.currentMessage.text
                    : props.currentMessage.text}
                </Text>
              </Hyperlink>
            )}

            {this.renderImages(
              props.currentMessage.images,
              props.currentMessage,
              this.props.discussion.objectID,
            )}

            {this.state.viewUrl ? (
              <ButtonColor
                view={() => {
                  return (
                    <View style={styleApp.fullSize}>
                      <Row>
                        <Col>
                          <AsyncImage
                            style={styles.urlImg}
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
                style={styles.buttonUrl}
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
  image: {
    height: '100%',
    width: '100%',
  },
  urlImg: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    // marginBottom: 10,
  },
  buttonUrl: {
    ...styleApp.center2,
    // marginBotttom: 10,
    flex: 1,
    width: '100%',
    borderLeftWidth: 3,
    paddingRight: 20,
    borderColor: colors.grey,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
});

const mapStateToProps = (state) => {
  return {};
};

export default connect(mapStateToProps, {})(CardMessage);
