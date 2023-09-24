import React, { useState } from 'react';
import { Modal } from 'antd';
import { useSession } from 'next-auth/react';
import { Row, Col } from 'antd'
import { CopyOutlined } from '@ant-design/icons';
import QRCode from 'qrcode.react';
import { useSessionStorage } from 'usehooks-ts';

import { MasterKey } from '@app/common/types';
import { storageKeys } from '@app/common/constants';

import { CardProfile } from './../style';



export default function ProfileSetting() {

  const { data: session } = useSession();
  const [wallet] = useSessionStorage<MasterKey>(storageKeys['master-key'], null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const renderAddress = () => {
    if (wallet) {
      return wallet.ethAddress
    }
    return null;
  }
  const sliceAddress = (str: string) => {
    if (str.length > 35) {
      return str.substr(0, 5) + '...' + str.substr(str.length - 4, str.length);
    }
    return str;
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(renderAddress());
  }
  const exportPrivateKey = () => {
    setIsModalOpen(true);
  }

  return (
    <Row gutter={16}>
      <Col span={12}>
        <CardProfile >
          <img
            style={{ borderRadius: '50%', width: '200px', marginTop: '100px', marginBottom: '30px' }}
            alt="image"
            src={session?.user?.image}
          />
          <h2 style={{ color: 'white', fontSize: '30px' }}>{session?.user?.name}</h2>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{session?.user?.email}</h3>
          <a onClick={copyAddress}><h4 style={{ color: 'white', fontSize: '15px' }}><CopyOutlined style={{ marginRight: '5px' }} />{sliceAddress(renderAddress())}</h4></a>
          <a onClick={exportPrivateKey} >Export Private Key</a>

        </CardProfile >
      </Col>
      <Modal style={{ textAlign: 'center' }} title="Export Private Key" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} >
        <QRCode
          id='qrcode'
          value={session ? session.wallet.privKey : ""}
          size={300}
          level={'H'}
          includeMargin={true}
        />
        <p style={{ fontSize: '20px' }}>{session ? session.wallet.privKey : ""}</p>
      </Modal>
    </Row>
  )
}