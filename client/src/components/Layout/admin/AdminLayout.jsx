import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";
import SidebarAdmin from "./SidebarAdmin";
import Footer from "./Footer";
import styles from "./AdminLayout.module.css";

const { Content } = Layout;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className={styles.layout}>
      <SidebarAdmin collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout
        className={`${styles.siteLayout} ${
          collapsed ? styles.siteLayoutCollapsed : styles.siteLayoutExpanded
        }`}
      >
        <HeaderAdmin collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            <Outlet />
          </div>
        </Content>
        <Footer /> 
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
