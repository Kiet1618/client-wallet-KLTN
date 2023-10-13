import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSessionStorage } from 'usehooks-ts';
import { Empty } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import {
  Transfer, SelectCustom,
  SelectCustom2, GasFeeTag,
  OptionCustom, CardBalance,
  InputCustom, InputCustom2,
  ButtonOrigin, ETHNumber,
  CustomAddressInput, CustomTypeAddressInput,
  CustomAmount, CustomGas,
  CustomModal, CustomSelectToken
} from './wallet';
import { Col, Row, Input, notification } from 'antd';
import { Form } from 'antd';
import { CopyOutlined, } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@app/store';
import { MasterKey } from '@app/common/types';
import { storageKeys } from '@app/common/constants';
import { sendTransaction, useBlockchain, getGasPrice } from '@app/blockchain';
import { getSymbolToken, getNameToken } from '@app/common/token';
import { TokenImpl } from "@app/common/tokenInterface";
import { setCurrentListTokens } from '@app/store/redux/wallet/actions';

export default function Wallet() {
  const [form] = useForm();
  const dispatch = useAppDispatch();
  const [wallet] = useSessionStorage<MasterKey>(storageKeys['master-key'], null);
  const [balance, setBalance] = useState("0");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gasFee, setGasFee] = useState(0);
  const [tokenAddress, setTokenAddress] = useState("")
  const commonState = useAppSelector(state => state.common);
  const walletState = useAppSelector(state => state.wallet);
  const { web3, getBalance } = useBlockchain(commonState.currentNetwork.data);
  const [nameToken, setNameToken] = useState("");
  const [symbolToken, setSymbolToken] = useState("");
  const [currentToken, setCurrentToken] = useState("ETH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTokenChange = (value) => {
    setCurrentToken(value);
  }


  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    addToken(tokenAddress, commonState.currentNetwork.data);
    setIsModalOpen(false);

  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const key = 'updatable';

  const renderAddress = () => {
    if (wallet) {
      return wallet.ethAddress
    }
    return '';
  }
  const sliceAddress = (str: string) => {
    try {
      if (!str) {
        return "";
      }
      if (str?.length > 35) {
        return str.substr(0, 5) + '...' + str.substr(str.length - 4, str.length);
      }
      return str;
    }
    catch {
      return "error"
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(renderAddress());
  }

  useEffect(() => {
    getGasPrice(web3).then(res => setGasFee(res));
  }, [web3, wallet]);

  useEffect(() => {
    try {
      const listTokens = walletState.currentListTokens.data.find(n => n.chainID === commonState.currentNetwork.data);
      form.setFieldValue("token", listTokens.name)
      setCurrentToken(listTokens.symbol);
    }
    catch { }
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

  }, [web3, wallet]);



  useEffect(() => {
    getNameToken(web3, tokenAddress).then(res => setNameToken(res ? res : ""));
    getSymbolToken(web3, tokenAddress).then(res => setSymbolToken(res ? res : ""));

  }, [tokenAddress]);
  useEffect(() => {

  }, [])


  const handleSubmitTransfer = async () => {
    setIsSubmitting(true);

    const listTokens = walletState.currentListTokens.data.find(n => n.symbol === currentToken);
    const data = form.getFieldsValue();
    await sendTransaction(web3, {
      to: data.toAddress,
      value: data.amount,
      symbol: currentToken,
      tokenContact: listTokens.address,
    }, wallet?.privKey).then((res) => {
      if (res.slice(0, 2) === '0x') {
        notification.success({
          message: 'Transaction success',
          description:
            res,
        });
      } else {
        notification.error({
          message: 'Transaction failure',
          description:
            res,
        })
      }
    });

    setIsSubmitting(false);
  }
  const validateAddress = (rule, value, callback) => {
    const pattern = /^0x[a-fA-F0-9]{40}$/;
    if (!pattern.test(value)) {
      callback("Address must start with '0x' and be 42 characters long.");
    } else {
      callback();
    }
  };
  const validateAmount = (rule, value, callback) => {
    // replace with a function to get the current balance
    if (value > balance || value < 0) {
      callback(`Amount must be less than or equal to your balance: ${balance}`);
    } else {
      callback();
    }
  };
  const addToken = async (addressToken: string, chainID: string) => {
    try {
      const listTokens = walletState.currentListTokens.data.find(n => n.address === addressToken);
      if (!listTokens) {
        dispatch(setCurrentListTokens(new TokenImpl(chainID, symbolToken, nameToken, addressToken)));
        notification.success({
          message: 'Import success',
          description:
            <div>
              <b>Name Token: </b> {nameToken} <br />
              <b>Symbol: </b>{symbolToken} <br />
              <b>Contract: </b>{addressToken}
            </div>
        });
      }
      else {
        notification.error({
          message: 'Import failure',
          description: 'Token is available'
        });
      }
    } catch {
      notification.error({
        message: 'Import failure',
        description: 'Please checking your address contracts and try again'
      });
    }
  };

  return (
    <div >
      <h2 style={{ color: 'white', margin: '20px 40px' }} >Transfer Detail</h2>
      <Row gutter={16}>
        <Col sm={24} xs={24} md={12} lg={12} xl={12}>
          <Transfer form={form} onFinish={handleSubmitTransfer} layout='vertical' style={{ width: "100%" }}>
            {/* <a onClick={showModal} style={{ color: 'white', float: 'right' }}>Import Tokens</a> */}

            <CustomSelectToken name="token" label="Select token" rules={[
              { required: true },
            ]} initialValue={currentToken} >

              <SelectCustom onChange={
                (value) => {
                  handleTokenChange(value)
                }
              }>
                {walletState.currentListTokens.data.map((tokenValue) => (
                  tokenValue.chainID == commonState.currentNetwork.data ?
                    <OptionCustom key={tokenValue?.symbol} value={tokenValue?.symbol}>
                      {tokenValue?.name}
                    </OptionCustom> : ''
                ))}
              </SelectCustom>
            </CustomSelectToken>


            <CustomAddressInput name="toAddress" label="Address" rules={[{ required: true }, { validator: validateAddress }]} >
              <InputCustom placeholder='Address'></InputCustom>
            </CustomAddressInput>
            <CustomTypeAddressInput name="type" label="Type" rules={[{ required: true }]} initialValue={"address"}>
              <SelectCustom2 defaultValue="address">
                <OptionCustom value='address'>ETH Address</OptionCustom>
                <OptionCustom value='email'>Email Google</OptionCustom>
              </SelectCustom2>
            </CustomTypeAddressInput>
            <CustomAmount name="amount" label="Amount" rules={[{ required: true }, { validator: validateAmount }]}>
              <InputCustom2 placeholder="Amount" />
            </CustomAmount>
            <CustomGas name="gas" label="Max Gas" rules={[{ required: false }]}>
              <GasFeeTag>{gasFee}</GasFeeTag>
            </CustomGas>
            <Form.Item >
              <ButtonOrigin htmlType='submit' onSubmit={handleSubmitTransfer} style={{ width: 150, marginRight: '0', float: 'right', marginTop: '10px', borderRadius: 5, height: 50, fontSize: '18px' }} loading={isSubmitting}>Transfer</ButtonOrigin>
            </Form.Item>
          </Transfer>
        </Col>
        <Col sm={24} xs={24} md={12} lg={12} xl={12}>
          <CardBalance>
            <h1 style={{ color: 'white' }}>Account Balance</h1>
            <a onClick={copyAddress}><h4 style={{ color: 'white' }}><CopyOutlined style={{ marginRight: '5px' }} />{sliceAddress(renderAddress())}</h4></a>

            <ETHNumber>{balance}</ETHNumber>
            <p style={{ marginTop: '57px' }}>{currentToken}</p>
          </CardBalance>
        </Col>
      </Row>

      <CustomModal title="Import Tokens" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Input onChange={async (e) => {
          setTokenAddress(e.target.value)
        }} style={{ fontSize: '16px', height: '50px', borderRadius: '5px' }} placeholder='Address Tokens'></Input>

        {nameToken ?
          (<h3 style={{ margin: '20px 0px' }}>Name: {nameToken}</h3>)
          : ("")
        }
        {symbolToken ?
          (<h3>Symbol: {symbolToken}</h3>)
          : ("")
        }
        {
          nameToken ?
            ("") : (<Empty style={{ marginTop: '30px' }}></Empty>)

        }
      </CustomModal>

    </div >
  )
}
export async function getServerSideProps({ req }) {
  const headers = req ? req.headers : {};
  return { props: { headers } }
}