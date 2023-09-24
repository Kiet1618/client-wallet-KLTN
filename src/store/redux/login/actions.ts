import { createAsyncThunk } from '@reduxjs/toolkit';

export const setToken = createAsyncThunk<any, string>(
  'login/setToken',
  async (token: string, { rejectWithValue, fulfillWithValue }) => {
    try {
      // call api
      return fulfillWithValue(token);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
