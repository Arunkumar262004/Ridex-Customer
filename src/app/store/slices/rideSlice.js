import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  currentRide: null,

  pickup: null,

  destination: null,

  selectedVehicle: null,

  fareEstimate: null,

  loading: false,
};

const rideSlice = createSlice({
  name: 'ride',

  initialState,

  reducers: {
    setPickup: (state, action) => {
      state.pickup = action.payload;
    },

    setDestination: (state, action) => {
      state.destination = action.payload;
    },

    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },

    setFareEstimate: (state, action) => {
      state.fareEstimate = action.payload;
    },

    setCurrentRide: (state, action) => {
      state.currentRide = action.payload;
    },

    clearRide: state => {
      state.currentRide = null;
      state.pickup = null;
      state.destination = null;
      state.selectedVehicle = null;
      state.fareEstimate = null;
    },
  },
});

export const {
  setPickup,
  setDestination,
  setSelectedVehicle,
  setFareEstimate,
  setCurrentRide,
  clearRide,
} = rideSlice.actions;

export default rideSlice.reducer;