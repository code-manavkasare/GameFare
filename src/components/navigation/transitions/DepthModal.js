import {TransitionSpecs} from '@react-navigation/stack';
import sizes from '../../style/sizes';

const DepthModal = ({heightScale, bottom, top}) => {
  return {
    gestureDirection: 'vertical',
    gestureResponseDistance: {
      horizontal: sizes.width,
      vertical: sizes.height,
    },
    transitionSpec: {
      open: TransitionSpecs.TransitionIOSSpec,
      close: TransitionSpecs.TransitionIOSSpec,
    },
    cardStyle: {
      backgroundColor: 'transparent',
    },
    cardStyleInterpolator: ({current, next, layouts}) => {
      return {
        cardStyle: {
          borderRadius: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [sizes.borderRadius, 25],
              })
            : 25,
          overflow: 'hidden',
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  layouts.screen.height,
                  next
                    ? 0
                    : heightScale !== undefined
                    ? layouts.screen.height * heightScale
                    : bottom !== undefined
                    ? layouts.screen.height - bottom
                    : top !== undefined
                    ? top
                    : 100,
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
          opacity: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.7],
              })
            : 1,
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
};
module.exports = {
  DepthModal,
};
