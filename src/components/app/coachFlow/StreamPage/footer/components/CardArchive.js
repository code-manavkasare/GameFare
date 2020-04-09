import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import firebase from 'react-native-firebase';

import ButtonColor from '../../../../../layout/Views/Button';
import AllIcons from '../../../../../layout/icons/AllIcons';

import {displayTime} from '../../../../../functions/coach';
import {date, time} from '../../../../../layout/date/date';

import colors from '../../../../../style/colors';
import styleApp from '../../../../../style/style';

export default class CardArchive extends Component {
  constructor(props) {
    super(props);
    this.state = {
      archive: false,
    };
  }
  async componentDidMount() {
    const {archive: archiveData} = this.props;

    if (archiveData.available) this.loadArchive(archiveData.id);
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.archive.available !== this.props.archive.available &&
      this.props.archive.available
    )
      this.loadArchive(this.props.archive.id);
    if (
      prevProps.archive.available !== this.props.archive.available &&
      !this.props.archive.available
    )
      this.setState({archive: false});
  }
  async loadArchive(archiveID) {
    let archive = await firebase
      .database()
      .ref('archivedStreams/' + archiveID)
      .once('value');
    archive = archive.val();
    if (archive) await this.setState({archive: archive});
  }
  placeholder() {
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={[colors.off, colors.off2]}
        style={styleApp.fullSize}
      />
    );
  }
  cardArchive(archive) {
    const {openVideo} = this.props;
    const {archive: archiveData} = this.props;
    const {
      thumbnail,
      url,
      startTimestamp,
      resolution,
      durationSeconds,
    } = archive;

    return (
      <View style={styleApp.cardArchive}>
        {!archiveData.available ? (
          <View
            style={[
              styleApp.fullSize,
              styleApp.center,
              {backgroundColor: colors.grey + '60'},
            ]}>
            <Text style={[styleApp.text, {color: colors.white}]}>
              Processing video...
            </Text>
          </View>
        ) : archive ? (
          <View style={styleApp.fullSize}>
            <Image source={{uri: thumbnail}} style={styleApp.fullSize} />
            <View style={{...styles.viewText, bottom: 5, left: 5}}>
              <Text
                style={[styleApp.text, {color: colors.white, fontSize: 12}]}>
                {date(
                  new Date(startTimestamp).toString(),
                  'ddd, MMM Do • h:mm a',
                )}
              </Text>
            </View>
            <View style={{...styles.viewText, top: 5, right: 5}}>
              <Text
                style={[styleApp.text, {color: colors.white, fontSize: 15}]}>
                {resolution}p • {displayTime(durationSeconds)}
              </Text>
            </View>
            <ButtonColor
              view={() => {
                return (
                  <AllIcons
                    type={'font'}
                    color={colors.white}
                    size={45}
                    name={'play-circle'}
                  />
                );
              }}
              click={() => openVideo(url, thumbnail)}
              color={colors.greyDark + '40'}
              onPressColor={colors.greyDark + '40'}
              style={[
                styleApp.fullSize,
                styleApp.center,
                {position: 'absolute'},
              ]}
            />
          </View>
        ) : (
          this.placeholder()
        )}
      </View>
    );
  }
  render() {
    const {archive} = this.state;

    return this.cardArchive(archive);
  }
}

const styles = StyleSheet.create({
  viewText: {
    position: 'absolute',
    zIndex: 5,
  },
});
