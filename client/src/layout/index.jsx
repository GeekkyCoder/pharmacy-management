import { Button, Layout, Menu } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
// import { useSelector } from 'react-redux';
import React from "react";
import { menuItems } from "../constants/menuItems";
import { useSelector } from "react-redux";
import { themes } from "./../providers/themeDefinations";

const { Header, Sider, Content } = Layout;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { currentTheme } = useSelector((state) => state.theme);
  const layoutTheme = themes[currentTheme]?.components?.Layout;
  const user = useSelector((state) => state.auth.user);

  const filteredMenu = menuItems
    .filter((item) => item.roles.includes(user?.role))
    .map((item) => {
      if (item.children) {
        const children = item.children.filter((child) =>
          child.roles.includes(user?.role)
        );
        return {
          key: item.key,
          label: item.label,
          children: children.map((child) => ({
            key: child.key,
            label: child.label,
            path: child.path,
          })),
        };
      }
      return {
        key: item.key,
        label: item.label,
        path: item.path,
      };
    });

  const handleClick = ({ key }) => {
    const flatItems = [];
    const flatten = (items) => {
      items.forEach((item) => {
        if (item.children) flatten(item.children);
        else flatItems.push(item);
      });
    };
    flatten(filteredMenu);
    const found = flatItems.find((item) => item.key === key);
    if (found?.path) navigate(found.path);
  };

  console.log('sddd', layoutTheme)

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={220}
        style={{
          background: layoutTheme?.siderBg,
          color: layoutTheme?.siderColor,
          padding: "1rem",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: "bold", padding: 20, color: layoutTheme?.
headerBg
, }}>
          PHARMACIA
        </div>
        <Menu
          mode="inline"
          // theme="dark"
          defaultOpenKeys={[
            "inventory",
            "suppliers",
            "employees",
            "customers",
            "reports",
          ]}
          onClick={handleClick}
          items={filteredMenu}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            // background: '#0a3a66',
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 24px",
            color: "white",
            background: layoutTheme?.headerBg,
            // padding: '0 1rem',
          }}
        >
          <div>
            <LogoutOutlined style={{ marginRight: 8 }} />
            Logout (Logged in as {user?.userName})
          </div>
        </Header>

        <Content style={{ margin: "24px", padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
