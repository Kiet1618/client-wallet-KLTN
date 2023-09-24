import { createAsyncThunk } from '@reduxjs/toolkit';

export const setCurrentListTokens = createAsyncThunk<any, object>(
  'set/current_list_tokens',
  async (listTokens: object, { fulfillWithValue }) => {
    return fulfillWithValue(listTokens);
  },
);


// export const addToken = createAsyncThunk<any, string>(
//   'set/add-token',
//   async (listTokens: string, { fulfillWithValue, }) => {
//     return fulfillWithValue(listTokens);
//   },
// );
