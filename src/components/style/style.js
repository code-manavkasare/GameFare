import {
    StyleSheet,
    Dimensions
  } from 'react-native';
import sizes from './sizes';
import colors from './colors'
// import {Fonts} from '../../utils/Font'
const { height, width } = Dimensions.get('screen')

export default styles = StyleSheet.create({
    center:{
      justifyContent:'center',
      alignItems:'center',
    },
    fullView:{height:height},
    center2:{
      justifyContent:'center',
    },
    center3:{
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    center4:{
      alignItems: 'center',
    },
    divider:{
      height:1,width:'100%',
      marginTop:20,marginBottom:10,
      backgroundColor:'#eaeaea'
    },
    title:{
      fontSize:24,
      fontFamily: 'OpenSans-Bold',
      color:colors.title,
    },
    text:{
      fontSize:15,
      fontFamily: 'OpenSans-SemiBold',
      color:colors.title,
    },
    input:{
      fontSize:15,
      fontFamily: 'OpenSans-Regular',
      color:colors.title,
    },
    inputOff:{
      color:'#C7C7CC',
      fontSize:15,
      fontFamily: 'OpenSans-Regular'
    },
    subtitle:{
      fontSize:14,
      fontFamily: 'OpenSans-Regular',
      color:colors.title,
    },
    buttonRound:{
      width:65,height:65,
      borderRadius:32.5,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth:1,
      borderColor:'#eaeaea',
      backgroundColor:colors.green,
      position:'absolute',
      bottom:40,
      right:20,
      zIndex:60,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 20,
      shadowOpacity: 0.05,
    },
    buttonRound2:{
      width:65,height:65,
      borderRadius:32.5,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth:1,
      borderColor:'#eaeaea',
      backgroundColor:colors.green,
      position:'absolute',
      bottom:40,
      right:100,
      zIndex:60,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 20,
      shadowOpacity: 0.05,
    },
    headerBooking:{
      position:'absolute',
      top:0,
      height:sizes.heightHeaderHome,
      paddingTop:sizes.marginTopHeader-5,

      borderBottomWidth:0,
      backgroundColor:colors.primary,
      zIndex:20,
      width:width,
      borderColor:'#EAEAEA',
      //paddingLeft:0,
      alignItems: 'center',
    },
    footerBooking:{
      position:'absolute',
      bottom:0,
      borderTopWidth:0,
      // backgroundColor:'red',
      height:sizes.heightFooterBooking,
      paddingTop:15,
      // paddingLeft:20,paddingRight:20,
      //borderTopWidth:1,
      zIndex:20,
      width:width,
      borderColor:'#EAEAEA',
    },
    cardSelect:{
      height:50,
      marginTop:10,
      borderWidth:1,
      width:'100%',
      backgroundColor:'white',
      borderRadius:5,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      borderColor:'#eaeaea',
      shadowOpacity: 0.05,
    },
    searchBarHome:{
      height:45,
      marginTop:10,
      borderWidth:0,
      width:'100%',
      backgroundColor:colors.primaryLight,
      borderRadius:2,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      borderColor:'#eaeaea',
      shadowOpacity: 0,
    },
    inputForm:{
      height:50,
      marginTop:10,
      borderBottomWidth:1,
      width:'100%',
      backgroundColor:'white',
      borderRadius:0,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      borderColor:'#eaeaea',
      shadowOpacity: 0,
    },
    cardSelectFlex:{
      flex:1,
      // marginTop:10,
      borderWidth:1,
      width:'100%',
      backgroundColor:'white',
      borderRadius:5,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      borderColor:'#eaeaea',
      shadowOpacity: 0.05,
    },
    cardSelectOn:{
      height:50,
      marginTop:10,
      borderWidth:1,
      width:'100%',
      backgroundColor:'white',
      borderRadius:5,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      borderColor:colors.primary,
      shadowOpacity: 0,
    },
    viewSport:{
      backgroundColor:colors.greenLight,
      borderRadius:3,
      paddingLeft:10,
      paddingRight:10,
      //top:15,
      //right:0,
      height:25,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textSport:{
      color:colors.greenStrong,
      fontSize:13,
      fontFamily: 'OpenSans-SemiBold',
    },
    footerText:{
      color:colors.primary,
      fontSize:13,
      fontFamily: 'OpenSans-SemiBold',
    },
    footerTextOff:{
      color:colors.title,
      fontSize:13,
      fontFamily: 'OpenSans-SemiBold',
    }
  });