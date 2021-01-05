import {SET_BOOKINGS, DELETE_BOOKINGS, RESET_BOOKINGS} from '../types';

const setBookings = (bookings) => ({
  type: SET_BOOKINGS,
  bookings,
});

const deleteBookings = (bookingsIDs) => ({
  type: DELETE_BOOKINGS,
  bookingsIDs,
});

const resetBookings = () => ({
  type: RESET_BOOKINGS,
});

export {setBookings, resetBookings, deleteBookings};
