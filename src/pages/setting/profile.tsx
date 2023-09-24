import React from 'react';
import { TabsProps } from 'antd';
import { getSession, useSession } from 'next-auth/react';
import { Tabs } from 'antd'

import ProfileSetting from './components/ProfileSetting';
import MFASetting from './components/MFASetting';



export default function Profile() {
  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: `Profile`,
      children: <ProfileSetting />,
    },
    {
      key: 'mfa',
      label: `MFA Setting`,
      children: <MFASetting />,
    },
  ];
  return (
    <Tabs style={{ color: "#FFF" }} defaultActiveKey="profile" items={items} />
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