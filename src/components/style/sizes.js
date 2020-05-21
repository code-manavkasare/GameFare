import {Platform, Dimensions} from 'react-native';
const {height, width} = Dimensions.get('screen');
console.log('height!', height);
var marginTopHeader = 7;
var heightPicture = 280;
var heightFooterBooking = 80;
var heightFooter = 70;
var marginTopApp = 10;
let marginTopAppLandscape = 0;
var heightHeaderHome = 75;
var heightHeaderFilter = 100;
var heightHeaderHomeSearch = 130;
var height0 = 50;

let initialHeightControlBar = 110;
let offsetFooterStreaming = 30;

let marginBottomApp = 50;
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
  heightHeaderFilter = 100;
  heightFooterBooking = 82;
  heightFooter = 70;
  marginTopApp = 20;
  heightHeaderHomeSearch = 130;
  initialHeightControlBar = 80;
  offsetFooterStreaming = 0;

  if (height === 812) {
    marginTopHeader = 50;
    heightPicture = 280;
    heightHeaderFilter = 130;
    heightFooterBooking = 110;
    heightFooter = 75;
    marginTopApp = 35;
    marginBottomApp = 30;
    marginBottomAppLandscade = 20;
    heightHeaderHomeSearch = 100;
    initialHeightControlBar = 100;
    offsetFooterStreaming = 30;
  } else if (height === 896) {
    marginTopHeader = 48;
    heightPicture = 280;
    heightHeaderFilter = 130;
    heightFooterBooking = 110;
    heightFooter = 75;
    marginTopApp = 35;
    marginBottomApp = 35;
    marginBottomAppLandscade = 20;
    heightHeaderHomeSearch = 100;
    initialHeightControlBar = 100;
    offsetFooterStreaming = 35;
  } else if (height === 667) {
    heightFooterBooking = 60;
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
  marginBottomApp: marginBottomApp,
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
