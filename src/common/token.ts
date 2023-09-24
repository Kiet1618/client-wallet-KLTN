import Web3 from "web3";
import Abi from './ERC20_ABI.json'
import { AbiItem } from 'web3-utils'


export const getNameToken = async (web3: Web3, addressToken: string) => {
    try {
        const tokenContract = new web3.eth.Contract(Abi as AbiItem[], addressToken);

        const name: string = await tokenContract.methods.name().call((error, name) => {
            if (error) {
                console.error(error);
            } else {
                return name;
            }
        });
        return name;
    }
    catch {
        return ""
    }

}
export const getSymbolToken = async (web3: Web3, addressToken: string) => {
    try {
        const tokenContract = new web3.eth.Contract(Abi as AbiItem[], addressToken);

        const symbol: string = await tokenContract.methods.symbol().call((error, symbol) => {
            if (error) {
                console.error(error);
            } else {
                return symbol;
            }
        });
        return symbol;
    }
    catch {
        return "";
    }

}
