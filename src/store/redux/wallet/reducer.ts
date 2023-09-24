import { createSlice } from '@reduxjs/toolkit';
import * as actions from './actions';
import { WalletState } from './types';
import { getListTokens } from '@app/helper/storage-service'
const dataTokensList = () => {
  if (getListTokens() !== null) {
    const data = getListTokens();
    return data;
  }
  else {
    const data =
      [{
        chainID: "1",
        symbol: "ETH",
        name: "Ethereum",
        address: "",
      },
      {
        chainID: "5",
        symbol: "ETH",
        name: "Ethereum",
        address: "",
      },
      {
        chainID: "1",
        symbol: "USDT",
        name: "Tether",
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      },
      {
        chainID: "5",
        symbol: "TST",
        name: "Goerli Test Token",
        address: "0x7af963cF6D228E564e2A0aA0DdBF06210B38615D",
      },
      {
        chainID: '5',
        symbol: 'DAI',
        name: 'DAI',
        address: '0xBa8DCeD3512925e52FE67b1b5329187589072A55',
      }, {
        chainID: '5',
        symbol: 'BUSD',
        name: 'BUSD',
        address: '0xa7c3Bf25FFeA8605B516Cf878B7435fe1768c89b',
      }, {
        chainID: '56',
        symbol: 'BNB',
        name: 'BNB',
        address: '',
      }]
    return data;
  }
}

const initialState = {
  currentListTokens: {
    data: dataTokensList(),
    loading: false,
    error: {},
  },
} as WalletState;

export const login = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(actions.setCurrentListTokens.pending, (state) => {
      state.currentListTokens.loading = true;
    });
    builder.addCase(actions.setCurrentListTokens.fulfilled, (state, action) => {
      state.currentListTokens.data = [...state.currentListTokens.data, action.payload];
      state.currentListTokens.loading = false;
      localStorage.setItem('currentListTokens', JSON.stringify(state.currentListTokens.data)); // Save to local storage
    });
    builder.addCase(actions.setCurrentListTokens.rejected, (state, action) => {
      state.currentListTokens.error = action.payload;
      state.currentListTokens.loading = false;
    });
  },
});

export default login.reducer;
