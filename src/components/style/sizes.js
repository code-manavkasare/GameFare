import {Platform, Dimensions} from 'react-native';
const {height: initialHeight, width: initialWidth} = Dimensions.get('screen');
let {height, width} = Dimensions.get('screen');
if (height < width) {
  height = initialWidth;
  width = initialHeight;
}
var marginTopHeader = 7;
var heightPicture = 280;
var heightFooterBooking = 80;
var heightFooter = 70;
var marginTopApp = 10;
let marginTopAppLandscape = 0;
var heightHeaderHome = 70;
var heightHeaderFilter = 100;
var heightHeaderHomeSearch = 130;
var height0 = 50;
var borderRadius = 0;

let initialHeightControlBar = 110;
let offsetFooterStreaming = 30;

let marginBottomApp = 50;
let keyboardOffset = 5;
let marginBottomAppLandscade = 10;

let heightHeaderStream = 60;
let offsetBottomHeaderStream = 10;
let heightCardSession = 90;
let widthCardSession = width;

let marginTopDrawing = 0;
let marginLeftDrawing = 0;

if (Platform.OS === 'ios') {
  height0 = 0;
  marginTopHeader = 24;
  heightPicture = 240;
  marginBottomApp = 10;
  keyboardOffset = 245;
  heightHeaderFilter = 100;
  heightFooterBooking = 82;
  heightFooter = 60;
  marginTopApp = 20;
  heightHeaderHomeSearch = 130;
  initialHeightControlBar = 80;
  offsetFooterStreaming = 0;
  borderRadius = 2;
  if (height === 812 || height === 844 || height === 896 || height === 926) {
    marginTopHeader = 50;
    heightPicture = 280;
    heightHeaderFilter = 130;
    heightFooterBooking = 110;
    heightFooter = 60;
    marginTopApp = 35;
    marginBottomApp = 30;
    keyboardOffset = 320;
    marginBottomAppLandscade = 20;
    heightHeaderHomeSearch = 100;
    initialHeightControlBar = 100;
    offsetFooterStreaming = 30;
    borderRadius = 25;
  } else if (height === 667) {
    heightFooterBooking = 85;
    heightHeaderFilter = 100;
    heightHeaderHomeSearch = 130;
    initialHeightControlBar = 80;
    offsetFooterStreaming = 0;
  } else if (height === 736) {
    heightFooterBooking = 85;
    heightHeaderFilter = 100;
    heightHeaderHomeSearch = 130;
    initialHeightControlBar = 80;
    offsetFooterStreaming = 0;
  } else if (height === 1024) {
    marginLeftDrawing = 81.5;
  } else if (height === 1112) {
    marginLeftDrawing = 104.5;
  } else if (height === 1080) {
    marginLeftDrawing = 101.25;
  } else if (height === 1194) {
    marginLeftDrawing = 81.7;
  } else if (height === 1366) {
    marginLeftDrawing = 129;
  }
}

const ratio = (w, h) => {
  if (w === 0) {
    return 0;
  }
  return h / w;
};

module.exports = {
  heightFooterBooking: heightFooterBooking,
  heightFooter: heightFooter,
  marginTopApp: marginTopApp,
  marginTopHeader: marginTopHeader,
  heightPicture: heightPicture,
  height0: height0,
  heightHeaderHome: heightHeaderHome,
  heightHeaderFilter: heightHeaderFilter,
  heightHeaderHomeSearch: heightHeaderHomeSearch,
  height: height,
  width: width,
  borderRadius,
  marginBottomApp: marginBottomApp,
  keyboardOffset: keyboardOffset,
  initialHeightControlBar: initialHeightControlBar,
  offsetFooterStreaming: offsetFooterStreaming,
  heightCardSession,
  widthCardSession,
  heightHeaderStream,
  offsetBottomHeaderStream,
  marginTopAppLandscape,
  marginBottomAppLandscade,
  ratio,
};
