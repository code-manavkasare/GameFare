// import {NavigationActions, StackActions} from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    }),
  );
}

function push(routeName, params) {
  _navigator.dispatch(
    StackActions.push({
      routeName,
      params,
    }),
  );
}

function pop(number) {
  _navigator.dispatch(
    StackActions.pop({
      n: number,
    }),
  );
}

function goBack() {
  _navigator.dispatch(NavigationActions.back());
}

function dismiss() {
  _navigator.dispatch(NavigationActions.dismiss());
}

// add other navigation functions that you need and export them

export default {
  navigate,
  push,
  setTopLevelNavigator,
  pop,
  dismiss,
  goBack,
};
