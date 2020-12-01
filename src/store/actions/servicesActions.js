import {SET_SERVICES, RESET_SERVICES, DELETE_SERVICES} from '../types';

const setServices = (services) => ({
  type: SET_SERVICES,
  services,
});

const deleteServices = (servicesIDs) => ({
  type: DELETE_SERVICES,
  servicesIDs,
});

const resetServices = () => ({
  type: RESET_SERVICES,
});

export {setServices, resetServices, deleteServices};
