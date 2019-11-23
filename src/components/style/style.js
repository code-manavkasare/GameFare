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
    center5:{
      justifyContent: 'flex-end',
    },
    divider:{
      height:0.5,width:'100%',
      marginTop:20,marginBottom:10,
      backgroundColor:colors.borderColor
    },
    divider2:{
      height:0.3,width:'100%',
      borderTopWidth:0.5,
      marginTop:20,
      marginBottom:20,
      borderColor:colors.grey
    },
    title:{
      fontSize:20,
      fontFamily: 'OpenSans-SemiBold',
      color:colors.title,
    },
    text:{
      fontSize:15,
      fontFamily: 'OpenSans-SemiBold',
      color:colors.title,
    },
    smallText:{
      fontSize:14,
      fontFamily: 'OpenSans-Regular',
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
    iconFooter:{
      height:18,width:18,
      marginTop:3,marginBottom:-5
    },
    
    buttonRound:{
      width:65,height:65,
      borderRadius:32.5,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth:0.3,
      borderColor:colors.borderColor,
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
    shade:{
      shadowColor: '#46474B',
      shadowOffset: { width: 2, height: 0 },
      shadowRadius: 20,
      shadowOpacity: 0.3,
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
    roundView:{
      width:20,height:20,
      borderRadius:10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewNumber:{
      height:27,width:27,borderRadius:13.5,backgroundColor:colors.off2,borderColor:colors.off,borderWidth:0.7
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
      marginTop:0,
      borderBottomWidth:1,
      width:'100%',
      backgroundColor:'white',
      borderRadius:5,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      borderColor:'#eaeaea',
      shadowOpacity: 0,
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
    voile:{
      position:'absolute',height:height,backgroundColor:colors.title,width:width,opacity:0.4,
      // zIndex:220,
    },
    inputForm:{
      height:50,
      marginTop:10,
      width:'100%',
      backgroundColor:'white',
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 15,
      borderColor:colors.borderColor,
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
      color:'white',
      fontSize:11,
      marginTop:0,
      fontFamily: 'OpenSans-SemiBold',
    },
    footerTextOff:{
      color:colors.primaryLight,
      fontSize:11,
      marginTop:0,
      fontFamily: 'OpenSans-SemiBold',
    },
    styleHeader:{
        backgroundColor: 'white',
        borderBottomWidth:0.3,
        borderColor:'red',
        shadowRadius: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowOffset: {
            height: 0,
        },
        borderLeftWidth:0,
    },
    textHeader:{
      color:colors.title,
      fontFamily:'OpenSans-SemiBold',
      fontSize:13,
    },
    stylePage:{
      flex:1,borderColor:'white',
      borderLeftWidth:0,borderColor:colors.off
    },
    marginView:{
      marginLeft:20,
      width:width-40
    },
    viewHome:{
      marginBottom:0,
      backgroundColor:'white',
      paddingTop:20,
      paddingBottom:20,
      borderColor:colors.off,
      //borderBottomWidth:0.3,
      //borderTopWidth:0.3,
      borderTopWidth:0,
      marginLeft:0,
      marginRight:0,
      // borderBottomWidth:1,
      marginTop:15,
      borderRadius:0,
      shadowColor: '#46474B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius:8
    }
  });