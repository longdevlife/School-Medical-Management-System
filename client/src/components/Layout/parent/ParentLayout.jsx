import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AppHeader from "../Header";
import SidebarParent from "./SidebarParent";
import styles from "./ParentLayout.module.css";

const { Content } = Layout;

function ParentLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.layout}>
      <SidebarParent collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout
        className={`${styles.siteLayout} ${
          collapsed ? styles.siteLayoutCollapsed : styles.siteLayoutExpanded
        }`}
      >
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default ParentLayout;
