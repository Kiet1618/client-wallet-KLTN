import { createSlice } from '@reduxjs/toolkit';
import * as actions from './actions';
import { CommonState } from './types';

const initialState = {
  currentNetwork: {
    data: "1",
    loading: false,
    error: {},
  },
  metadataWallet: {
    data: null,
    loading: false,
    error: {},
  },
  enableMFA: {
    data: false,
    loading: false,
    error: {}
  },
  updatePassword: {
    data: false,
    loading: false,
    error: {}
  },
  resendRecovery: {
    data: false,
    loading: false,
    error: {}
  },
  removeDevice: {
    data: false,
    loading: false,
    error: {}
  }
} as CommonState;

export const login = createSlice({
  name: 'common',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(actions.setCurrentNetwork.pending, (state) => {
      state.currentNetwork.loading = true;
    });
    builder.addCase(actions.setCurrentNetwork.fulfilled, (state, action) => {
      state.currentNetwork.data = action.payload;
      state.currentNetwork.loading = false;
    });
    builder.addCase(actions.setCurrentNetwork.rejected, (state, action) => {
      state.currentNetwork.error = action.payload;
      state.currentNetwork.loading = false;
    });

    builder.addCase(actions.getMetadataWallet.pending, (state) => {
      state.metadataWallet.loading = true;
    });
    builder.addCase(actions.getMetadataWallet.fulfilled, (state, action) => {
      state.metadataWallet.data = action.payload;
      state.metadataWallet.loading = false;
    });
    builder.addCase(actions.getMetadataWallet.rejected, (state, action) => {
      state.metadataWallet.error = action.payload;
      state.metadataWallet.loading = false;
    });

    builder.addCase(actions.enableMFA.pending, (state) => {
      state.enableMFA.loading = true;
    });
    builder.addCase(actions.enableMFA.fulfilled, (state, action) => {
      state.enableMFA.data = action.payload;
      state.enableMFA.loading = false;
    });
    builder.addCase(actions.enableMFA.rejected, (state, action) => {
      state.enableMFA.error = action.payload;
      state.enableMFA.loading = false;
    });

    builder.addCase(actions.updateAccountPassword.pending, (state) => {
      state.updatePassword.loading = true;
    });
    builder.addCase(actions.updateAccountPassword.fulfilled, (state, action) => {
      state.updatePassword.data = action.payload;
      state.updatePassword.loading = false;
    });
    builder.addCase(actions.updateAccountPassword.rejected, (state, action) => {
      state.updatePassword.error = action.payload;
      state.updatePassword.loading = false;
    });

    builder.addCase(actions.resendRecovery.pending, (state) => {
      state.resendRecovery.loading = true;
    });
    builder.addCase(actions.resendRecovery.fulfilled, (state, action) => {
      state.resendRecovery.data = action.payload;
      state.resendRecovery.loading = false;
    });
    builder.addCase(actions.resendRecovery.rejected, (state, action) => {
      state.resendRecovery.error = action.payload;
      state.resendRecovery.loading = false;
    });

    builder.addCase(actions.removeDevice.pending, (state) => {
      state.removeDevice.loading = true;
    });
    builder.addCase(actions.removeDevice.fulfilled, (state, action) => {
      state.removeDevice.data = action.payload;
      state.removeDevice.loading = false;
    });
    builder.addCase(actions.removeDevice.rejected, (state, action) => {
      state.removeDevice.error = action.payload;
      state.removeDevice.loading = false;
    });
  },
});



export default login.reducer;
