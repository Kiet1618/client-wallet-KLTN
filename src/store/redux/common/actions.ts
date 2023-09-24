import { getMetadata, enabledMFA, UserEnableMFAInput, changeAccountPassword, ChangePasswordMFAInput, ResendRecoveryMFAInput, changeRecovery, removeDeviceMFA, RemoveDeviceMFAInput } from '@app/utils/fetch-wallet';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { sendRecoveryPhrase } from './repository';

export const setCurrentNetwork = createAsyncThunk<any, string>(
  'set/current_network',
  async (network: string, { fulfillWithValue }) => {
    return fulfillWithValue(network);
  },
);


export const getMetadataWallet = createAsyncThunk<any, { email: string, shareB: string }>(
  'set/metadata-wallet',
  async (payload, { fulfillWithValue, rejectWithValue }) => {
    const { data, error } = await getMetadata({ owner: payload.email, shareB: payload.shareB });
    if (data) {
      return fulfillWithValue(data.metadata)
    }
    return rejectWithValue(error);
  },
);


export const enableMFA = createAsyncThunk<any, UserEnableMFAInput>(
  'mfa/enable',
  async (payload, { fulfillWithValue, rejectWithValue }) => {
    const { data, error } = await enabledMFA(payload);
    if (data) {
      return fulfillWithValue(data)
    }
    return rejectWithValue(error);
  },
);

export const updateAccountPassword = createAsyncThunk<any, ChangePasswordMFAInput>(
  'mfa/change-password',
  async (payload, { fulfillWithValue, rejectWithValue }) => {
    const { data, error } = await changeAccountPassword(payload);
    if (data) {
      return fulfillWithValue(data)
    }
    return rejectWithValue(error);
  },
);

export const resendRecovery = createAsyncThunk<any, ResendRecoveryMFAInput>(
  'mfa/resend-recovery',
  async (payload, { fulfillWithValue, rejectWithValue }) => {
    const { data, error } = await changeRecovery(payload);
    if (data) {
      // Send mail here
      sendRecoveryPhrase(payload.recoveryEmail, data.phrase);
      return fulfillWithValue(data)
    }
    return rejectWithValue(error);
  },
);

export const removeDevice = createAsyncThunk<any, RemoveDeviceMFAInput>(
  'mfa/remove-device',
  async (payload, { fulfillWithValue, rejectWithValue }) => {
    const { data, error } = await removeDeviceMFA(payload);
    if (data) {
      return fulfillWithValue(data)
    }
    return rejectWithValue(error);
  },
);
