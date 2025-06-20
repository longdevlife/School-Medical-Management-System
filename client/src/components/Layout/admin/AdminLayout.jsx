// AdminLayout.jsx
import React, { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin";
import AppHeader from "../Header"; // Đường dẫn đúng khi Header.jsx nằm ở src/components/Layout và AdminLayout.jsx nằm ở src/components/Layout/admin
import Footer from "./Footer";
import styles from "./AdminLayout.module.css";

const { Content } = Layout;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const siderWidth = collapsed ? 80 : 200;

  return (
    <>
      <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout className={styles.layout}>
        <SidebarAdmin collapsed={collapsed} setCollapsed={setCollapsed} />

        <Layout
          className={styles.siteLayout}
          style={{
            marginLeft: siderWidth,
            paddingTop: 64, // đẩy nội dung xuống dưới Header
            minHeight: "100vh",
            transition: "margin-left 0.3s ease",
          }}
        >
          <Content className={styles.content}>
            <div className={styles.contentWrapper}>
              <Outlet />
            </div>
          </Content>

          <Footer />
        </Layout>
      </Layout>
    </>
  );
}

export default React.memo(AdminLayout);
