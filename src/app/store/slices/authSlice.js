import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,

  isAuthenticated: false,

  loading: false,

  initialized: false,
};

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    loginStart: state => {
      state.loading = true;
    },

    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      state.isAuthenticated = true;
      state.loading = false;
      state.initialized = true;
    },

    loginFailure: state => {
      state.loading = false;
    },

    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      state.isAuthenticated = true;
      state.initialized = true;
      state.loading = false;
    },

    setInitialized: state => {
      state.initialized = true;
    },

    logout: state => {
      state.user = null;
      state.token = null;

      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  setAuth,
  setInitialized,
  logout,
} = authSlice.actions;

export default authSlice.reducer;