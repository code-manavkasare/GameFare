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

import AsyncImage from '../../layout/image/AsyncImage';
import AllIcons from '../../layout/icons/AllIcons';

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
    this.props.selectImage(uri, newSelected);
  }

  cardContent(rowData, i) {
    const {uri} = rowData.node.image;
    console.log('render card convo', uri, i);
    return (
      <ButtonColor
        key={i}
        view={() => {
          return (
            <Row>
              {this.state.selected && (
                <View
                  style={{
                    ...styleApp.center,

                    backgroundColor: colors.green,
                    height: 25,
                    width: 25,
                    borderRadius: 15,
                    right: 5,
                    top: 5,
                    zIndex: 30,
                    borderColor: colors.grey,
                    borderWidth: 1,
                    position: 'absolute',
                  }}>
                  <AllIcons
                    name="check"
                    type="font"
                    color={colors.white}
                    size={13}
                  />
                </View>
              )}
              <Image
                source={{uri: uri}}
                style={{height: '100%', width: '100%'}}
              />
            </Row>
          );
        }}
        click={() => this.selectImage(uri, !this.state.selected)}
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
    width: '100%',
    height: '100%',
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: colors.borderColor,
  },
});
