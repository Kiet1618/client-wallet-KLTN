import React, { useState } from 'react';
import { CopyOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@app/store';
import { getSession } from 'next-auth/react';
import { useEffect } from 'react';
import axios from 'axios';
import { Col, Row, Spin } from 'antd';
import { useSessionStorage } from 'usehooks-ts';

import { useBlockchain, formatValue, listNetWorks } from '@app/blockchain';
import { storageKeys } from '@app/common/constants';
import { MasterKey } from '@app/common/types';

import { CardBalance, ETHNumber, ListCoin, Table, CardHistory } from './overview';
import { getHistoriesAddress } from '@app/store/redux/overview/actions';

export default function Overview() {
  const dispatch = useAppDispatch();
  const [wallet] = useSessionStorage<MasterKey>(storageKeys['master-key'], null);

  const [cryptocurrencies, setCryptocurrencies] = useState([]);
  const [currentToken, setCurrentToken] = useState("ETH");
  const [balance, setBalance] = useState("0");

  const commonState = useAppSelector(state => state.common);
  const walletState = useAppSelector(state => state.wallet);
  const getHistoriesAddressState = useAppSelector(state => state.overview.getHistoriesAddress);


  const { web3, getBalance } = useBlockchain(commonState.currentNetwork.data);

  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false').then((res) => {
      setCryptocurrencies(res.data);
    }).catch(console.error);
  }, []);
  const renderAddress = () => {
    if (wallet) {
      return wallet.ethAddress
    }
    return '';
  }
  const handleGetHistoriesAddress = () => {
    const address = renderAddress()
    const network = listNetWorks.find(n => n.chainID === commonState.currentNetwork.data);
    const urlRaw = network.apiScan;
    const url = urlRaw.replace('{address}', address);
    dispatch(getHistoriesAddress({ url }));
  };

  const handleGetListCryptoCurrencies = () => {
    try {
      const listTokens = walletState.currentListTokens.data.find(n => n.chainID === commonState.currentNetwork.data);
      setCurrentToken(listTokens.symbol);
    }
    catch { }
  };

  useEffect(() => {
    handleGetHistoriesAddress();
    handleGetListCryptoCurrencies();
  }, [commonState.currentNetwork.data]);

  useEffect(() => {
    try {
      const listTokens = walletState.currentListTokens.data.find(n => n.symbol === currentToken);
      if (!listTokens.address) {
        getBalance(web3).then(res => setBalance(res));
      }
      else {
        getBalance(web3, currentToken, listTokens.address).then(res => setBalance(res));
      }
    }
    catch {
      setBalance("Error");
    }

  }, [web3, wallet, commonState.currentNetwork]);



  const sliceAddress = (str: string) => {
    if (str?.length > 35) {
      return str.substr(0, 5) + '...' + str.substr(str.length - 4, str.length);
    }
    return str;
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(renderAddress());
  }
  const checkType = (from: string) => {
    if (from === renderAddress().toLocaleLowerCase()) {
      return "Send ➤";
    }
    else {
      return "Receive"
    }
  }
  const checkDestination = (str: string, data) => {
    if (str === "Send ➤") {
      return data.to;
    }
    else {
      return data.from;
    }
  }
  return (
    <div style={{ textAlign: 'left', color: 'white' }}>
      <Row>
        <Col span={12}>
          <Row>
            <CardBalance >
              <h1 style={{ color: 'white' }}>Account Balance</h1>
              <a onClick={copyAddress}><h4 style={{ color: 'white' }}><CopyOutlined style={{ marginRight: '5px' }} />{sliceAddress(renderAddress())}</h4></a>
              <ETHNumber>{balance}</ETHNumber>
              <p style={{ marginTop: '57px' }}>{currentToken}</p>
            </CardBalance>
          </Row>
          <Row>
            <h1 style={{ color: '#fff', position: 'absolute', marginTop: '60px', marginLeft: '50px' }}>Hitory Activity</h1>
            <CardHistory style={{ marginTop: '100px' }}>
              <table style={{ width: '420px' }}>
                <thead>
                  <tr style={{ position: "sticky", top: 0, background: "rgb(41, 41, 41)", height: '50px' }}>
                    <th>Hash</th>
                    <th>Type</th>
                    <th>Destination</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    getHistoriesAddressState.data && getHistoriesAddressState.data.map(transaction => (
                      <tr key={transaction.blockNumber}>
                        <td><a href={`https://goerli.etherscan.io/tx/${transaction.hash}`} target="_blank" style={{}}>{sliceAddress(transaction.hash)}</a></td>
                        <td>{
                          checkType(transaction.from)
                        }</td>
                        <td><a style={{ color: 'white' }} onClick={() => { navigator.clipboard.writeText(checkDestination(checkType(transaction.from), transaction)) }}>{
                          sliceAddress(checkDestination(checkType(transaction.from), transaction))
                        }
                        </a></td>
                        <td>⧫ {formatValue(web3, transaction.value.toUpperCase())}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardHistory>
          </Row>
        </Col>
        <Col span={12}>
          <ListCoin>
            <h2 style={{ color: 'white', marginBottom: '40px', fontSize: '30px' }}><strong>Crypto Marketplace</strong></h2>
            <Table>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Price (USD)</th>
                  <th>Market Cap (USD)</th>
                </tr>
              </thead>
              <tbody>
                {cryptocurrencies.map(crypto => (
                  <tr key={crypto.id}>
                    <td><img width={15} src={crypto.image}></img></td>
                    <td>{crypto.name}</td>
                    <td>{crypto.symbol.toUpperCase()}</td>
                    <td>{crypto.current_price.toLocaleString()}</td>
                    <td>{crypto.market_cap.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ListCoin>
        </Col>
      </Row >
    </div >
  )
}


export async function getServerSideProps({ req }) {
  const session = await getSession({ req });
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    }
  }

  return { props: { session } }
}