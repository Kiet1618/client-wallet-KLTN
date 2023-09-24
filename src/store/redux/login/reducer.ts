import { createSlice } from '@reduxjs/toolkit';
import * as actions from './actions';
import { LoginState } from './types';

const initialState = {
  token: {
    data: "",
    loading: false,
    error: {},
  },
} as LoginState;

export const login = createSlice({
  name: 'login',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(actions.setToken.pending, (state, action) => {
      state.token.loading = true;
    });
    builder.addCase(actions.setToken.fulfilled, (state, action) => {
      state.token.data += action.payload;
      state.token.loading = false;
    });
    builder.addCase(actions.setToken.rejected, (state, action) => {
      state.token.error = action.payload;
      state.token.loading = false;
    });
  },
});

// Reducers and actions
//export const { token } = login.actions;

export default login.reducer;
