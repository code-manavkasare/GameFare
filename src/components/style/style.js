import {StyleSheet, Dimensions} from 'react-native';
import sizes from './sizes';
import colors from './colors';
// import {Fonts} from '../../utils/Font'
const {height, width} = Dimensions.get('screen');

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullView: {height: height},
  center2: {
    justifyContent: 'center',
  },
  center3: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  center4: {
    alignItems: 'center',
  },
  center5: {
    justifyContent: 'flex-end',
  },
  center6: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  divider: {
    height: 0.5,
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: colors.borderColor,
  },
  divider2: {
    height: 0.3,
    width: '100%',
    borderTopWidth: 0.5,
    marginTop: 20,
    marginBottom: 20,
    borderColor: colors.grey,
  },
  cardEventSM: {
    backgroundColor: 'white',
    height: 190,
    width: 230,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,

    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.off,
  },
  cardEvent: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
    // borderTopWidth:0.3,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 0,
    borderColor: colors.borderColor,
  },
  cardGroup: {
    backgroundColor: 'white',
    // overflow:'hidden',
    height: 240,
    width: 250,
    marginRight: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.off,
  },
  cardConversation: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'OpenSans-SemiBold',
    color: colors.title,
  },
  text: {
    fontSize: 15,
    fontFamily: 'OpenSans-SemiBold',
    color: colors.title,
  },
  textBold: {
    fontSize: 15,
    fontFamily: 'OpenSans-Bold',
    color: colors.title,
  },
  smallText: {
    fontSize: 13,
    fontFamily: 'OpenSans-Regular',
    color: colors.title,
  },
  input: {
    fontSize: 15,
    fontFamily: 'OpenSans-SemiBold',
    color: colors.title,
  },
  inputOff: {
    color: '#C7C7CC',
    fontSize: 15,
    fontFamily: 'OpenSans-SemiBold',
  },
  subtitle: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 15,
    color: colors.greyDark,
  },
  subtitleSX: {
    fontFamily: 'OpenSans-Light',
    fontSize: 15,
    color: colors.title,
  },
  iconFooter: {
    height: 18,
    width: 18,
    marginTop: 3,
    marginBottom: -5,
  },
  buttonRoundLibray: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    height: 50,
    borderRadius: 30,
    opacity: 0.8,
    width: 50,
    zIndex: 20,
    backgroundColor: colors.title,
    borderWidth: 1,
    borderColor: colors.off,
  },
  buttonRound: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.3,
    borderColor: colors.borderColor,
    backgroundColor: colors.green,
    position: 'absolute',
    bottom: 40,
    right: 20,
    zIndex: 60,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 20,
    shadowOpacity: 0.05,
  },
  buttonRound2: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eaeaea',
    backgroundColor: colors.green,
    position: 'absolute',
    bottom: 40,
    right: 100,
    zIndex: 60,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 20,
    shadowOpacity: 0.05,
  },
  buttonMap: {
    borderColor: colors.off,
    height: 40,
    width: 90,
    borderRadius: 20,
    borderWidth: 1,
    position: 'absolute',
    zIndex: 40,
    bottom: 20,
    right: '40%',
  },
  textShade: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 1,
  },
  shade: {
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 5,
    shadowOpacity: 0.05,
  },
  headerBooking: {
    position: 'absolute',
    top: 0,
    height: sizes.heightHeaderHome,
    paddingTop: sizes.marginTopHeader - 5,

    borderBottomWidth: 0,
    backgroundColor: colors.primary,
    zIndex: 20,
    width: width,
    borderColor: '#EAEAEA',
    //paddingLeft:0,
    alignItems: 'center',
  },
  inputMessage: {
    //  paddingTop: -15,
    // paddingBottom: 5,
    minHeight: 50,
    marginBottom: 10,
    flex: 1,
    backgroundColor: 'red',
    paddingLeft: 0,
    paddingRight: 10,
    lineHeight: 21,
  },
  cardMessage: {
    flex: 1,
    width: '100%',
    marginBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
  roundView: {
    height: 30,
    width: 30,
    borderRadius: 20,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.off2,
    borderWidth: 0.5,
    borderColor: colors.grey,
  },
  roundView2: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.off2,
    borderWidth: 0.5,
    borderColor: colors.grey,
  },
  viewNumber: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.off2,
    borderColor: colors.off,
    borderWidth: 0.7,
  },
  footerBooking: {
    position: 'absolute',
    bottom: 0,
    borderTopWidth: 0,
    // backgroundColor:'red',
    height: sizes.heightFooterBooking,
    paddingTop: 15,
    // paddingLeft:20,paddingRight:20,
    //borderTopWidth:1,
    zIndex: 20,
    width: width,
    borderColor: '#EAEAEA',
  },
  cardSelect: {
    height: 55,
    marginTop: 0,
    borderWidth: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    borderColor: '#eaeaea',
    shadowOpacity: 0.05,
  },
  searchBarHome: {
    height: 45,
    marginTop: 10,
    borderWidth: 0,
    width: '100%',
    backgroundColor: colors.primaryLight,
    borderRadius: 2,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    borderColor: '#eaeaea',
    shadowOpacity: 0,
  },
  voile: {
    position: 'absolute',
    height: height,
    backgroundColor: colors.backdropModal,
    width: width,
    opacity: 0.65,
    // zIndex:220,
  },
  roundMessage: {
    height: 9,
    width: 9,
    borderRadius: 4.5,
    top: 8.5,
    left: width / 5 - 37,
    position: 'absolute',
    zIndex: 30,
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: colors.primary,
  },
  inputForm: {
    height: 45,
    marginTop: 10,
    width: '100%',
    borderBottomWidth: 1,
    backgroundColor: 'white',
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    borderColor: colors.grey,
    shadowOpacity: 0,
  },
  cardSelectFlex: {
    flex: 1,
    // marginTop:10,
    borderWidth: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    borderColor: '#eaeaea',
    shadowOpacity: 0.05,
  },
  cardSelectOn: {
    height: 50,
    marginTop: 10,
    borderWidth: 1,
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 5,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowRadius: 15,
    borderColor: colors.primary,
    shadowOpacity: 0,
  },
  viewSport: {
    backgroundColor: colors.greenLight,
    borderRadius: 3,
    paddingLeft: 10,
    paddingRight: 10,
    //top:15,
    //right:0,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSport: {
    color: colors.greenStrong,
    fontSize: 13,
    fontFamily: 'OpenSans-SemiBold',
  },
  regularText: {
    fontFamily: 'OpenSans-Regular',
  },
  footerText: {
    color: 'white',
    fontSize: 11,
    marginTop: 0,
    fontFamily: 'OpenSans-SemiBold',
  },
  footerTextOff: {
    color: colors.primaryLight,
    fontSize: 11,
    marginTop: 0,
    fontFamily: 'OpenSans-SemiBold',
  },
  styleHeader: {
    backgroundColor: 'white',
    borderBottomWidth: 0.3,
    borderColor: 'red',
    shadowRadius: 0,
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: {
      height: 0,
    },
    borderLeftWidth: 0,
  },
  textHeader: {
    color: colors.title,
    fontFamily: 'OpenSans-SemiBold',
    fontSize: 13,
  },
  stylePage: {
    flex: 1,
    borderLeftWidth: 0,
    borderColor: colors.off,
  },
  marginView: {
    marginLeft: 20,
    width: width - 40,
  },
  viewHome: {
    marginBottom: 0,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 20,
    borderColor: colors.off,
    //borderBottomWidth:0.3,
    //borderTopWidth:0.3,
    borderTopWidth: 0,
    marginLeft: 0,
    marginRight: 0,
    // borderBottomWidth:1,
    marginTop: 15,
    borderRadius: 0,
    shadowColor: '#46474B',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 8,
  },
  fullSize: {
    width: '100%',
    height: '100%',
  },
  eventTitle: {
    color: colors.primary,
    marginTop: 0,
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
  },
});

export default styles;
