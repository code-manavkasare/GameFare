import React, { Component } from 'react';

import {  View, ActivityIndicator, Image,Animated,Easing  } from 'react-native';
import FastImage from 'react-native-fast-image'
import ls from 'react-native-local-storage'

export default class AsyncImage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showLocalImg:true,
            initialLoader:true,
            zIndexInitial:-1,
            zIndexCached:10,
            checkToken:''

        };
        this.AnimatedValue = new Animated.Value(0);
        this.opacityFastImageCached= new Animated.Value(0);
        this.componentDidMount = this.componentDidMount.bind(this);
      }

    async componentDidMount() {
        try {
            if (this.props.mainImage !== undefined) {
                var tokenImg = this.props.mainImage.split('token=')[1]
                if (tokenImg != undefined) {
                    var checkToken = await ls.get(tokenImg)
                    if (checkToken == null) checkToken = 'null'
                }
            } else {
                var checkToken = 'null'
            }
            await this.setState({checkToken:checkToken})
            this.setState({initialLoader:false})
        }catch (err) {
            console.log('error image cached')
            console.log(err)
        }
    }
    enterPictureInitial () {
        Animated.timing( this.AnimatedValue, {
            toValue:1,
            easing: Easing.linear,
            useNativeDriver: true,
            duration:40
          }).start()
    }
    enterPictureCached () {
        Animated.timing( this.opacityFastImageCached, {
            toValue:1,
            easing: Easing.linear,
            useNativeDriver: true,
            duration:250
          }).start()
    }
    getMainImage() {
        if (this.props.mainImage == undefined) return this.props.image
        return this.props.mainImage
    }
    imgDisplay () {
        console.log('le check token')
        console.log(this.state.checkToken)
        if (this.state.checkToken == 'null') {
            return (
                <Animated.View style={{opacity:this.opacityFastImageCached,height:this.props.style.height,width:this.props.style.width}}>
                    <FastImage
                            resizeMode={"cover"}
                            onLoadEnd={() => {
                                console.log('end initial')
                                console.log(this.props.mainImage)
                                this.enterPictureCached()
                                if (this.props.mainImage !== undefined) {
                                    try {
                                        var tokenImg = this.props.mainImage.split('token=')[1]
                                        console.log('cest le token')
                                        if (tokenImg != undefined) ls.save(tokenImg,tokenImg)
                                    } catch (err) {
                                        true
                                    }   
                                }
                            }}
                            style={[this.props.style,{zIndex:10,position:'absolute',top:0}]}
                            source={{
                                uri: this.getMainImage(),
                            }}
                        />
                </Animated.View>
            )
        } else {
            return (
                <FastImage
                        resizeMode={"cover"}
                        onLoadEnd={() => {
                            console.log('end loader')
                            console.log(this.props.mainImage)
                            // this.enterPictureCached()
                        }}
                        style={[this.props.style,{zIndex:this.state.zIndexInitial}]}
                        source={{
                            uri: this.getMainImage(),
                        }}
                />
            )
        }
    }

    imgDisplay2 () {
        var tokenImg = this.props.mainImage.split('token=')[1]
        const checkToken = ls.get(tokenImg) 
        console.log('checkToken')
        console.log(checkToken)
        return (
            <Animated.View style={{opacity:this.opacityFastImageCached}}>
                    <FastImage
                        resizeMode={"cover"}
                        onLoadEnd={() => this.enterPictureCached()}
                        style={[this.props.style,{zIndex:this.state.zIndexInitial}]}
                        source={{
                            uri: this.props.mainImage,
                        }}
                    />
                </Animated.View>
        )
    }
    

    componentWillReceiveProps(props) {
        this.props = props
        
    }

    styleImg () {

    }
    render() {
        return (
            <View style={{height:this.props.style.height,width:this.props.style.width}}>
                {   
                    !this.state.initialLoader?
                    this.imgDisplay()
                    :null
                }
            </View>
            
        )  
    }
}