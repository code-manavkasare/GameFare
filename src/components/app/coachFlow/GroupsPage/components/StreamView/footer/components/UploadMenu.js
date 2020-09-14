import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import {Col, Row} from 'react-native-easy-grid';
import * as Progress from 'react-native-progress';

import colors from '../../../../../../../style/colors';
import sizes from '../../../../../../../style/sizes';
import styleApp from '../../../../../../../style/style';
import {native} from '../../../../../../../animations/animations';
import ButtonColor from '../../../../../../../layout/Views/Button';
import AllIcons from '../../../../../../../layout/icons/AllIcons';
import QueueList from '../../../../../../elementsUpload/QueueList';

class UploadMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      totalProgress: 0,
      taskLength: 0,
      cloudQueue: [],
    };
    this.uploadReveal = new Animated.Value(0);
  }

  componentDidMount() {
    if (this.props.onRef) {
      this.props.onRef(this);
    }
  }

  display(val, taskLength) {
    const {visible} = this.state;

    if (val === 0) {
      this.setState({totalProgress: 1});
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(this.uploadReveal, native(-1, 300)),
        ]).start();
        this.setState({visible: false});
        this.props.close(true);
      }, 1500);
    } else if (!visible) {
      this.props.openUploadQueue();
    }
    if (taskLength && taskLength > this.state.taskLength) {
      this.setState({taskLength});
    }
  }

  open(val) {
    this.setState({visible: true});
    Animated.parallel([
      Animated.timing(this.uploadReveal, native(val ? val : 0, 300)),
    ]).start();
  }

  close() {
    const {taskLength} = this.state;
    this.setState({visible: false});
    Animated.parallel([
      Animated.timing(this.uploadReveal, native(taskLength > 0 ? 0 : 0, 300)),
    ]).start();
  }

  closeButton() {
    const {visible} = this.state;
    return (
      visible && (
        <Animated.View
          style={{
            ...styles.buttonClose,
            opacity: this.uploadReveal,
          }}>
          <ButtonColor
            view={() => {
              return (
                <AllIcons
                  name="times"
                  size={13}
                  color={colors.title}
                  type="font"
                />
              );
            }}
            click={() => {
              this.props.close();
            }}
            color={colors.white}
            onPressColor={colors.off}
          />
        </Animated.View>
      )
    );
  }

  totalProgress() {
    const {currentScreenSize} = this.props;
    const {currentWidth: width} = currentScreenSize;
    const {totalProgress} = this.state;
    return (
      <Animated.View style={{...styles.progressContainer, width}}>
        <Progress.Bar
          color={colors.blue}
          width={null}
          progress={totalProgress}
          borderWidth={0}
          height={6}
          unfilledColor={colors.white}
        />
      </Animated.View>
    );
  }

  render() {
    const {currentScreenSize, members} = this.props;
    const {currentWidth: width, currentHeight: height} = currentScreenSize;
    const {length} = members;

    const uploadTranslateY = this.uploadReveal.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [height + 200, -200, (length - 1) * 65 - 350],
    });

    return (
      <Animated.View
        style={{
          ...styles.menuContainer,
          // zIndex: 10,
          width,
          bottom: (length - 1) * 65 + 120,
          transform: [{translateY: uploadTranslateY}],
        }}>
        {this.totalProgress()}
        {this.closeButton()}
        <TouchableWithoutFeedback
          style={{height: 80}}
          onPress={this.props.openUploadQueue}>
          <Text style={styles.text}>Uploading</Text>
        </TouchableWithoutFeedback>
        <View style={{height: 150, width: '100%'}}>
          <QueueList
            onFetch={(cloudQueue) => {
              this.setState({cloudQueue});
            }}
            onClose={() => {
              this.display(0);
            }}
            onOpen={(taskLength) => {
              this.display(1, taskLength);
            }}
            totalProgress={(totalProgress) => {
              this.setState({totalProgress});
            }}
          />
        </View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom: 30 + sizes.marginBottomApp,
    backgroundColor: colors.white,
    borderRadius: 25,
    bottom: 0,
    zIndex: 1,
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
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
});

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
    uploadQueue: state.uploadQueue,
  };
};

export default connect(mapStateToProps)(UploadMenu);
