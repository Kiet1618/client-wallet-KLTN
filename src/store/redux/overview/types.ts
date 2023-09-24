type Transaction = {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  functionName: string;
  gasPrice: string;
  hash: string;
  input: string;
  nonce: string;
  timeStamp: string;
  [key: string]: string;
}
export type OverviewState = {
  getHistoriesAddress: {
    data: Transaction[];
    loading: boolean;
    error: unknown;
  };
};
