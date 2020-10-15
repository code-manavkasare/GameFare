import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import * as Progress from 'react-native-progress';

import colors from '../../../style/colors';
import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';

class UploadHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      headerVisible: false,
      cloudQueue: [],
    };
    this.uploadReveal = new Animated.Value(-1);
  }

  static getDerivedStateFromProps(props, state) {
    const {uploadQueue, connectionType} = props;
    const {queue} = uploadQueue;
    console.log(queue);
    if (queue && Object.values(queue).length > 0) {
      const waitingForWifi =
        Object.values(queue).every((item) => item?.isBackground) &&
        connectionType !== 'wifi';
      return {
        headerVisible: true,
        waitingForWifi,
      };
    }
    return {
      headerVisible: false,
    };
  }
  open() {
    const {openQueue} = this.props;
    openQueue && openQueue();
  }

  totalProgress(type) {
    const {currentScreenSize, uploadQueue} = this.props;
    const {totalProgress} = uploadQueue;
    const {currentWidth: width} = currentScreenSize;
    const maxWidth = width * 0.45;
    const style =
      type === 'header'
        ? {...styles.progressHeader, maxWidth}
        : {...styles.progressContainer, maxWidth: width};
    return (
      <Animated.View style={style}>
        <Progress.Bar
          color={colors.blue}
          width={type === 'header' ? (maxWidth > 200 ? 200 : maxWidth) : width}
          progress={totalProgress ? totalProgress : 0}
          borderWidth={0}
          height={type === 'header' ? 4 : 6}
          unfilledColor={colors.white}
        />
      </Animated.View>
    );
  }

  render() {
    const {headerVisible, waitingForWifi} = this.state;
    const {currentScreenSize} = this.props;
    const {currentWidth: width} = currentScreenSize;
    const maxWidth = 0.45 * width;
    const containerStyle = {
      zIndex: 10,
      marginBottom: -10,
      position: 'absolute',
      width,
      ...styleApp.center3,
    };
    return (
      <View style={containerStyle}>
        {headerVisible && (
          <TouchableWithoutFeedback onPress={() => this.open()}>
            <View style={{...styles.container, maxWidth}}>
              {this.totalProgress('header')}
              <Text style={styles.headerText}>
                {waitingForWifi ? 'Waiting for Wi-Fi' : 'Uploading'}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...styleApp.shadowWeak,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.off,
    width: 200,
    height: 40,
    right: '5%',
    top: sizes.marginTopApp + 75,
    zIndex: 1,
    borderRadius: 25,
  },
  menuContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom: 150 + sizes.offsetFooterStreaming,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 4,
    ...styleApp.shadow,
  },
  text: {
    ...styleApp.text,
    marginTop: 20,
    marginBottom: 5,
    fontSize: 21,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft: '5%',
    fontWeight: 'bold',
    color: colors.black,
  },
  headerText: {
    ...styleApp.text,
    marginTop: 10,
    marginBottom: 5,
    fontSize: 15,
    marginHorizontal: 'auto',
    textAlign: 'center',
    width: '100%',
    height: 40,
    position: 'absolute',
    fontWeight: '700',
    color: colors.greyDarker,
  },
  buttonClose: {
    position: 'absolute',
    top: 15,
    right: '5%',
    height: 35,
    width: 35,
    zIndex: 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    opacity: 0.6,
    overflow: 'hidden',
    height: 25,
    position: 'absolute',
    width: '110%',
    top: 0,
    zIndex: 1,
  },
  progressHeader: {
    opacity: 0.6,
    overflow: 'hidden',
    borderColor: colors.off,
    paddingTop: 34,
    height: '100%',
    borderRadius: 25,
    width: '100%',
    left: 0,
    bottom: 0,
    zIndex: 1,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
    uploadQueue: state.uploadQueue,
    connectionType: state.connectionType.type,
  };
};

export default connect(mapStateToProps)(UploadHeader);
