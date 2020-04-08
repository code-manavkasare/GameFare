import * as React from 'react';
import {CommonActions, StackActions} from '@react-navigation/native';

const navigationRef = React.createRef();
const footerRef = React.createRef();

const navigate = (routeName, params) => {
  navigationRef.current?.navigate(routeName, params);
};

const push = (routeName, params) => {
  console.log('push!', params);
  navigationRef.current?.dispatch(
    StackActions.push(routeName, {screen: routeName, params: params}),
  );
};

const pop = (number) => {
  navigationRef().dispatch(
    StackActions.pop({
      n: number,
    }),
  );
};

const goBack = () => {
  navigationRef.dispatch(CommonActions.back());
};

const dismiss = () => {
  navigationRef.dangerouslyGetParent().pop();
};

// add other navigation functions that you need and export them

module.exports = {
  navigate,
  push,
  pop,
  dismiss,
  goBack,
  navigationRef,
  footerRef,
};
