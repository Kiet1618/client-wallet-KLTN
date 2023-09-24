import React, { useState } from 'react';
import { Layout, Menu, Breadcrumb, Select } from 'antd';
import styled from "styled-components"
import Link from 'next/link';
import { withRouter, NextRouter } from 'next/router';
import { WithRouterProps } from 'next/dist/client/with-router';
import { useSession, signOut } from "next-auth/react"
import { useRouter } from 'next/router';
import {
  SettingOutlined,
  WalletOutlined,
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { useSessionStorage } from 'usehooks-ts';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useAppDispatch } from '@app/store';
import { setCurrentNetwork } from '@app/store/redux/common/actions';
import { MasterKey } from '@app/common/types';
import { storageKeys } from '@app/common/constants';



const { SubMenu, Item } = Menu;
const { Sider, Content, Header } = Layout;

interface Router extends NextRouter {
  path: string;
  breadcrumbName: string;
}

interface Props extends WithRouterProps {
  router: Router;
}

function itemRender(route: Router) {
  return route.path === 'index' ? (
    <Link href={'/'}>
      <span style={{ color: 'white' }}> {route.breadcrumbName}</span>
    </Link>
  ) : (
    <span style={{ color: 'white' }}>{route.path}</span>
  );
}

function routesMaker(pathsplit: string[]) {
  let routes = [
    {
      path: 'index',
      breadcrumbName: 'home',
    },
  ];
  for (let v of pathsplit) {
    const pathInfo = {
      path: v,
      breadcrumbName: v,
    };
    if (v !== '') routes.push(pathInfo);
  }
  return routes;
}

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 64,
  paddingInline: 50,
  lineHeight: '64px',
  backgroundColor: '#7dbcea',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#108ee9',
};

const siderStyle: React.CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#3ba0e9',
};

const AppLayout = (props: React.PropsWithChildren<Props>) => {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const [wallet, setWallet] = useSessionStorage<MasterKey>(storageKeys['master-key'], null);

  const handleChange = (value: string) => {
    dispatch(setCurrentNetwork(value))
  };


  const renderAddress = () => {
    if (wallet) {
      return wallet.ethAddress || ""
    }
    return null;
  }
  const sliceAddress = (str: string) => {
    if (str?.length > 35) {
      return str.substr(0, 5) + '...' + str.substr(str.length - 4, str.length);
    }
    return str;
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(renderAddress());
  }

  const items: MenuProps["items"] = [
    {
      label: sliceAddress(renderAddress()) ? sliceAddress(renderAddress()) : "",
      key: 'address',
      icon: <CopyOutlined />

    }
    , {
      label: 'Profile',
      key: 'setting/profile',
      icon: <UserOutlined />,
    },
    {
      label: 'Log Out',
      key: 'logout',
      icon: <LogoutOutlined />,
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key == 'logout') {
      signOut();
      router.push('/');
    }
    else if (e.key == 'address') {
      copyAddress();
    }
    else router.push('/' + e.key);
  };
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const onChangeIsCollapsed = (isCollapsed: boolean) => {
    setIsCollapsed(isCollapsed);
  };

  const pathname = props.router.pathname;
  const pathsplit: string[] = pathname.split('/');
  const routes = routesMaker(pathsplit);
  const router = useRouter();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SiderCustom
        collapsible
        collapsed={isCollapsed}
        onCollapse={onChangeIsCollapsed}
      >
        <div style={{ justifyContent: 'center', display: "flex" }}>
          <Link href="/overview">
            <img src='/LecleLogoMini.png'></img>
          </Link>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['/overview']}
          selectedKeys={[pathsplit.pop()]}
          defaultOpenKeys={[pathsplit[1]]}
          mode="inline"
        >
          <Item key="overview" icon={<HomeOutlined />}>
            <Link href="/overview">
              Overview
            </Link>
          </Item>

          <Item key="wallet" icon={<WalletOutlined />}>
            <Link href="/wallet">
              Wallet
            </Link>
          </Item>
          <SubMenu key="setting" icon={<SettingOutlined />} title="Setting" >
            <Item key="profile" >
              <Link href="/setting/profile" >
                Profile
              </Link>
            </Item>
            <Item key="logout">
              <Link href="/setting/logout" onClick={() => {
                signOut().then(() => {
                  router.push('/');
                  setWallet({});
                })
              }}>
                Log out
              </Link>
            </Item>
          </SubMenu>
        </Menu>
      </SiderCustom>
      <Layout>
        <Header style={{ padding: '0 16px 16px', backgroundColor: '#232323', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BreadcrumbCustom
            style={{ margin: '16px 0' }}
            itemRender={itemRender}
            routes={routes}
          />
          <HeaderRight>
            <SelectCustomNetwork
              defaultValue="1"
              style={{ width: "170px", minWidth: "170px" }}
              onChange={handleChange}

              options={[
                { value: '1', label: 'Ethereum Mainnet' },
                { value: '5', label: 'Goerli' },
                { value: '56', label: 'Binance Smart Chain Mainnet' }
              ]}
            />
            <ButtonInfo
              style={{ backgroundColor: '#232323' }}
              menu={menuProps} placement="bottomRight" icon={<img style={{ borderRadius: '50%' }}
                width={26} src={session ? session.user.image : ""} />}
            >
              {session ? session.user.name : ""}
            </ButtonInfo>
          </HeaderRight>
        </Header>
        <Content
          style={{
            padding: 16,
            height: "auto",
            backgroundColor: "#232323",
          }}
        >
          {props.children}
        </Content>
      </Layout>

    </Layout>
  );
};
const BreadcrumbCustom = styled(Breadcrumb)`
  
  .ant-breadcrumb-separator {
    color: #FFF;
  }
  display: inline-block;
  div{
    display: inline-block;
    float: left;
  }
  width: max-content;
`;
const SiderCustom = styled(Sider)`
    .ant-layout-sider-children{
      background-color: #292929;
    }
    .ant-layout-sider-trigger{
      background-color: #252525;
    }
    .ant-menu, .ant-menu-sub, .ant-menu-inline{
      background-color: #292929 !important;
    }
    .ant-menu-dark.ant-menu-dark:not(.ant-menu-horizontal) .ant-menu-item-selected {
      background-color: #505050;
    }
   
`;
const ButtonInfo = styled(Dropdown.Button)`
    .ant-btn{
      background: #232323;
      border-style:none;
    }
    span{
      color: white;
    }
    .ant-dropdown-menu .ant-dropdown-menu-item:hover, .ant-dropdown-menu-submenu-title:hover, .ant-dropdown-menu-item.ant-dropdown-menu-item-active, .ant-dropdown-menu-item.ant-dropdown-menu-submenu-title-active, .ant-dropdown-menu-submenu-title.ant-dropdown-menu-item-active, .ant-dropdown-menu-submenu-title.ant-dropdown-menu-submenu-title-active {
      background-color: #232323 !important;
    }
`;
const SelectCustomNetwork = styled(Select)`
  right: 0;
  margin-top: 10px;
 .ant-select-selector{
    color:#fff;
    background-color: #101010 !important ;
    border-radius: 5px !important;
    border: solid 1px rgb(100,100,100, 0.2) !important;

  }
  .ant-select-arrow{
    color: #fff !important;
  }
  .ant-select-item-option-content{
    background-color: #000 !important ;
  }

`;

const HeaderRight = styled.div`
  display: flex;
  align-items: flex-end;
`;

export default withRouter(AppLayout);
