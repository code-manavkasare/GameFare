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
    if (!this.props.imagesSelected) return false;
    return (
      Object.values(this.props.imagesSelected).filter((img) => img.uri === uri)
        .length !== 0
    );
  }
  cardContent(rowData, i) {
    const {uri, playableDuration, filename} = rowData.node.image;
    const {type} = rowData.node;
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              {this.conditionSelected(uri + '/' + filename) && (
                <FadeInView duration={300} style={styles.voile1}>
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
                    style={styles.buttonSelected}
                    onPressColor={colors.off}
                  />
                  <View style={styles.voile} />
                </FadeInView>
              )}
              {type === 'video' && (
                <View style={{...styles.viewRowVideo, width: this.props.width}}>
                  <Row style={styles.rowInfoView}>
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
              )}
              <Image source={{uri: uri}} style={styleApp.fullSize} />
            </Row>
          );
        }}
        click={() => {
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
    width: 200,
    height: '100%',
    borderRadius: 5,
    borderColor: colors.borderColor,
  },
  voile: {
    backgroundColor: colors.title,
    height: '100%',
    width: '100%',
    opacity: 0.4,
    zIndex: 30,
    borderColor: colors.grey,
    position: 'absolute',
  },
  voile1: {
    height: '100%',
    width: '100%',
    zIndex: 30,
    borderColor: colors.grey,
    position: 'absolute',
    opacity: 1,
    backgroundColor: 'transparent',
  },
  buttonSelected: {
    height: 25,
    width: 25,
    borderRadius: 35,
    borderColor: colors.off,
    bottom: 10,
    right: 10,
    opacity: 1,
    zIndex: 50,
    position: 'absolute',
  },
  rowInfoView: {
    height: 35,
    paddingLeft: 10,
    paddingRight: 10,
  },
  viewRowVideo: {position: 'absolute', zIndex: 40},
});
