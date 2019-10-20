import moment from 'moment'
import jstz from 'jstz';


function date(dateOff,format) {
  console.log(dateOff)
  var date = dateOff.split(' GMT')[0]
  return (moment(date).format(format)).toString()
}

function time(dateOff,format) {
  var date = dateOff.split(' GMT')[0]
  return (moment(date).format(format)).toString()
}

function timeZone(date,timeZone) {
  if (moment.tz(new Date(), jstz.determine().name()).format('Z') != date.split(' GMT')[1]) return '(' + timeZone + ')'
  return null
}


module.exports = {date,time,timeZone};