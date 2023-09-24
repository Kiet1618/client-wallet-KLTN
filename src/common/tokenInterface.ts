export interface Token {
    chainID: string;
    symbol: string;
    name: string;
    address: string;
}
export class TokenImpl implements Token {
    constructor(
        public chainID: string,
        public symbol: string,
        public name: string,
        public address: string
    ) { }
}