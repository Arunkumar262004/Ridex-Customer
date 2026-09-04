import {configureStore} from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import rideReducer from './slices/rideSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
  },
});

export default store;