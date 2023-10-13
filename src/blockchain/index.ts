import Web3 from "web3";
import { useRouter } from "next/router";
import { useSessionStorage } from "usehooks-ts";
import { TransferNative, ChainNetwork } from "./types";
import abi from '@app/common/ERC20_ABI.json'
import { MasterKey } from "@app/common/types";
import { storageKeys } from "@app/common/constants";
export const listNetWorks: ChainNetwork[] = [
    {
        chainID: '1',
        apiScan: `https://api.etherscan.io/api?module=account&action=txlist&address={address}&sort=asc&apikey=6YA3MRG422USB7DWGGQTWHDZTUG248ZKJ5`,
        rpcUrls: 'https://eth.llamarpc.com'
    },
    {
        chainID: '5',
        apiScan: `https://api-goerli.etherscan.io/api?module=account&action=txlist&address={address}&sort=asc&apikey=6YA3MRG422USB7DWGGQTWHDZTUG248ZKJ5`,
        rpcUrls: 'https://goerli.blockpi.network/v1/rpc/public',
    },
    {
        chainID: '56',
        apiScan: "https://api.bscscan.com/api?module=account&action=txlist&address={address}&sort=asc&apikey=I1JJ6MQZRU7BG9WNH1FU69M3T377FIC4JW",
        rpcUrls: 'https://bsc-dataseed1.binance.org',
    },
    {
        chainID: '97',
        apiScan: "https://api-testnet.bscscan.com/api?module=account&action=txlist&address={address}&sort=asc&apikey=I1JJ6MQZRU7BG9WNH1FU69M3T377FIC4JW",
        rpcUrls: "wss://bsc-testnet.publicnode.com"
    }
];
export const useBlockchain = (chainID: string = "1") => {
    const router = useRouter();
    const [wallet] = useSessionStorage<MasterKey>(storageKeys['master-key'], null);
    if (!wallet) {
        router.push('/multi-factor');
        return {};
    }
    try {
        const network = listNetWorks.find(n => n.chainID === chainID);
        const rpcUrl = network.rpcUrls;
        const web3 = new Web3(rpcUrl);
        // Add the private key to the Web3 wallet
        const account = web3.eth.accounts.wallet.add(wallet.privKey.padStart(64, "0"));
        // Set the default account to the newly added account
        web3.defaultAccount = account.address;
        return { web3, account, getBalance, sendTransaction };
    }
    catch (error) { console.log(error); return {}; }
}
export const formatValue = (web3: Web3, value: string) => {
    try {
        const formatBalance = web3.utils.fromWei(value, 'ether');
        return formatBalance.slice(0, 5);
    }
    catch { return value }
}
export const getBalance = async (web3: Web3, symbol: string = 'ETH', tokenContract: string = "") => {
    try {
        if (symbol === 'ETH') {
            const balance = await web3.eth.getBalance(web3.defaultAccount);
            const formatBalance = web3.utils.fromWei(balance, 'ether');
            return formatBalance.slice(0, 6);
        } else {
            const contractInstance = new web3.eth.Contract(abi as any, tokenContract);
            const balance = await contractInstance.methods.balanceOf(web3.defaultAccount).call().then((balance) => { return balance });
            const formatBalance = web3.utils.fromWei(balance, 'ether');
            return formatBalance.slice(0, 6);
        }
    }
    catch { return '0' }
}
export const getGasPrice = async (web3: Web3) => {
    const price = await web3.eth.getGasPrice();
    const ethValue = Math.round((parseInt(price, 16) / 10 ** 18) * 1000000) / 1000000;
    return ethValue;
}
export const sendTransaction = async (web3: Web3, data: TransferNative, privateKey: string) => {
    const { to, value, symbol, tokenContact } = data;
    try {
        if (!tokenContact) {
            const weiValue = Math.round(parseFloat(value) * 10 ** 18);
            const hexValue = web3.utils.toHex(weiValue ? weiValue : null);
            const price = await web3.eth.getGasPrice();
            const tx = {
                to: to,
                from: web3.defaultAccount,
                value: hexValue,
                gas: 210000,
                gasPrice: price,
                data: "0x"
            };
            const signedTransaction = await web3.eth.accounts.signTransaction(tx, privateKey)
            const sendSignedTransaction = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
            return sendSignedTransaction.transactionHash;
        } else {
            const tokenAddress = new web3.eth.Contract(abi as any, tokenContact);
            const price = await web3.eth.getGasPrice();

            const recipient = to;
            const amount = web3.utils.toWei(value, 'ether');
            const transferData = tokenAddress.methods.transfer(recipient, amount).encodeABI();

            const transactionObject = {
                from: web3.defaultAccount,
                to: tokenAddress.options.address,
                gas: await tokenAddress.methods.transfer(recipient, amount).estimateGas({ from: web3.defaultAccount }),
                gasPrice: price,
                data: transferData
            };
            const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, privateKey);
            const transactionReceipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
            return transactionReceipt.transactionHash;
        }
    }
    catch (error) {
        return error.message.toString();
    }
}
