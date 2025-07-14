import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import AppHeader from "../Header";
import SidebarNurseManager from "./SidebarNurseManager";
import styles from "./NurseManagerLayout.module.css";

const { Content } = Layout;

function NurseManagerLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.layout}>
      <SidebarNurseManager collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout
        className={`${styles.siteLayout} ${
          collapsed ? styles.siteLayoutCollapsed : styles.siteLayoutExpanded
        }`}
      >
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className={styles.content} style={{ margin: 0 }}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default NurseManagerLayout;
