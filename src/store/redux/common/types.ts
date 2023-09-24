import { Metadata } from "@app/utils/fetch-wallet";

export type CommonState = {
  currentNetwork: {
    data: string;
    loading: boolean;
    error: unknown;
  };

  metadataWallet: {
    data: Metadata;
    loading: boolean;
    error: unknown;
  };

  enableMFA: {
    data: boolean;
    loading: boolean;
    error: unknown;
  };

  updatePassword: {
    data: boolean;
    loading: boolean;
    error: unknown;
  };


  resendRecovery: {
    data: boolean;
    loading: boolean;
    error: unknown;
  };
  
  removeDevice: {
    data: boolean;
    loading: boolean;
    error: unknown;
  };
};
