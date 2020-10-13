import React from 'react';
import {View, Text, Dimensions, StyleSheet, Linking, Modal} from 'react-native';
import moment from 'moment';
import Hyperlink from 'react-native-hyperlink';
import {Col, Row} from 'react-native-easy-grid';
import ImageViewer from 'react-native-image-zoom-viewer';

import AsyncImage from '../../layout/image/AsyncImage';
import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';
import CardImg from './elementsChat/CardImg';

import {getParams, openUrl} from '../../database/branch';
import {messageAvatar, messageName} from '../../functions/users';
import {push, navigate} from '../../../../NavigationService';
import AllIcon from '../../layout/icons/AllIcons';
import CardArchive from '../../app/coachFlow/GroupsPage/components/StreamView/footer/components/CardArchive';

const {height, width} = Dimensions.get('screen');
export default class CardMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      viewUrl: null,
      text: '',
      url: '',
      showImage: false,
    };
    this.clickLink.bind(this);
  }
  urlify(text) {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    const that = this;
    return text.replace(urlRegex, function(url, b, c) {
      return that.getDataUrl(url);
    });
  }
  async getDataUrl(url) {
    const params = await getParams(url);
    this.setState({viewUrl: params, url: url});
  }
  openPage(type, id) {
    push(type, {
      objectID: id,
    });
  }
  async clickLink(url, viewUrl) {
    if (url.includes('gamefare.app.link')) {
      const params = await getParams(url);
      return this.openPage(params.action, params.objectID);
    }

    if (!viewUrl) {
      return openUrl(url);
    }
    if (!viewUrl.id) {
      return openUrl(url);
    }
    const params = await getParams(url);

    if (!params) {
      return Linking.openURL(url);
    }
    if (params.action) {
      return this.openPage(params.action, params.objectID);
    }
    return openUrl(url);
  }
  openImage() {
    this.setState({showImage: true});
  }

  rowDay(props) {
    if (
      !props.previousMessage ||
      moment(props.currentMessage.timeStamp).format('DDD') !==
        moment(props.previousMessage.timeStamp).format('DDD') ||
      !props.previousMessage.timeStamp
    ) {
      return (
        <Row style={styles.message}>
          <Col style={styleApp.center2}>
            <Text style={[styleApp.text, {marginBottom: 10, marginTop: 10}]}>
              {moment(props.currentMessage.timeStamp).format('DDD') ===
              moment().format('DDD')
                ? 'Today'
                : Number(
                    moment(props.currentMessage.timeStamp).format('DDD') ===
                      Number(moment().format('DDD')) - 1,
                  )
                ? 'Yesterday'
                : moment(props.currentMessage.timeStamp).format('MMMM, Do')}
            </Text>
          </Col>
        </Row>
      );
    }
    return null;
  }
  renderImages = (images, message, discussionID) => {
    if (images) {
      return Object.values(images).map((image, i) => (
        <CardImg
          image={image}
          key={i}
          openImage={this.openImage.bind(this)}
          index={i}
          discussionID={discussionID}
          indexMessage={this.props.index}
          user={this.props.user}
          message={message}
        />
      ));
    }
    return null;
  };
  goToProfilePage = () => {
    navigate('ProfilePage', {
      user: this.props.message.currentMessage.user,
    });
  };
  displayPictureUser = (props) => {
    const {currentMessage, previousMessage} = props;
    if (!previousMessage) {
      return true;
    }
    const {timeStamp, user: currentUser} = currentMessage;
    const {timeStamp: previousTimeStamp, user: previousUser} = previousMessage;
    if (currentUser.id !== previousUser.id) {
      return true;
    }
    if (timeStamp - previousTimeStamp > 120000) {
      return true;
    }
    return false;
  };
  viewUserConnect(props) {
    const {currentMessage} = props;
    const {user, timeStamp} = currentMessage;
    return (
      <View style={[styleApp.center, {height: 15, marginTop: 0}]}>
        <Text style={[styleApp.subtitle, {fontSize: 12}]}>
          <AllIcon
            name="film"
            size={12}
            color={styleApp.subtitle.color}
            type="moon"
          />
          {'  '} {messageName(user.info)} connected to the video chat.
        </Text>
      </View>
    );
  }
  viewRequest(props) {
    const {currentMessage} = props;
    const {text} = currentMessage;
    return (
      <View style={[styleApp.center, {height: 15, marginTop: 0}]}>
        <Text style={[styleApp.subtitle, {fontSize: 12}]}>
          <AllIcon
            name="lock"
            size={12}
            color={styleApp.subtitle.color}
            type="font"
          />
          {'  '} {text}
        </Text>
      </View>
    );
  }
  renderMessage(props) {
    const {currentMessage, previousMessage} = props;
    const {user, timeStamp, text, type, content} = currentMessage;

    const displayPictureUser = this.displayPictureUser(props);
    return (
      <View
        style={[
          styles.cardMessage,
          {
            paddingTop: displayPictureUser ? 20 : 0,
            paddingBottom: displayPictureUser ? 0 : 0,
          },
        ]}>
        {this.rowDay(props)}
        {type === 'connection' ? (
          this.viewUserConnect(props)
        ) : type === 'request' ? (
          this.viewRequest(props)
        ) : (
          <Row>
            <Col
              size={20}
              activeOpacity={1}
              onPress={() =>
                !user.info.noProfileClick &&
                displayPictureUser &&
                this.goToProfilePage()
              }>
              {displayPictureUser && (
                <AsyncImage
                  style={{width: 45, height: 45, borderRadius: 5}}
                  mainImage={messageAvatar(user.info)}
                  imgInitial={messageAvatar(user.info)}
                />
              )}
            </Col>
            <Col size={80} style={styleApp.center2}>
              {displayPictureUser && (
                <Text
                  style={[styleApp.title, {fontSize: 16}]}
                  onPress={() =>
                    !user.info.noProfileClick && this.goToProfilePage()
                  }>
                  {messageName(user.info)}{' '}
                  <Text style={{color: colors.grey, fontSize: 12}}>
                    {moment(timeStamp).format('h:mm a')}
                  </Text>
                </Text>
              )}
              {text !== '' && (
                <Hyperlink
                  // linkDefault={true}
                  onPress={(url) => this.clickLink(url, this.state.viewUrl)}
                  linkStyle={{color: colors.blue, fontWeight: 'bold'}}>
                  <Text
                    style={[
                      styleApp.smallText,
                      {marginTop: 5, fontSize: 14, marginBottom: 0},
                    ]}>
                    {text}
                  </Text>
                </Hyperlink>
              )}
              {type === 'video' && (
                <CardArchive
                  id={content}
                  style={{
                    ...styleApp.cardArchive,
                    marginTop: 15,
                    marginLeft: -1,
                    borderRadius: 6,
                  }}
                />
              )}
              {this.renderImages(
                props.currentMessage.images,
                props.currentMessage,
                this.props.discussion.objectID,
              )}

              {this.state.viewUrl && (
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
                  click={() =>
                    this.clickLink(this.state.url, this.state.viewUrl)
                  }
                  color={colors.white}
                  style={styles.buttonUrl}
                  onPressColor={colors.off}
                />
              )}
            </Col>
          </Row>
        )}
      </View>
    );
  }
  render() {
    const images = this.props.message.currentMessage.images
      ? Object.values(this.props.message.currentMessage.images)
          .filter((image) => image.type === 'image')
          .reduce(function(result, item) {
            let image = item;
            image.url = image.uri;
            result[item.id] = item;
            return result;
          }, {})
      : [];
    return (
      <View>
        {this.renderMessage(this.props.message)}
        <Modal visible={this.state.showImage} transparent={true}>
          <ImageViewer
            enableSwipeDown={true}
            renderHeader={(index) => {
              return (
                <Row
                  style={{
                    height: 55,
                    width: width,
                    // backgroundColor: 'red',
                    position: 'absolute',
                    marginTop: 30,
                    zIndex: 100,
                  }}>
                  <Col
                    size={15}
                    style={styleApp.center}
                    activeOpacity={0.6}
                    onPress={() => this.setState({showImage: false})}>
                    <AllIcon
                      size={24}
                      name={'times'}
                      type="font"
                      color={colors.white}
                    />
                  </Col>
                  <Col size={85} />
                </Row>
              );
            }}
            imageUrls={Object.values(images)}
            onSwipeDown={() => this.setState({showImage: false})}
          />
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  message: {
    flex: 1,
    borderBottomWidth: 0.5,
    marginBottom: 20,
    borderColor: colors.grey,
  },
  urlImg: {
    width: '100%',
    height: 150,
    borderRadius: 5,
  },
  buttonUrl: {
    ...styleApp.center2,
    flex: 1,
    width: '100%',
    borderLeftWidth: 3,
    paddingRight: 20,
    borderColor: colors.grey,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingTop: 10,
  },
  cardMessage: {
    flex: 1,
    width: '100%',
    marginBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
});
