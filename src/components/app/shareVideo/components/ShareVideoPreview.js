import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';

import styleApp from '../../../style/style';
import colors from '../../../style/colors';
import CardArchive from '../../coachFlow/StreamPage/components/StreamView/footer/components/CardArchive';
const {height, width} = Dimensions.get('screen');

export default class ShareVideoPreview extends React.Component {
  constructor(props) {
    super(props);
  }
  rowThumbnails() {
    const {videos} = this.props;
    return videos.map((video) => {
      return (
        <CardArchive
          id={video}
          style={styles.cardArchive}
          allowPlay={false}
        />
      );
    });
  }
  render() {
    return (
      <ScrollView style={styles.scrollView} horizontal={true} contentContainerStyle={styles.scrollViewContainerStyle}>
        {this.rowThumbnails()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    height: 154,
  },
  scrollViewContainerStyle: {
    alignItems: 'center',
  },
  cardArchive: {
    width: (width * 0.9) / 2 - 20,
    height: 150,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.title,
    margin: 5,
  },
});
