import React, {Component} from 'react';
import {connect} from 'react-redux';
import {store} from '../../../store/reduxStore';
import {requiredInteractionsSelector} from '../../../store/selectors/intialInteractions';
import {setInitialInteraction} from '../../../store/actions/initialInteractionActions';
import {navigate} from '../../../../NavigationService';
import {func, object, string} from 'prop-types';
import {userIDSelector} from '../../../store/selectors/user';
import {useIsFocused} from '@react-navigation/native';
import colors from '../../style/colors';
import {View} from 'react-native';
import {timeout} from '../../functions/coach';

class GuidedInteraction extends Component {
  static propTypes = {
    text: string,
    interaction: string,
    onPress: func,
    style: object,
    type: string,
    overlayStyle: object,
    offset: object,
  };
  constructor(props) {
    super(props);
    this.childrenRef = [];
    this.state = {
      x: undefined,
      y: undefined,
    };
  }
  completeInteraction = () => {
    const {requiredInteractions} = this.props;
    requiredInteractions.shift();
    store.dispatch(setInitialInteraction({requiredInteractions}));
  };
  componentDidMount() {
    this.guideUser();
  }
  componentDidUpdate() {
    this.guideUser();
  }
  guideUser = async () => {
    const {
      children,
      onPress,
      text,
      interaction,
      requiredInteractions,
      isFocused,
      type,
      style,
      overlayStyle,
      offset,
    } = this.props;
    const {x, y, height, width} = this.state;
    if (
      isFocused &&
      requiredInteractions &&
      requiredInteractions[0] === interaction &&
      x &&
      y
    ) {
      if (type === 'overlay') {
        navigate('InteractiveView', {
          x,
          y,
          height,
          width,
          children,
          onPress,
          text,
          containerStyle: style,
          overlayStyle,
          offset,
          completion: this.completeInteraction,
        });
      } else if (type === 'alert') {
        navigate('Alert', {
          title: text,
          textButton: 'Got it!',
          colorButton: 'green',
          onPressColor: colors.greenLight,
          onGoBack: () => {},
        });
      }
    }
  };
  onLayout = async (index) => {
    const {delay} = this.props;
    await timeout(delay ? delay + 1500 : 1500);
    this.childrenRef[index].measure((_, __, width, height, x, y) => {
      this.setState({x, y, height, width});
    });
  };
  render = () => {
    const {children, style} = this.props;
    return (
      <View style={style}>
        {React.Children.map(children, (child, index) =>
          React.cloneElement(child, {
            ref: (ref) => (this.childrenRef[index] = ref),
            onLayout: () => this.onLayout(index),
          }),
        )}
      </View>
    );
  };
}

const mapStateToProps = (state, props) => {
  return {
    userIDSubSelector: userIDSelector(state),
    requiredInteractions: requiredInteractionsSelector(state),
  };
};

const GuidedInteractionWrapped = connect(mapStateToProps)(GuidedInteraction);

export default function(props) {
  const isFocused = useIsFocused();
  return <GuidedInteractionWrapped {...props} isFocused={isFocused} />;
}
