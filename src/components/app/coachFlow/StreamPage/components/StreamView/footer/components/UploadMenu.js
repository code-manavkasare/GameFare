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
      taskLength: 0
    }
    this.uploadReveal = new Animated.Value(-1);
  }

  componentDidMount() {
    console.log('totalProgress', this.state.totalProgress)
    this.props.onRef(this);
  }

  componentDidUpdate(prevProps, prevState) {
    const {taskLength} = prevState
    const {status, queue} = this.props.uploadQueue;
    const {status: prevStatus, queue: prevQueue} = prevProps.uploadQueue;
    const displayLength = queue.filter((task) => task.displayInList).length
    if (status !== prevStatus || (displayLength > 0 && taskLength === 0)) {
      console.log('lengths', displayLength, taskLength)
      if (displayLength === 0 && taskLength > 0) 
        this.display(0)
      if (
        status === 'uploading' &&
        displayLength > 0) this.display(1)
      if (displayLength > taskLength) {
        console.log('task length', displayLength)
        this.setState({taskLength: displayLength})
      }
    }
  }

  static getDerivedStateFromProps(props, state) {
    const {queue} = props.uploadQueue;
    const {taskLength: prevTaskLength} = state;
    const displayQueue = queue.filter((task) => task.displayInList)
    const taskLength = (displayQueue.length > prevTaskLength) ? 
      displayQueue.length : prevTaskLength
    let sum = 0
    for (var task in displayQueue) {
      sum += displayQueue[task]?.progress
    }
    sum += taskLength - displayQueue.length
    const totalProgress = sum / taskLength
    return {
      totalProgress: totalProgress ? totalProgress : 0
    }
  }

  display(val) {
    const {visible} = this.state
    
    if (val === 0) {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(this.uploadReveal, native(-1, 300))
        ]).start();
        this.props.close(true)
        this.setState({taskLength: 0})
      }, 1000)
    } else if (!visible) {
      Animated.parallel([
        Animated.timing(this.uploadReveal, native(0, 300))
      ]).start();
    }
  }

  open() {
    this.setState({visible: true})
    Animated.parallel([
      Animated.timing(this.uploadReveal, native(1, 300))
    ]).start();
  }

  close() {
    const {taskLength} = this.state
    this.setState({visible: false})
    Animated.parallel([
      Animated.timing(this.uploadReveal, native((taskLength > 0) ? 0 : -1, 300))
    ]).start();
  }

  closeButton() {
    const {visible} = this.state
    return ( visible &&
      <Animated.View 
        style={{
          ...styles.buttonClose,
          opacity: this.uploadReveal
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
          this.props.close()
        }}
        color={colors.white}
        onPressColor={colors.off}
      />
      </Animated.View>
    )
  }

  totalProgress() {
    const {currentScreenSize} = this.props;
    const {currentWidth: width} = currentScreenSize;
    const {totalProgress} = this.state
    return(
      <Animated.View style={{...styles.progressContainer, width}}>
        <Progress.Bar
          color={colors.blueLight}
          width={null}
          progress={totalProgress}
          borderWidth={0}
          height={6}
          unfilledColor={colors.white}
          formatText={() => {
            if (totalProgress === 0) return '';
            return `${Math.round(totalProgress * 100)}%`;
          }}
        />
      </Animated.View>
    )
  }

  render() {
    const {currentScreenSize, members} = this.props;
    const {currentWidth: width} = currentScreenSize;
    const {length} = members

    const uploadTranslateY = this.uploadReveal.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [400, 0, (length-1)*65-150]
    })

    return (
      <Animated.View style={{
        ...styles.menuContainer, 
        width, 
        bottom: (length-1)*65+120,
        transform: [{translateY: uploadTranslateY}]
      }}>
      {this.totalProgress()}
      {this.closeButton()}
        <TouchableWithoutFeedback style={{height:80}} onPress={this.props.openUploadQueue}>
          <Text style={styles.text}>Uploading</Text>
        </TouchableWithoutFeedback>
        <View style={{height:350, width:'100%'}}>
          <QueueList />
        </View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom:100 + sizes.offsetFooterStreaming,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    bottom: 0,
    zIndex: 1,
    ...styleApp.shadow
  },
  text: {
    ...styleApp.text,
    marginTop: 20,
    marginBottom:5,
    fontSize: 21,
    marginHorizontal: 'auto',
    textAlign: 'left',
    marginLeft:'5%',
    fontWeight: 'bold',
    color:colors.black
  },
  buttonClose: {
    position: 'absolute',
    top: 15,
    right: '5%',
    height: 35,
    width: 35,
    zIndex:2,
    borderRadius: 20,
    overflow:'hidden'
  },
  progressContainer: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    opacity: 0.6,
    overflow:'hidden',
    height:25,
    position:'absolute',
    width:'100%',
    top:0,
    left:0,
    zIndex:1,
  }
})

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
    currentScreenSize: state.layout.currentScreenSize,
    uploadQueue: state.uploadQueue,
  };
};

export default connect(mapStateToProps)(UploadMenu);
