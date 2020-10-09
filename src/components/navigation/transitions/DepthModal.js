import {TransitionSpecs} from '@react-navigation/stack';
import sizes from '../../style/sizes';

const DepthModal = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  cardStyleInterpolator: ({current, next, layouts}) => {
    return {
      cardStyle: {
        borderRadius: sizes.borderRadius,
        overflow: 'hidden',
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [
                layouts.screen.height,
                next ? 0 : (layouts.screen.height * 1) / 3,
              ],
            }),
          },
          {
            scale: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.9],
                })
              : 1,
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

module.exports = {
  DepthModal,
};
