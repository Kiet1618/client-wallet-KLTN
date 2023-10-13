import styled from 'styled-components';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { useSessionStorage } from 'usehooks-ts';
import moment from 'moment';
import { Button, Card, Col, Typography, Input, Row, notification } from 'antd';
import { isEmpty, set } from 'lodash';
import { useSession } from 'next-auth/react';
import { getMasterKeyDisableMFA, getMasterKeyFromStorage, getMasterKeyFrom2Shares, getMetadata } from '@app/utils/fetch-wallet/metadata';
import { storageKeys } from '@app/common/constants';
import { Metadata } from '@app/utils/fetch-wallet/types';
import { MasterKey } from '@app/common/types';

import { Spin } from 'antd';

const Container = styled.div`
    width: 100%;
    height: 600px;
  `;
const CardRecovery = styled(Card)`
    border-radius: 5px;
    margin: 2em;
    width: 600px;
    .ant-typography {
      margin-bottom: 8px;
      font-size: 13px;
    }
  `;
const ButtonSubmit = styled(Button)`
    border-radius: 5px;
    margin-top: 8px;
    width: 120px;
    float: right;
`;
export default function MultiFactor() {
  const router = useRouter()
  const { data: session } = useSession();
  const [recovery, setRecovery] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [_, setMasterKey] = useSessionStorage<MasterKey>(storageKeys['master-key'], null);
  const [metadata, setMetadata] = useState<Metadata>();
  const [loading, setLoading] = useState(true);
  const [check, setCheck] = useState(false);
  const handleReconstructMasterKey = async () => {
    if (!metadata) {
      await getMetadata({ owner: session.user.email, shareB: session.wallet.privKey }).then(res => {
        if (res.data) {
          setMetadata(res.data.metadata);
        }
      });
      setCheck(true)
    }
    if (session && metadata) {
      if (!metadata.enabledMFA) {
        const { data, error } = await getMasterKeyDisableMFA({ owner: session.user.email, shareB: session.wallet.privKey, decryptedMetadata: metadata });
        if (!isEmpty(error)) {
          if (!check) {
            notification.error({
              description: error?.errorMessage,
              message: "Error",
            });
            return;
          }
          return;
        }

        setMasterKey({
          privKey: data.privKey.toString("hex"),
          ethAddress: data.ethAddress
        });
        router.push('/overview');
      }
      if (metadata.enabledMFA) {

        // Auto reconstruct from device local storage first
        const { data, error } = await getMasterKeyFromStorage({ owner: session.user.email, shareB: session.wallet.privKey, decryptedMetadata: metadata });

        if (data) {
          setMasterKey({
            privKey: data.privKey.toString("hex"),
            ethAddress: data.ethAddress
          });
          router.push('/overview');
          return;
        }
        setLoading(false);
        return
      }
    }
  }

  // Case test enable MFA, will be rm after;
  // useEffect(() => {
  //   if (session && metadata) {
  //     enabledMFA({
  //       owner: session.user.email,
  //       recoveryEmail: session.user.email,
  //       shareB: session.wallet.privKey,
  //       decryptedMetadata: metadata,
  //       passphrase: "123456"
  //     })
  //   }
  // }, [session?.wallet, metadata]);
  useEffect(() => {
    if (session) {
      getMetadata({ owner: session.user.email, shareB: session.wallet.privKey }).then(res => {
        if (res.data) {
          setMetadata(res.data.metadata);
        }
        handleReconstructMasterKey();
      });
    }
  }, [session?.wallet, metadata]);

  const handleRecovery = async () => {
    if (!recovery) {
      notification.error({
        description: "Please input the recovery",
        message: "Error",
      });
      return;
    }
    setLoadingSubmit(true);
    const { data, error } = await getMasterKeyFrom2Shares({ owner: session.user.email, shareB: session.wallet.privKey, decryptedMetadata: metadata, type: "recovery", shareOtherValue: recovery.trim() });
    setLoadingSubmit(false);
    if (data) {
      setMasterKey({
        privKey: data.privKey.toString("hex"),
        ethAddress: data.ethAddress
      });
      router.push('/overview');
      return;
    }
    notification.error({
      description: error?.errorMessage,
      message: "Error",
    });
    return;
  }

  const handlePassphrase = async () => {
    setLoadingSubmit(true);
    const { data, error } = await getMasterKeyFrom2Shares({ owner: session.user.email, shareB: session.wallet.privKey, decryptedMetadata: metadata, type: "passphrase", shareOtherValue: password.trim() });
    setLoadingSubmit(false);
    if (data) {
      setMasterKey({
        privKey: data.privKey.toString("hex"),
        ethAddress: data.ethAddress
      });
      router.push('/overview');
      return;
    }
    notification.error({
      description: error?.errorMessage,
      message: "Error",
    });
    return;
  }

  return (
    <Container>
      {loading ? <Spin size="large" style={{ position: "absolute", top: "50%", left: "50%" }} /> :
        <Row gutter={16}>
          <Col span={24} style={{
            display: "flex",
            justifyContent: "center"
          }}>
            <CardRecovery title="Recovery phrase">
              <Typography.Text italic>Verify with your backup phrase that was setup on {moment.unix(metadata?.tkey?.recovery?.createdAt).format("YYYY-MM-DD HH:mm")} and sent to email: <b>{metadata?.tkey?.recovery?.email}</b></Typography.Text>
              <Input.TextArea rows={4} value={recovery} onChange={(e) => setRecovery(e.target.value)} placeholder='Enter your recovery phrase' style={{ borderRadius: "5px" }} />
              <ButtonSubmit onClick={handleRecovery} type='primary' size='large' loading={loadingSubmit}>Submit</ButtonSubmit>
            </CardRecovery>
          </Col>
          <Col span={24} style={{
            display: "flex",
            justifyContent: "center"
          }}>
            <CardRecovery title="Passphrase">
              <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Enter your passphrase' />
              <ButtonSubmit onClick={handlePassphrase} type='primary' size='large' loading={loadingSubmit}>Submit</ButtonSubmit>
            </CardRecovery>
          </Col>
        </Row>}
    </Container>
  )
}


export async function getServerSideProps({ req }) {
  const headers = req ? req.headers : {};
  return { props: { headers } }
}