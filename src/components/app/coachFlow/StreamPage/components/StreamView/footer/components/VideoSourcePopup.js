import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import MemberSource from './MemberSource';
import {native} from '../../../../../../../animations/animations';

import colors from '../../../../../../../style/colors';
import sizes from '../../../../../../../style/sizes';
import styleApp from '../../../../../../../style/style';

class VideoSourcePopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.scaleCard = new Animated.Value(0);
    this.itemsRef = [];
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  static getDerivedStateFromProps(props, state) {
    const {userID} = props;
    return {
      members: props.members
        ? Object.values(props.members).filter((member) => {
            return (
              member.isConnected &&
              (member.permissionOtherUserToRecord || member.id === userID)
            );
          })
        : undefined,
    };
  }

  open() {
    this.setState({visible: true});
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(1)),
    ]).start();
  }

  close() {
    this.setState({visible: false});
    return Animated.parallel([
      Animated.timing(this.scaleCard, native(0)),
    ]).start();
  }
  backdrop() {
    const {visible} = this.state;

    return (
      <TouchableWithoutFeedback onPress={() => this.close()}>
        <View
          pointerEvents={visible ? 'auto' : 'none'}
          style={styles.fullPage}
        />
      </TouchableWithoutFeedback>
    );
  }

  render() {
    const {visible, members} = this.state;
    const {selectMember, coachSessionID} = this.props;

    const translateY = this.scaleCard.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[
          styles.square,
          styleApp.center,
          {
            opacity: this.scaleCard,
            transform: [{translateY: translateY}],
          },
        ]}>
        <Text style={[styleApp.text, styles.text]}>Choose a video source</Text>
        <View style={[styleApp.divider2, {marginTop: 10, marginBottom: 5}]} />
        {members?.map((member) => (
          <MemberSource
            member={member}
            key={member.id}
            coachSessionID={coachSessionID}
            onRef={(ref) => (this.itemsRef[member.id] = ref)}
            selectMember={(member) => selectMember(member)}
          />
        ))}
        <View style={styles.triangle} />
        {this.backdrop()}
      </Animated.View>
    );
  }
}

const triangleBase = 21;

const styles = StyleSheet.create({
  square: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    width: sizes.width - 50,
    bottom: 100 + sizes.offsetFooterStreaming,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    zIndex: 2,
  },
  triangle: {
    borderLeftWidth: triangleBase / 1.5,
    borderRightWidth: triangleBase / 1.5,
    borderTopWidth: triangleBase,
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.white,
    position: 'absolute',
    bottom: -triangleBase,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1,
  },
  fullPage: {
    position: 'absolute',
    width: sizes.width,
    height: 200000,
    backgroundColor: 'transparent',
    zIndex: -1,
  },
  text: {
    marginTop: 15,
    marginHorizontal: 'auto',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

VideoSourcePopup.propTypes = {
  members: PropTypes.array.isRequired,
  selectMember: PropTypes.func,
  close: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    userID: state.user.userID,
  };
};

export default connect(mapStateToProps)(VideoSourcePopup);
