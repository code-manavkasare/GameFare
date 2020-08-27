import React, {Component} from 'react';
import {Platform, PermissionsAndroid, Dimensions} from 'react-native';
import moment from 'moment';
import {request, PERMISSIONS} from 'react-native-permissions';


const minutes = (time) => {
  return Math.floor(time / 60);
};

const seconds = (time, displayMilliseconds) => {
  let sec = (time % 60).toFixed(0);
  if (displayMilliseconds) sec = Math.floor(time % 60).toFixed(0);
  // if (sec.length === 1 && Number(sec) !== 0) return '0 ' + sec;
  return sec;
};

const milliSeconds = (time) => {
  const min = minutes(time) * 60;
  const sec = Math.floor(time % 60);
  let ms = Number(((time - (min + sec)) * 100).toFixed(0));

  if (ms.toString().length === 1) return '0' + ms;
  if (ms === 100) return '00';
  if (ms === 0) return '00';
  return ms;
};

async function getPermissionCalendar() {
  if (Platform.OS === 'ios') {
    var permission = await request(PERMISSIONS.IOS.CALENDARS);
  } else {
    var permission = await request(PERMISSIONS.ANDROID.WRITE_CALENDAR);
  }
  if (permission !== 'granted') return false;
  return true;
}

function isDatePast(date) {
  return moment().valueOf() > moment(date).valueOf();
}

const duration = (value) => {
  const min = minutes(value);
  if (min === 0) return seconds(value) + ' sec';
  return minutes(value) + ' min ' + seconds(value) + ' sec';
};

const formatDuration = (duration, numerical) => {
  if (!numerical) {
    if (duration > 60)
      return (
        Math.round(duration / 60).toString() +
        ' minute' +
        (Math.round(duration / 60) !== 1 ? 's' : '') +
        ' long'
      );
    else
      return (
        Math.round(duration).toString() +
        ' second' +
        (Math.round(duration) !== 1 ? 's' : '') +
        ' long'
      );
  }
  function pad(num, size) {
    var s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
  }
  if (duration < 0) duration = 0;
  let ms = duration % 1000;
  let sec = ((duration - ms) / 1000) % 60;
  let min = ((duration - ms - sec * 1000) / 60000) % 60;
  let hours = ((duration - ms - sec * 1000 - min * 60000) / 3600000) % 24;
  return (
    (hours > 0 ? `${pad(hours, 2)}:` : ``) + `${pad(min, 2)}:${pad(sec, 2)}`
  );
};

class FormatDate extends Component {
  //// Required props: date
  // This component re-renders every 60 seconds
  // and formats the date in a nice way

  // Within 1 minute : 'Just now'
  // Within 7 days   : '{x} {'minutes','hours','days'} ago'
  //    eg. 10 minutes ago, 10 hours ago, 10 days ago, etc
  // Within 1 year   : '{day of week}, {month} {day}'
  //    eg. 'Mon, Jul 20', 'Wed, Aug 5'
  // Earlier         : '{month} {year}'
  //    eg. 'Jul 2018', 'Jan 2017'

  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 60000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  tick() {
    const {date} = this.props;
    let earlier = moment(Date.now()).subtract(7, 'days');
    if (date > earlier) this.setState({});
  }
  formatDate = (date) => {
    let justNow = moment(Date.now()).subtract(1, 'minute');
    let earlier = moment(Date.now()).subtract(7, 'days');
    let lastYear = moment(Date.now()).subtract(1, 'year');
    if (date > justNow) return 'Just now';
    else if (date > earlier) return moment(date).fromNow();
    else if (date > lastYear) return moment(date).format('ddd, MMM DD');
    else return moment(date).format('MMMM YYYY');
  };
  render() {
    const {date} = this.props;
    return this.formatDate(date);
  }
}

module.exports = {
  getPermissionCalendar,
  isDatePast,
  duration,
  FormatDate,
  formatDuration,
  minutes,
  seconds,
  milliSeconds,
};
