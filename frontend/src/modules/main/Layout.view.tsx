import { Layout as AntdLayout } from "antd";
import React, { FC } from "react";
import { Outlet } from "react-router-dom";
import "./Layout.style.css";

const { Header, Content } = AntdLayout;

const Layout: FC = () => {
  return (
    <AntdLayout>
      <Header className="header"><h2>Tweet-ulator</h2></Header>
      <Content><Outlet /></Content>
    </AntdLayout>
  );
}

export default Layout;
