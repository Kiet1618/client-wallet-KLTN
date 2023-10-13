import React, { useState } from 'react';
import { Button, Input, Typography, notification } from 'antd';
import { getSession, useSession } from 'next-auth/react';
import { Row, Col, Form, List, Popconfirm } from 'antd'
import { useForm } from 'antd/lib/form/Form';
import { useEffect } from 'react';
import { useLocalStorage, useSessionStorage } from 'usehooks-ts';

import { MasterKey } from '@app/common/types';
import { storageKeys } from '@app/common/constants';
import { useAppDispatch, useAppSelector } from '@app/store';
import { DeviceKey } from '@app/utils/fetch-wallet';
import { getMetadataWallet, enableMFA, updateAccountPassword, resendRecovery, removeDevice } from '@app/store/redux/common/actions';

import { AccountChangeContainer, CardDevices, CardMFA, ChangeMFAContainer, ListDevices, RecoveryChangeContainer } from './../style';
import { get } from 'lodash';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';



export default function Profile() {
  const dispatch = useAppDispatch();
  const [form] = useForm();
  const [formChangePassword] = useForm();

  const { data: session } = useSession();
  const [wallet] = useSessionStorage<MasterKey>(storageKeys['master-key'], null);
  const [shareDevice] = useLocalStorage<DeviceKey>(storageKeys['share-device'], null);

  const [isChangePassword, setIsChangePassword] = useState(false);
  const [isChangeRecovery, setIsChangeRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  const metadataState = useAppSelector(state => state.common.metadataWallet);
  const enableMFAState = useAppSelector(state => state.common.enableMFA);
  const updatePasswordMFAState = useAppSelector(state => state.common.updatePassword);
  const resendRecoveryMFAState = useAppSelector(state => state.common.resendRecovery);
  const removeDeviceMFAState = useAppSelector(state => state.common.removeDevice);


  const handleGetMetadata = async () => {
    const { meta, payload } = await dispatch(getMetadataWallet({ email: session.user?.email, shareB: session.wallet?.privKey }))
    if (meta.requestStatus === 'rejected') {
      notification.error({
        description: payload.errorMessage,
        message: "Error",
      });
    }
  }
  useEffect(() => {
    setRecoveryEmail(get(metadataState, "data.tkey.recovery.email") || "");
  }, [metadataState]);

  useEffect(() => {
    if (session) {
      handleGetMetadata();
    }
  }, [session]);


  const handleEnableMFA = async () => {
    const values = form.getFieldsValue();
    const { meta, payload } = await dispatch(enableMFA({
      decryptedMetadata: metadataState.data,
      owner: session.user.email,
      shareB: session.wallet?.privKey,
      passphrase: values.password,
      recoveryEmail: values.email,
    }));
    if (meta.requestStatus === 'fulfilled') {

    }
    if (meta.requestStatus === 'rejected') {
      notification.error({
        description: payload.errorMessage,
        message: "Error",
      });
    }
    return;
  }

  const handleChangePassword = async () => {
    const values = formChangePassword.getFieldsValue();
    const { meta, payload } = await dispatch(updateAccountPassword({
      decryptedMetadata: metadataState.data,
      owner: session.user.email,
      shareB: session.wallet?.privKey,
      passphrase: values.password,
      masterPrivateKey: wallet?.privKey
    }));
    if (meta.requestStatus === 'fulfilled') {
      notification.success({
        description: "Update password successfully",
        message: "Error",
      });
      handleGetMetadata();
      setIsChangePassword(false);
    }
    if (meta.requestStatus === 'rejected') {
      notification.error({
        description: payload.errorMessage,
        message: "Error",
      });
    }
    return;
  }

  const handleResendRecovery = async () => {
    if (!recoveryEmail) {
      notification.error({
        description: "Enter your email",
        message: "Error",
      });
    }
    const { meta, payload } = await dispatch(resendRecovery({
      decryptedMetadata: metadataState.data,
      owner: session.user.email,
      shareB: session.wallet?.privKey,
      recoveryEmail,
      masterPrivateKey: wallet?.privKey
    }));
    if (meta.requestStatus === 'fulfilled') {
      notification.success({
        description: "Update recovery successfully",
        message: "Error",
      });
      handleGetMetadata();
      setIsChangeRecovery(false);
    }
    if (meta.requestStatus === 'rejected') {
      notification.error({
        description: payload.errorMessage,
        message: "Error",
      });
    }
    return;
  }

  const handleRemoveDevice = async (id: string) => {
    const { meta, payload } = await dispatch(removeDevice({
      deviceId: id,
      decryptedMetadata: metadataState.data,
      owner: session.user.email,
      shareB: session.wallet?.privKey,
    }));
    if (meta.requestStatus === 'fulfilled') {
      notification.success({
        description: "Remove device successfully",
        message: "Error",
      });
      handleGetMetadata();
    }
    if (meta.requestStatus === 'rejected') {
      notification.error({
        description: payload.errorMessage,
        message: "Error",
      });
    }
    return;
  }

  const renderFormMFA = () => {
    return (
      <Form form={form} layout='vertical' onFinish={handleEnableMFA}>
        <Form.Item name='email' label="Recovery email" required rules={[{
          required: true,
          type: "email",
          message: "The input is not valid E-mail!",
        }]}>
          <Input placeholder='Enter your email' />
        </Form.Item>
        <Form.Item name='password' label="Password" required rules={[
          {
            required: true,
          },
          // {
          //   required: true,
          //   type: "regexp",
          //   pattern: new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10,}$/),
          //   message: "Length 10, a-z, A-Z"
          // }
        ]}>
          <Input placeholder='Enter your password' />
        </Form.Item>
        <Form.Item name='confirmPassword' label="Confirm" required rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords that you entered do not match!'));
            },
          }),
        ]}>
          <Input placeholder='Enter your confirm password' />
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' style={{ float: "right" }} type='primary' size='large' loading={enableMFAState.loading}>
            Enable
          </Button>
        </Form.Item>
      </Form>
    )
  }

  const renderChangeMFA = () => {
    return (
      <ChangeMFAContainer>
        <RecoveryChangeContainer span={24}>
          <Typography.Title level={4}>Recovery email</Typography.Title>
          <Input style={{ color: "gray" }} value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} disabled={!isChangeRecovery} />
          <div className='btn-group'>
            {!isChangeRecovery && (
              <Button type='primary' size='large' onClick={() => setIsChangeRecovery(true)}>
                Change
              </Button>
            )}
            {isChangeRecovery && (
              <>
                <Button type='dashed' style={{ marginRight: '8px' }} size='large' onClick={() => {
                  setIsChangeRecovery(false);
                  setRecoveryEmail(get(metadataState, "data.tkey.recovery.email") || "");
                }}>
                  Cancel
                </Button>
                <Button type='primary' size='large' onClick={handleResendRecovery} loading={resendRecoveryMFAState.loading}>
                  Resend
                </Button>
              </>
            )}
          </div>
        </RecoveryChangeContainer>
        <AccountChangeContainer span={24}>
          <Typography.Title level={4}>Account password</Typography.Title>
          {!isChangePassword && (
            <div>
              <Input.Password color='#ccc' style={{ marginBottom: '8px', color: "white !important" }} value='*********' disabled />
              <div className='btn-group'>
                <Button type='primary' size='large' onClick={() => setIsChangePassword(true)}>
                  Change
                </Button>
              </div>
            </div>

          )}
          {isChangePassword && (
            <div>
              <Form form={formChangePassword} onFinish={handleChangePassword}>
                <Form.Item name='password' rules={[
                  {
                    required: true,
                    message: 'Enter your password',
                  },
                ]}>
                  <Input.Password placeholder='Enter your password' />
                </Form.Item>
                <Form.Item name='confirmPassword' required rules={[
                  {
                    required: true,
                    message: 'Enter your confirm password',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords that you entered do not match!'));
                    },
                  }),
                ]}>
                  <Input.Password placeholder='Enter your confirm password' />
                </Form.Item>
                <div className='btn-group'>
                  <Button type='dashed' style={{ marginRight: '8px' }} size='large' onClick={() => setIsChangePassword(false)}>
                    Cancel
                  </Button>
                  <Button htmlType='submit' type='primary' size='large' loading={updatePasswordMFAState.loading}>
                    Confirm
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </AccountChangeContainer>
      </ChangeMFAContainer>
    )
  };

  const renderListDevices = () => {
    return <ListDevices
      loading={removeDeviceMFAState.loading || metadataState.loading}
      itemLayout="horizontal"
      dataSource={get(metadataState, 'data.tkey.devices', [])}
      renderItem={(item: DeviceKey) => (
        <List.Item
          actions={[
            // <DownloadOutlined style={{ fontSize: '20px', color: "#FFF" }} />,
            <Popconfirm
              title="Remove device"
              onConfirm={() => handleRemoveDevice(item.id)}
              okButtonProps={{ loading: removeDeviceMFAState.loading }}
              okText="Yes"
              cancelText="No">
              <DeleteOutlined style={{ fontSize: '20px', color: "#FFF" }} />
            </Popconfirm>
          ]}
        >
          <List.Item.Meta
            // avatar={<Avatar src={item.deviceInfo} />}
            title={
              <p className='device-info'>
                {item.deviceInfo}
                {shareDevice?.id === item.id ? '(Current device)' : ''}
              </p>
            }
          />
        </List.Item>
      )}
    />;
  };

  return (
    <Row gutter={16}>
      <Col sm={24} xs={24} md={12} lg={12} xl={12}>
        <CardDevices title='List devices'>
          {renderListDevices()}
        </CardDevices>
      </Col>
      <Col sm={24} xs={24} md={12} lg={12} xl={12}>
        <CardMFA title='Enable MFA'>
          {metadataState.data && !metadataState.data.enabledMFA && renderFormMFA()}
          {metadataState.data && metadataState.data.enabledMFA && renderChangeMFA()}
        </CardMFA>
      </Col>
    </Row>
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