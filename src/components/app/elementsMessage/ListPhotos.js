import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Image,
} from 'react-native';

import {generateID} from '../../functions/createGroup';

import CardContent from './CardContent';
import colors from '../../style/colors';

export default class ListPhotos extends Component {
  static propTypes = {
    title: PropTypes.string,
  };
  constructor(props) {
    super(props);
    this.state = {
      pictures: 'loading',
    };
  }
  async componentDidMount() {}

  buttonImage(data, i) {
    return (
      <CardContent
        style={{
          height: '100%',
          width: 200,
          borderRadius: 4,
          marginRight: 10,
          borderColor: colors.grey,
          borderWidth: 0,
          overflow: 'hidden',
        }}
        selectImage={(uri, type, duration, selected) =>
          this.addPicture(uri, type, selected, duration)
        }
        image={data}
        imagesSelected={this.props.imagesSelected}
        key={i}
        index={i}
      />
    );
  }
  addPicture(uri, type, selected, duration) {
    this.props.addImage(
      {
        id: !selected ? uri : generateID(),
        type: type,
        duration: duration,
        uploaded: false,
        uri: uri,
      },
      selected,
    );
  }
  render() {
    return (
      <View>
        <ScrollView
          horizontal
          keyboardShouldPersistTaps={'always'}
          style={[styles.keyboardContainer]}
          showsHorizontalScrollIndicator={false}>
          {this.props.images === 'loading' ? (
            <View style={{height: 100, backgroundColor: 'yellow'}} />
          ) : (
            this.props.images.map((data, i) => this.buttonImage(data, i))
          )}
          <View style={{width: 50}} />
        </ScrollView>
        {/* <ButtonColor
          view={() => {
            return (
              <AllIcons
                name="dots-menu"
                color={colors.white}
                type="moon"
                size={17}
              />
            );
          }}
          click={() => this.selectPicture()}
          color={colors.title}
          style={StyleApp.buttonRoundLibray}
          onPressColor={colors.off}
        /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: '100%',
    height: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    // backgroundColor: 'blue',
    //  position: 'absolute',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
