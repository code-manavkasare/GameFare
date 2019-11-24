import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MatIcon from 'react-native-vector-icons/MaterialIcons';
import FontIcon from 'react-native-vector-icons/FontAwesome';

import { Col, Row, Grid } from "react-native-easy-grid";
import colors from '../../style/colors'
import styleApp from '../../style/style'
import {date,time} from '../../layout/date/date'

export default class RowProductAdd extends Component {
    constructor(props) {
        super(props);
        this.state = {
          showTimeSelection:false
        };
        this.componentWillMount = this.componentWillMount.bind(this);
      }
    componentWillMount(){
    }
    dateTime(start,end) {
        if (date(start,'ddd, MMM D') == date(end,'ddd, MMM D')) {
          return (
            <View>
              <Text style={styleApp.input}>{date(start,'ddd, MMM D')}</Text>
              <Text style={[{fontFamily:'OpenSans-Regular'}]}>
                <Text style={styles.inputOff}>From </Text> 
                {time(start,'h:mm a')} 
                <Text style={styles.inputOff}> to </Text> 
                {time(end,'h:mm a')}
              </Text>
            </View>
          )
        }
        return (
          <View>
            <Text style={styles.subtitle}>Start</Text>
    
            <Text style={styles.textComment}>{date(start,'ddd, MMM D')} <Text style={styles.smallText}> at</Text> {time(start,'h:mm a')}</Text>
            
            <Text style={[styles.subtitle,{marginTop:10}]}>End</Text>
    
            <Text style={[styles.textComment,{marginTop:4}]}>{date(end,'ddd, MMM D')} <Text style={styles.smallText}> at</Text> {time(end,'h:mm a')}</Text>
          </View>
        )
      }
  render() {
    return this.dateTime(this.props.start,this.props.end)
  }
}

const styles = StyleSheet.create({
    textComment:{
        color:colors.title,
        fontSize:16,
        fontFamily: 'OpenSans-Regular',
      },
      subtitle:{
        color:colors.title,
        fontSize:12,
        fontFamily: 'OpenSans-SemiBold',
      },
      smallText:{
        color:colors.title,
        fontSize:14,
        fontFamily: 'OpenSans-Regular',
      },
});

