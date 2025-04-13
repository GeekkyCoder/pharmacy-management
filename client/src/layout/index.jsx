import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const Index = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const breadcrumbNameMap = {
      '': 'Home',
    reports: 'Reports',
    user: 'User',
    tom: 'Tom',
    bill: 'Bill',
    alex: 'Alex',
    team: 'Team',
    team1: 'Team 1',
    team2: 'Team 2',
    files: 'Files',
  };

  const pathSnippets = location.pathname.split('/').filter(i => i);

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const items = [
    getItem('Dashboard', '/', <PieChartOutlined />),
    getItem('Reports', '/reports', <DesktopOutlined />),
    getItem('User', 'sub1', <UserOutlined />, [
      getItem('Tom', '/user/tom'),
      getItem('Bill', '/user/bill'),
      getItem('Alex', '/user/alex'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined />, [
      getItem('Team 1', '/team/team1'),
      getItem('Team 2', '/team/team2'),
    ]),
    getItem('Files', '/files', <FileOutlined />),
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };


  const breadcrumbItems = [
    <Breadcrumb.Item key="dashboard" onClick={() => navigate('/')}>
      Dashboard
    </Breadcrumb.Item>,
    ...(pathSnippets.length === 0
      ? [
          <Breadcrumb.Item key="home" onClick={() => navigate('/')}>
            Home
          </Breadcrumb.Item>,
        ]
      : pathSnippets.map((snippet, index) => {
          const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
          const name = breadcrumbNameMap[snippet] || snippet;
          return (
            <Breadcrumb.Item key={url} onClick={() => navigate(url)}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Breadcrumb.Item>
          );
        })),
  ];
  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          defaultSelectedKeys={['/']}
          mode="inline"
          items={items}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '0 16px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>{breadcrumbItems}</Breadcrumb>

          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Rashid's Pharmacy ©{new Date().getFullYear()} PVT LTD
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Index;
