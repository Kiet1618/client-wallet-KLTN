type Callback = {

}

export type TransferNative = {
    to: string;
    value: string;
    symbol: string;
    tokenContact: string;
} & Callback;

export type ChainNetwork = {
    chainID: string;
    apiScan: string;
    rpcUrls: string;
}