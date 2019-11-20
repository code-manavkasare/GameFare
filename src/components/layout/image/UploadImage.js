import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  ActivityIndicator,
  View,
  Keyboard,
  Dimensions,
  ScrollView,
  Image
} from 'react-native';
// import Permissions from 'react-native-permissions'

import {request, PERMISSIONS} from 'react-native-permissions';

import ImagePicker from 'react-native-image-picker';
import {connect} from 'react-redux';

import ActionSheet from 'react-native-action-sheet'
import ImageResizer from 'react-native-image-resizer';

import colors from '../../style/colors'
const { height, width } = Dimensions.get('screen')

import { Col, Row, Grid } from "react-native-easy-grid";
// import ImageView from 'react-native-image-view';

import FastImage from 'react-native-fast-image'
import AllIcons from '../icons/AllIcons'
import Button from '../Views/Button'
import styleApp from '../../style/style'


var init = true;
var BUTTONS = [
  'Take Photo...',
  'Choose from Library...',
  'Cancel',
];

const options = {
  quality: 1.0,
  storageOptions: {
    skipBackup: true,
  },
};

export default class ImageSelection extends Component {
      state = {
        photoPermission: "undetermined",
        cameraPermission: "undetermined",
        avatarSource: null,
        resized: null,
        img:'',
        editable: true,
        size: 100,
        loading: false,
        imgDisplay:[],
        showImg:false,
      }
      
      componentWillMount(){
        if (this.props.readOnly) this.setState({ avatarSource: { uri: this.props.beforePhotos[this.props.type] }})
      }
      componentWillReceiveProps(nextProps) {
        // if (nextProps.dataUser.infoUser.picture !== this.props.dataUser.infoUser.picture) {
        //   this.setState({ avatarSource: { uri: nextProps.dataUser.infoUser.picture }})
        // }
      }

      async selectPhoto(){
        this.setState({loading: true})
        if (Platform.OS == 'ios') {
            var permission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
            console.log('permission')
            console.log(permission)
            if (permission != 'granted') return this.setState({loading: false})
        } else {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Do you allow Wlnss go access your library?',
              message:
                '' +
                '',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
        }
        ImagePicker.launchImageLibrary(options, response => {    
            console.log('reponse')
            console.log(response) 
            if (response.uri) {
                this.resize(response.uri)
            } else if (response.didCancel) {
                this.setState( {loading: false} )
            }
        })
      }

      async takePhoto(){
        var granted = ''
        this.setState({loading: true})
        if (Platform.OS == 'ios') {
            var permission = await request(PERMISSIONS.IOS.CAMERA)
            console.log('permission')
            console.log(permission)
            if (permission != 'granted') return this.setState({loading: false})
        } else {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Do you allow Wlnss go access your camera?',
              message:
                '' +
                '',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
        }
        ImagePicker.launchCamera(options, response => {
            this.setState({loading: true})
            if (response.uri) {
              this.resize(response.uri)
            } else if (response.didCancel) {
              this.setState( {loading: false} )
            }
        })
      }

      addImage() {
        console.log('add image')
        if (this.props.readOnly) {
          this.setState({
            imgDisplay:[
              {
                source: {uri: this.state.avatarSource.uri},
                title: this.props.type,
              }
            ],
            showImg:true
          })
        } else {
          if (this.props.editable != false) {

            if (this.state.avatarSource) console.log("picking ", this.state.avatarSource.uri)
            
            ActionSheet.showActionSheetWithOptions({
                options: BUTTONS,
                cancelButtonIndex: 2,
                title: 'Take a picture',
              },
              (buttonIndex) => {
                if (buttonIndex == 0) this.takePhoto();
                else if (buttonIndex == 1) this.selectPhoto();
                else if (buttonIndex == 2) this.setState({loading: false})
              });
          }
        }
        
      }

      async resize(uri){
        try {
          console.log("resizing ", uri)
          var imgResized = await ImageResizer.createResizedImage(uri, 500, 500, 'JPEG', 80)
          imgResized = imgResized.uri
          console.log("resized ", imgResized)
          this.setState({loading: false,img:imgResized})
          this.props.setImage(uri, imgResized)
        } catch (err) {
          console.log(err);
          return Alert.alert('Unable to import photo', 'Compression encountered an error');
        }
    }
    loadingOpacity(){
      if (this.state.loading == true) return 0.7
      else 1.0
    }
    dynamicStyles(type) {
      if (type == "avi") return {
        marginTop:0, 
        width:this.props.size, 
        height:this.props.size, 
        borderRadius:(this.props.size/2)
      }; else if (type == "addPhoto") return {
        color:colors.primary,
        marginTop:0,
        fontFamily: 'OpenSans-Regular',
        fontSize:13,
      };  else if (type == "addPhoto2") return {
        color:colors.primary,
        marginTop:5,
        fontFamily: 'OpenSans-Regular',
        fontSize:13,
      };else if (type == "editPhoto") return {
        color:colors.primaryLight,
        marginTop:0,
        fontFamily: 'OpenSans-Regular',
        fontSize:13,
      }; else if (type == "activityIndicator") return {
        position: 'absolute',
        justifyContent:'center',
        alignSelf:'center',
        top:23
      }
    }
    renderFooter(currentImage) {
      // const {likes} = this.state;

      return (
          <View style={styles.footer}>
              <Text style={styles.footerText}>{currentImage.title}</Text>
          </View>
      );
  }
  render() {
    return (
    <View style={styles.container}>
        <View style={styleApp.center}>
        {
            this.state.img == ''?
            <AllIcons name='image' type='font' color={colors.title} size={55} />
            :
            <Image style={{height:150,width:200,borderRadius:5,marginTop:10}} source={{uri: this.state.img}}/>
        }
        </View>

        <View style={{height:30}} />
        

        <Button view={() => {
            return <Row>
                <Col style={styleApp.center2} size={15}>
                    <AllIcons name='camera' type='font' color={colors.title} size={20} />
                </Col>
                <Col style={styleApp.center2} size={70}>
                    <Text style={styleApp.text}>Take Photo</Text>
                </Col>
                <Col style={styleApp.center3} size={15}>
                    <AllIcons name='keyboard-arrow-right' type='mat' color={colors.title} size={20} />
                </Col>
            </Row>
            }} 
            click={() => this.takePhoto()}
            color='white'
            style={[styleApp.center,{backgroundColor:colors.green,height:50,borderTopWidth:1,borderColor:colors.off,marginTop:0,marginLeft:-20,width:width,paddingLeft:20,paddingRight:20}]}
            onPressColor={colors.off}
        />
        

        <Button view={() => {
            return <Row>
                <Col style={styleApp.center2} size={15}>
                    <AllIcons name='image' type='font' color={colors.title} size={20} />
                </Col>
                <Col style={styleApp.center2} size={70}>
                    <Text style={styleApp.text}>Choose from Library</Text>
                </Col>
                <Col style={styleApp.center3} size={15}>
                    <AllIcons name='keyboard-arrow-right' type='mat' color={colors.title} size={20} />
                </Col>
            </Row>
            }} 
            click={() => this.selectPhoto()}
            color='white'
            style={[styleApp.center,{backgroundColor:colors.green,height:50,borderTopWidth:1,borderColor:colors.off,marginTop:0,marginLeft:-20,width:width,paddingLeft:20,paddingRight:20}]}
            onPressColor={colors.off}
        />

        <ActivityIndicator style={this.dynamicStyles('activityIndicator')} animating={this.state.loading} size="small" color="white"/>

    </View>
    );
  }
}

const styles = StyleSheet.create({
  center:{
    alignItems: 'center',
    justifyContent: 'center',
  },
  container:{
    // justifyContent: 'center', alignItems: 'center',
    //backgroundColor:'red',
    //width:'100%',height:'100%'
  },
  footer: {
    width,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 0,
},
footerText: {
    color:'white',
    fontFamily: 'OpenSans-Regular',
    fontSize:16,
},
})
