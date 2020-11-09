import React, {Component} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';

import styleApp from '../../style/style';
import colors from '../../style/colors';

import {uploadQueueAction} from '../../../store/actions/uploadQueueActions';
import TaskCard from './TaskCard';
import * as Progress from 'react-native-progress';
import ButtonColor from '../../layout/Views/Button';
import AllIcons from '../../layout/icons/AllIcons';
import {navigate} from '../../../../NavigationService';

class QueueList extends Component {
  constructor(props) {
    super(props);
    this.AnimatedHeaderValue = new Animated.Value(0);
    this.state = {
      orderedTasks: [],
      cloudQueue: [],
      mounted: false,
    };
    this.focusListener = null;
  }

  static getDerivedStateFromProps(props, state) {
    const {uploadQueue} = props;
    const {queue} = uploadQueue;
    if (queue && Object.values(queue).length >= 0) {
      const orderedTasks = Object.values(queue)
        .filter((task) => task.displayInList)
        .sort((a, b) => a.timeSubmitted - b.timeSubmitted);
      return {orderedTasks};
    }
  }

  componentDidMount() {
    const {navigation} = this.props;
    //this.fetchCloudUploadQueue();
    this.focusListener = navigation.addListener('focus', () => {
      this.setState({mounted: true});
    });

    this.focusListener = navigation.addListener('blur', () => {
      this.setState({mounted: false});
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const {onOpen, onClose} = this.props;
    const {orderedTasks} = this.state;
    const {orderedTasks: prevOrderedTasks} = prevState;
    if (orderedTasks?.length > prevOrderedTasks?.length && onOpen) {
      onOpen();
    } else if (orderedTasks?.length === 0 && prevOrderedTasks?.length > 0) {
      onClose && onClose();
      setTimeout(() => {
        const {mounted} = this.state;
        if (mounted) {
          navigate('TabsApp');
        }
      }, 1200);
    }
  }

  list() {
    const {orderedTasks} = this.state;

    return (
      <ScrollView
        style={{marginBottom: 10}}
        showVerticalScrollbar={false}
        contentContainerStyle={{marginTop: 0, paddingBottom: 100}}>
        {orderedTasks.map((task, i) => (
          <TaskCard task={task} index={i} key={task.id} />
        ))}
      </ScrollView>
    );
  }

  close() {
    const {navigation} = this.props;
    navigation.navigate('TabsApp');
  }

  closeButton() {
    return (
      <Animated.View
        style={{
          ...styles.buttonClose,
          opacity: 1,
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
            this.close();
          }}
          color={colors.greyLighter}
          onPressColor={colors.off}
        />
      </Animated.View>
    );
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
          unfilledColor={colors.greyLighter}
        />
      </Animated.View>
    );
  }

  emptyList() {
    return (
      <View
        style={{
          ...styles.emptyList,
          opacity: 1,
        }}>
        <Image
          source={require('../../../img/images/rocket.png')}
          style={styles.rocket}
          resizeMode="contain"
        />
        <Text style={[styleApp.title, {marginTop: 20, fontSize: 18}]}>
          {'All done!'}
        </Text>
      </View>
    );
  }

  backdrop() {
    const backdropStyle = {
      ...styleApp.stylePage,
      backgroundColor: 'transparent',
      opacity: 0,
      zIndex: 0,
    };
    return (
      <View style={backdropStyle}>
        <TouchableOpacity
          onPress={() => this.close()}
          activeOpacity={1}
          style={styleApp.fullSize}
        />
      </View>
    );
  }

  render() {
    const {orderedTasks} = this.state;
    return (
      <View style={styleApp.fullSize}>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: 500,
            bottom: 0,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            backgroundColor: colors.greyLighter,
            zIndex: 2,
          }}>
          {this.totalProgress()}
          {this.closeButton()}
          <TouchableWithoutFeedback style={{height: 80}}>
            <Text style={styles.text}>Uploading</Text>
          </TouchableWithoutFeedback>
          {!orderedTasks || (orderedTasks.length === 0 && this.emptyList())}
          {orderedTasks && orderedTasks.length > 0 && this.list()}
        </View>
        {this.backdrop()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    marginTop: 15,
  },
  emptyList: {
    ...styleApp.center,
    position: 'absolute',
    height: 160,
    width: '100%',
    zIndex: 2,
  },
  rocket: {
    height: 60,
    width: '100%',
    marginTop: 105,
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
    zIndex: 5,
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
    uploadQueue: state.uploadQueue,
    currentScreenSize: state.layout.currentScreenSize,
    userID: state.user.userID,
  };
};

export default connect(
  mapStateToProps,
  {uploadQueueAction},
)(QueueList);
