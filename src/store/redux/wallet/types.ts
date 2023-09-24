import { Token } from '@app/common/tokenInterface'
export type WalletState = {
  currentListTokens: {
    data: Array<Token>;
    loading: boolean;
    error: unknown;
  };
};
