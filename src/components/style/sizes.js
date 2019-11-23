import {
  Platform,
  Dimensions,
} from 'react-native';
var  { height, width } = Dimensions.get('screen')
console.log('height!!!!!')
console.log(height)
var marginTopHeader = 7
var heightPicture = 280
var heightFooterBooking =155
var heightFooter = 135
var marginTopApp = 10
var heightHeaderHome = 70
var heightHeaderFilter = 100
var heightHeaderHomeSearch = 130
var marginBottomAlert = 50
var height0 = 50
if (Platform.OS == 'ios'){
    height0 = 0
    marginTopHeader = 24
    heightPicture=240
    heightHeaderHome = 70
    heightHeaderFilter = 100
    heightFooterBooking =82
    heightFooter = 60
    marginTopApp = 20
    heightHeaderHomeSearch = 130

    marginBottomAlert = 50
    if (height == 812){
        marginTopHeader = 50
        heightPicture=280
        heightHeaderHome = 100
        heightHeaderFilter = 130
        heightFooterBooking =110
        heightFooter = 93
        marginTopApp = 35
        heightHeaderHomeSearch = 100

        marginBottomAlert = 50
    } else if (height == 896){
        marginTopHeader = 48
        heightPicture=280
        heightHeaderHome = 100
        heightHeaderFilter = 130
        heightFooterBooking =110
        heightFooter = 91
        marginTopApp = 35
        heightHeaderHomeSearch = 100

        marginBottomAlert = 50
    } else if (height == 667){
        heightFooterBooking =85
        heightHeaderHome = 70
        heightHeaderFilter = 100
        heightHeaderHomeSearch = 130

        marginBottomAlert = 50
    } else if (height == 736){
        heightFooterBooking =85
        heightHeaderHome = 70
        heightHeaderFilter = 100
        heightHeaderHomeSearch = 130

        marginBottomAlert = 50
    }
}

var sizes = {
    heightFooterBooking:heightFooterBooking,
    heightFooter:heightFooter,
    marginTopApp:marginTopApp,
    marginTopHeader:marginTopHeader,
    heightPicture:heightPicture,
    height0:height0,
    heightHeaderHome:heightHeaderHome,
    heightHeaderFilter:heightHeaderFilter,
    heightHeaderHomeSearch:heightHeaderHomeSearch
}

export default sizes