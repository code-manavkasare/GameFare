import {Platform, Dimensions} from 'react-native';
const {height, width} = Dimensions.get('screen');

var marginTopHeader = 7;
var heightPicture = 280;
var heightFooterBooking = 155;
var heightFooter = 135;
var marginTopApp = 10;
var heightHeaderHome = 70;
var heightHeaderFilter = 100;
var heightHeaderHomeSearch = 130;
var height0 = 50;

let initialHeightControlBar = 110;
let offsetFooterStreaming = 30;

console.log('height screeen,', height);
if (Platform.OS === 'ios') {
  height0 = 0;
  marginTopHeader = 24;
  heightPicture = 240;
  heightHeaderHome = 70;
  heightHeaderFilter = 100;
  heightFooterBooking = 82;
  heightFooter = 60;
  marginTopApp = 20;
  heightHeaderHomeSearch = 130;
  initialHeightControlBar = 80;
  offsetFooterStreaming = 0;

  if (height === 812) {
    marginTopHeader = 50;
    heightPicture = 280;
    heightHeaderHome = 100;
    heightHeaderFilter = 130;
    heightFooterBooking = 110;
    heightFooter = 93;
    marginTopApp = 35;
    heightHeaderHomeSearch = 100;
    initialHeightControlBar = 100;
    offsetFooterStreaming = 30;
  } else if (height === 896) {
    marginTopHeader = 48;
    heightPicture = 280;
    heightHeaderHome = 100;
    heightHeaderFilter = 130;
    heightFooterBooking = 110;
    heightFooter = 91;
    marginTopApp = 35;
    heightHeaderHomeSearch = 100;
    initialHeightControlBar = 100;
    offsetFooterStreaming = 35;
  } else if (height === 667) {
    heightFooterBooking = 85;
    heightHeaderHome = 70;
    heightHeaderFilter = 100;
    heightHeaderHomeSearch = 130;
    initialHeightControlBar = 80;
    offsetFooterStreaming = 0;
  } else if (height === 736) {
    heightFooterBooking = 85;
    heightHeaderHome = 70;
    heightHeaderFilter = 100;
    heightHeaderHomeSearch = 130;
    initialHeightControlBar = 80;
    offsetFooterStreaming = 0;
  }
}

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
  initialHeightControlBar: initialHeightControlBar,
  offsetFooterStreaming: offsetFooterStreaming,
};
