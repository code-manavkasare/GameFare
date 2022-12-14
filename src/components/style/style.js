import {StyleSheet, Dimensions} from 'react-native';
import {
  heightHeaderHome,
  marginTopHeader,
  marginTopApp,
  marginBottomApp,
  height,
  borderRadius,
  heightFooterBooking,
  heightFooter,
  width,
} from './sizes';
import colors from './colors';

const font = 'Avenir-Book';
const fontLight = 'Avenir-Light';

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
  center7: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  center8: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  shadowWhite: {
    shadowColor: colors.off,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  shadowWeak: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  shadowIcon: {
    shadowColor: colors.greyDark,
    shadowOpacity: 1,
    shadowRadius: 10,
    textShadowOffset: {width: 2, height: 2},
  },
  divider: {
    height: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: colors.off,
  },
  divider2: {
    height: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: colors.off,
  },
  divider3: {
    height: 1,
    width: '90%',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: '5%',
    backgroundColor: colors.off,
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
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 0,
    borderColor: colors.borderColor,
  },
  cardGroup: {
    backgroundColor: 'white',
    height: 240,
    width: 250,
    marginRight: 10,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.off,
  },
  cardConversation: {
    height: 90,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  title: {
    fontSize: 23,
    fontFamily: font,
    color: colors.title,
    fontWeight: '700',
  },
  titleNoColor: {
    fontSize: 23,
    fontFamily: font,
    fontWeight: '700',
  },
  titleSmall: {
    fontSize: 23,
    fontFamily: font,
    color: colors.title,
    fontWeight: '500',
  },
  text: {
    fontSize: 16,
    fontFamily: font,
    color: colors.title,
    fontWeight: '600',
  },
  textBold: {
    fontSize: 16,
    fontFamily: font,
    color: colors.title,
    fontWeight: 'bold',
  },
  smallText: {
    fontSize: 13,
    fontFamily: fontLight,
    color: colors.title,
  },
  textField: {
    justifyContent: 'center',
    height: 50,
    opacity: 1,
    width: '100%',
    borderRadius: 15,
    backgroundColor: colors.greyLight,
    marginVertical: 10,
    paddingLeft: 15,
    fontSize: 16,
    fontFamily: font,
    color: colors.title,
    fontWeight: 'bold',
  },
  input: {
    fontSize: 17,
    fontFamily: font,
    fontWeight: '600',
    color: colors.title,
  },
  inputBox: {
    height: 55,
    backgroundColor: colors.white,
    borderRadius: 0,
    borderColor: colors.off,
    // paddingLeft: 10,
    marginTop: 10,
    borderBottomWidth: 1,
  },
  inputOff: {
    color: '#C7C7CC',
    fontSize: 15,
    fontFamily: font,
  },
  subtitle: {
    fontFamily: font,
    fontSize: 17,
    color: colors.greyDark,
  },
  subtitleSX: {
    fontFamily: fontLight,
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
  cardPost: {
    width: width,
    marginBottom: 25,
  },
  cardClubSmall: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 10,
    backgroundColor: colors.greyDarker,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  cardInvitation: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 15,
    marginBottom: 25,
    backgroundColor: colors.greyLight,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  cardArchive: {
    width: width / 2,
    borderWidth: 1,
    borderColor: colors.white,
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: colors.title,
  },
  fullCardArchive: {
    width: width,
    height: width,
    overflow: 'hidden',
    backgroundColor: colors.title,
  },
  cardArchive3: {
    width: width / 3,
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: colors.title,
    borderWidth: 1,
    borderColor: colors.white,
  },
  cardArchive4: {
    width: width / 4,
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: colors.title,
    borderWidth: 1,
    borderColor: colors.white,
  },
  cardArchiveVideoLibrary: {
    width: width / 3,
    height: 170,
    borderRadius: 0,
    overflow: 'hidden',
    borderBottomWidth: 1.5,
    borderColor: colors.white,
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
  buttonCoach: {
    borderColor: colors.off,
    height: 40,
    width: 110,
    borderRadius: 20,
    borderWidth: 1,
    position: 'absolute',
    zIndex: 40,
    bottom: 20,
    right: '37%',
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
    shadowOpacity: 0.1,
  },
  headerBooking: {
    position: 'absolute',
    top: 0,
    height: heightHeaderHome,
    paddingTop: marginTopHeader - 5,

    borderBottomWidth: 0,
    backgroundColor: colors.primary,
    zIndex: 20,
    width: width,
    borderColor: '#EAEAEA',
    alignItems: 'center',
  },
  inputMessage: {
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
    height: heightFooterBooking,
    paddingTop: 15,
    zIndex: 20,
    width: width,
    borderColor: '#EAEAEA',
  },
  footerModal: {
    position: 'absolute',
    bottom: marginTopApp + 25,
    borderTopWidth: 0,
    height: heightFooterBooking,
    paddingTop: 15,
    zIndex: 20,
    width: width,
    borderColor: '#EAEAEA',
    paddingLeft: '5%',
    paddingRight: '5%',
  },
  footerBook: {
    position: 'absolute',
    bottom: heightFooter + marginBottomApp + 10,
    borderTopWidth: 0,
    height: 75,
    paddingTop: 10,
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
    height: 11,
    width: 11,
    borderRadius: 5.5,
    top: -4,
    left: 18,
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
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 11,
    marginTop: 0,
    fontFamily: font,
  },
  footerTextOff: {
    color: colors.primaryLight,
    fontSize: 11,
    marginTop: 0,
    fontFamily: font,
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
    fontFamily: font,
    fontWeight: '600',
    fontSize: 14,
  },
  stylePage: {
    flex: 1,
    minHeight: height,
    borderLeftWidth: 0,
    borderRadius: 0,
    borderColor: colors.off,
    backgroundColor: colors.white,
  },
  stylePageModal: {
    flex: 1,
    maxHeight: height - marginTopApp - 25,
    borderLeftWidth: 0,
    borderRadius: borderRadius,
    borderColor: colors.off,
    backgroundColor: colors.white,
  },
  marginView: {
    paddingLeft: '5%',
    paddingRight: '5%',
    width: '100%',
  },
  viewHome: {
    marginBottom: 0,
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 20,
    borderColor: colors.off,
    borderTopWidth: 0,
    marginLeft: 0,
    marginRight: 0,
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
  fullAppModal: {
    width: '100%',
    height: height - marginTopApp,
    borderRadius: borderRadius,
  },
  eventTitle: {
    color: colors.primary,
    marginTop: 0,
    fontFamily: font,
    fontSize: 18,
  },
  imgUser: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.off,
  },
  buttonCancel: {
    height: 55,
    borderTopWidth: 0.4,
    borderBottomWidth: 0.4,
    marginTop: 40,
    borderColor: colors.grey,
  },
  flexColumnBlack: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  flexColumnWhite: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  viewBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    width: 20,
    borderRadius: 10,
    paddingLeft: 1,
    paddingTop: 1,
    backgroundColor: colors.blue,
  },
  absoluteViewBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 11,
    width: 11,
    borderRadius: 10,
    backgroundColor: colors.blue,
    position: 'absolute',
    top: 2,
    right: '34%',
  },
});

export default styles;
