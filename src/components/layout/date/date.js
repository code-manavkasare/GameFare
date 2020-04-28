import moment from 'moment';
import jstz from 'jstz';

function date(dateOff, format) {
  let formatToUse = format;
  var date = dateOff.split(' GMT')[0];
  if (!formatToUse) formatToUse = 'ddd, MMM D';
  return moment(new Date(date))
    .format(formatToUse)
    .toString();
}

function time(dateOff, format) {
  let formatToUse = format;
  var date = dateOff.split(' GMT')[0];
  if (!formatToUse) formatToUse = 'h:mm a';
  return moment(new Date(date))
    .format(formatToUse)
    .toString();
}

function timeZone(date, timeZone) {
  if (
    moment.tz(new Date(), jstz.determine().name()).format('Z') !=
    date.split(' GMT')[1]
  )
    return '(' + timeZone + ')';
  return null;
}

module.exports = {date, time, timeZone};
