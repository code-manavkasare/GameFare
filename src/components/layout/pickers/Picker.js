import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Picker,
} from 'react-native';

import colors from '../../style/colors';

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choice:''
    };
    this.componentWillMount = this.componentWillMount.bind(this);
  }
  componentWillMount(){   
  }
  render() {  
    return (
      <Picker
        selectedValue={this.props.choice}
        onValueChange={(choice) => {
            this.props.setChoice(choice)
        }}
        itemStyle={{fontFamily: 'OpenSans-Regular',fontSize:18,color:colors.title,height:100,}}
        > 
        {this.props.choices.map((i, index) => (
            <Picker.Item key={index} label={i} value={i} />
        ))}
      </Picker>
    );
  }
}

