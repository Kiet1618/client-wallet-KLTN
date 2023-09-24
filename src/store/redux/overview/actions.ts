import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { get } from 'lodash';

export const getHistoriesAddress = createAsyncThunk<any, { url: string }>(
  'overview/histories/address',
  async (payload, { rejectWithValue, fulfillWithValue }) => {
    try {
      const res = await axios.get(payload.url);
      const { data } = res;
      if(data?.message !== 'OK') {
        return fulfillWithValue([]);
      }

      const result = get(data, "result", []);
      if (result.length > 0) {
        return fulfillWithValue(result);
      }
      return fulfillWithValue([]);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);
