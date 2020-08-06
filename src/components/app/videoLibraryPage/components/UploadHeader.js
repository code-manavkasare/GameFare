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

import colors from '../../../style/colors';
import sizes from '../../../style/sizes';
import styleApp from '../../../style/style';
import {native} from '../../../animations/animations';
import ButtonColor from '../../../layout/Views/Button';
import AllIcons from '../../../layout/icons/AllIcons';
import QueueList from '../../elementsUpload/QueueList';

class UploadHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      headerVisible: false,
      totalProgress: 0,
      taskLength: 0,
      cloudQueue: []
    }
    this.uploadReveal = new Animated.Value(-1);
  }

  display(val, taskLength) {
    const {expanded, headerVisible, totalProgress} = this.state
    
    if (val === 0 && expanded) {
      this.setState({totalProgress: 1})
      setTimeout(() => {
        this.close()
        this.setState({headerVisible: false})
      }, 1500)
    } else if (!expanded) {
      if (!headerVisible) this.setState({})
      this.setState({
        headerVisible: val === 0 ? false : true,
        totalProgress: !headerVisible ? 0 : totalProgress
      })
    }
    if (taskLength && taskLength > this.state.taskLength) {
      this.setState({taskLength})
    }
  }

  open(val) {
    this.setState({expanded: true})
    Animated.parallel([
      Animated.timing(this.uploadReveal, native(val ? val : 0, 300))
    ]).start();
  }

  close() {
    Animated.parallel([
      Animated.timing(this.uploadReveal, native(-1, 300))
    ]).start(() => {
      this.setState({expanded: false})
    });
  }

  closeButton() {
    const {expanded} = this.state
    return ( expanded &&
      <Animated.View 
        style={{
          ...styles.buttonClose,
          opacity: 1
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
          this.close()
        }}
        color={colors.white}
        onPressColor={colors.off}
      />
      </Animated.View>
    )
  }

  totalProgress(type) {
    const {currentScreenSize} = this.props;
    const {currentWidth: width} = currentScreenSize;
    const {totalProgress} = this.state
    const style = (type === 'header') ? 
      {...styles.progressHeader, width} :
      {...styles.progressContainer, width}
    return(
      <Animated.View style={style}>
        <Progress.Bar
          color={colors.blue}
          width={null}
          progress={totalProgress}
          borderWidth={0}
          height={6}
          unfilledColor={colors.white}
        />
      </Animated.View>
    )
  }

  progressPopup() {
    const {currentScreenSize} = this.props;
    const {currentWidth: width, currentHeight: height} = currentScreenSize;

    const uploadTranslateY = this.uploadReveal.interpolate({
      inputRange: [-1, 0],
      outputRange: [500, 0]
    })

    return (
      <Animated.View style={{
        ...styles.menuContainer, 
        width, 
        bottom: -height,
        transform: [{translateY: uploadTranslateY}]
      }}>
      {this.closeButton()}
        <TouchableWithoutFeedback style={{height:80}}>
          <Text style={styles.text}>Uploading</Text>
        </TouchableWithoutFeedback>
        <View style={{height:350, width:'100%'}}>
          <QueueList 
            onFetch={(cloudQueue) => {this.setState({cloudQueue})}}
            onClose={() => {this.display(0)}}
            onOpen={(taskLength) => {this.display(1, taskLength)}}
            totalProgress={(totalProgress) => {this.setState({totalProgress})}}
          />
        </View>
      </Animated.View>
    )
  }
  
  backdrop() {
    const {currentScreenSize} = this.props;
    const {currentWidth: width, currentHeight: height} = currentScreenSize;

    const opacity = this.uploadReveal.interpolate({
      inputRange: [-1, 0],
      outputRange: [0, 0.6]
    })

    const {expanded} = this.state;
    return ( expanded &&
      <TouchableWithoutFeedback onPress={() => this.close()}>
        <Animated.View
          pointerEvents={expanded ? 'auto' : 'none'}
          style={{...styles.fullPage, position:'absolute', zIndex:2, height, width, backgroundColor:colors.black, opacity, top:-200}}
        />
      </TouchableWithoutFeedback>
    );
  }

  render() {
    const {headerVisible} = this.state;
    return (
      <View style={{zIndex:10, marginBottom:-10}}>
        {/* {headerVisible && */}
        {<TouchableWithoutFeedback
        onPress={() => this.open(0)}  
        style={styles.container}>
          <View
            style={styles.container}>
            {this.totalProgress('header')}
            <Text style={styles.headerText}>Uploading</Text>
          </View>
        </TouchableWithoutFeedback>}
        {this.progressPopup()}
        {this.backdrop()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor:colors.white, 
    borderWidth:1, 
    borderColor: colors.off, 
    borderTopWidth:1, 
    width:'100%',
    height:50,
    top:60 + sizes.marginTopApp,
    zIndex:1
  },
  menuContainer: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingBottom:100 + sizes.offsetFooterStreaming,
    backgroundColor: colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    zIndex: 4,
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
  headerText: {
    ...styleApp.text,
    marginTop: 15,
    marginBottom:5,
    fontSize: 18,
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
  },
  progressHeader: {
    opacity: 0.6,
    overflow:'hidden',
    height:25,
    position:'absolute',
    width:'102%',
    left:'-1%',
    top:0,
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

export default connect(mapStateToProps)(UploadHeader);
