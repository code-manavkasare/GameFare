import React from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  StyleSheet,
} from 'react-native';
import {connect} from 'react-redux';
import {historicSearchAction} from '../../../actions/historicSearchActions';
import {messageAction} from '../../../actions/messageActions';
import {Col, Row, Grid} from 'react-native-easy-grid';
import NavigationService from '../../../../NavigationService';
import firebase from 'react-native-firebase';

import styleApp from '../../style/style';
import colors from '../../style/colors';
import ButtonColor from '../../layout/Views/Button';
import {resizeVideo} from '../../functions/pictures';
const {height, width} = Dimensions.get('screen');

import AsyncImage from '../../layout/image/AsyncImage';
import AllIcons from '../../layout/icons/AllIcons';
import FadeInView from 'react-native-fade-in-view';
import AllIcon from '../../layout/icons/AllIcons';

export default class CardContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loader: false,
      lastMessage: null,
      selected: false,
    };
  }
  componentDidMount() {}
  imageCard(img) {
    return (
      <AsyncImage style={styles.roundImage} mainImage={img} imgInitial={img} />
    );
  }
  async selectImage(uri, type, playableDuration) {
    console.log('selectim', uri, type);
    console.log('la', !this.conditionSelected(uri));
    // this.setState({selected: newSelected});
    this.props.selectImage(
      this.conditionSelected(uri)
        ? Object.values(this.props.imagesSelected).filter(
            (img) => img.uri === uri,
          )[0].id
        : uri,
      type,
      playableDuration,
      !this.conditionSelected(uri),
    );
  }
  sendImage(uri, info) {}
  conditionSelected(uri) {
    console.log('conditionSelected', this.props.imagesSelected);
    console.log('uri');
    if (!this.props.imagesSelected) return false;
    return (
      Object.values(this.props.imagesSelected).filter((img) => img.uri === uri)
        .length !== 0
    );
  }
  cardContent(rowData, i) {
    const {uri, playableDuration, filename} = rowData.node.image;
    const {type} = rowData.node;
    console.log('render card convo', rowData.node, i);
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              {this.conditionSelected(uri + '/' + filename) && (
                <FadeInView
                  duration={300}
                  style={[
                    styles.voile,
                    {opacity: 1, backgroundColor: 'transparent'},
                  ]}>
                  <ButtonColor
                    view={() => {
                      return (
                        <AllIcon
                          name={'check'}
                          size={16}
                          color={colors.white}
                          type="mat"
                        />
                      );
                    }}
                    click={() => this.selectPicture()}
                    color={colors.primary2}
                    style={{
                      height: 25,
                      width: 25,
                      borderRadius: 35,
                      borderColor: colors.off,
                      bottom: 10,
                      right: 10,
                      opacity: 1,
                      zIndex: 50,
                      position: 'absolute',
                    }}
                    onPressColor={colors.off}
                  />
                  <View style={styles.voile}></View>
                </FadeInView>
              )}
              {type === 'video' ? (
                <View style={{position: 'absolute', zIndex: 40}}>
                  <Row
                    style={{
                      height: 35,
                      paddingLeft: 10,
                      paddingRight: 10,
                      width: this.props.width,
                    }}>
                    <Col style={styleApp.center2}>
                      <AllIcons
                        name="video"
                        type="font"
                        color={colors.white}
                        size={13}
                      />
                    </Col>
                    <Col style={[styleApp.center3, {paddingLeft: 10}]}>
                      <Text
                        style={[
                          styleApp.input,
                          {color: colors.white, fontWeight: 'bold'},
                        ]}>
                        {playableDuration.toFixed(0)} sec
                      </Text>
                    </Col>
                  </Row>
                </View>
              ) : null}
              <Image
                source={{uri: uri}}
                style={{height: '100%', width: '100%'}}
              />
            </Row>
          );
        }}
        click={() => {
          // if (type === 'video') resizeVideo(uri);
          this.selectImage(
            uri + '/' + filename,
            type,
            !this.state.selected,
            playableDuration,
          );
        }}
        color="white"
        style={this.props.style}
        onPressColor={colors.off}
      />
    );
  }
  render() {
    return this.cardContent(this.props.image, this.props.index);
  }
}

const styles = StyleSheet.create({
  roundImage: {
    ...styleApp.center,
    // backgroundColor: colors.off2,
    width: 200,
    height: '100%',
    borderRadius: 5,
    // borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
  voile: {
    //...styleApp.center,
    backgroundColor: colors.title,
    height: '100%',
    width: '100%',
    //borderRadius: 15,
    opacity: 0.4,
    //right: 5,
    //top: 5,
    zIndex: 30,
    borderColor: colors.grey,
    position: 'absolute',
  },
});
