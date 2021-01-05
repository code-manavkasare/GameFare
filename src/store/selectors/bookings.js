import {createSelector} from 'reselect';

const bookingSubSelector = (state, props) => state.bookings[props.id];

const bookingSelector = createSelector(
  bookingSubSelector,
  (item) => item,
);

export {bookingSelector};
