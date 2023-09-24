import Web3 from 'web3';
import { useState } from 'react';
import BN from 'bn.js'
export const getBalance = async (address) => {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://goerli.infura.io/v3/685d3db8f3144a69b5e3934063e9cb19'));
    const balance = await web3.eth.getBalance(address);
    const formatBalance = web3.utils.fromWei(balance, 'ether');

    return formatBalance.slice(0, 6);
}
