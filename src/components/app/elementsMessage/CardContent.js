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
  selectImage(uri, newSelected) {
    this.setState({selected: newSelected});
    // this.props.selectImage(uri, newSelected);
  }
  sendImage(uri, info) {}

  cardContent(rowData, i) {
    const {uri} = rowData.node.image;
    const {type} = rowData.node;
    console.log('render card convo', rowData.node, i);
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              {this.state.selected && (
                <FadeInView duration={300} style={styles.voile}>
                  <AllIcons
                    name="check"
                    type="font"
                    color={colors.white}
                    size={13}
                  />
                </FadeInView>
              )}
              {type === 'video' ? (
                <View style={{position: 'absolute', zIndex: 40}}>
                  <Row
                    style={{
                      height: 35,
                      paddingLeft: 10,
                      paddingRight: 10,
                      width: 240,
                    }}>
                    <Col style={styleApp.center2}>
                      <AllIcons
                        name="video"
                        type="font"
                        color={colors.white}
                        size={13}
                      />
                    </Col>
                    <Col style={styleApp.center3}>
                      <Text style={[styleApp.input, {color: colors.white}]}>
                        {rowData.node.image.playableDuration.toFixed(0)}sec
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
        click={() => this.selectImage(uri, !this.state.selected, type)}
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
    backgroundColor: colors.off2,
    width: 200,
    height: '100%',
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
  voile: {
    ...styleApp.center,
    backgroundColor: colors.grey,
    height: '100%',
    width: '100%',
    //borderRadius: 15,
    opacity: 0.7,
    //right: 5,
    //top: 5,
    zIndex: 30,
    borderColor: colors.grey,
    position: 'absolute',
  },
});
