import {TransitionSpecs} from '@react-navigation/stack';
import sizes from '../../style/sizes';
import colors from '../../style/colors';
import styleApp from '../../style/style';

const DepthModal = ({heightScale, bottom, top, ignoreBackgroundScale}) => {
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
    cardOverlayEnabled: true,
    // cardOverlay: () => {
    //   return <View>

    //   </View>
    // },
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
                    outputRange: [1, ignoreBackgroundScale ? 1 : 0.9],
                  })
                : 1,
            },
          ],
          opacity: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, ignoreBackgroundScale ? 1 : 1],
              })
            : 1,
        },
        overlayStyle: {
          opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
          backgroundColor: colors.black,
          ...styleApp.fullSize,
          position: 'absolute',
        },
      };
    },
  };
};
module.exports = {
  DepthModal,
};
