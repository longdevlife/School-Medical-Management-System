import React from "react";
import { Layout, Menu, Badge } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
    UserOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    BarChartOutlined,
    SendOutlined,
    FileProtectOutlined,
    SettingOutlined
} from '@ant-design/icons';
import styles from "./ParentLayout.module.css";

const { Sider } = Layout;

function SidebarParent({ collapsed, setCollapsed }) {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { 
            key: "/parent/profile-student", 
            icon: <UserOutlined style={{ fontSize: '18px' }} />, 
            label: (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Hồ sơ học sinh
                </span>
            )
        },
        { 
            key: "/parent/events",
            icon: <CalendarOutlined style={{ fontSize: '18px' }} />,
            label: (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Sự kiện y tế
                </span>
            )
        },
        { 
            key: "/parent/vaccinations",
            icon: <MedicineBoxOutlined style={{ fontSize: '18px' }} />,
            label: (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Tiêm chủng
                </span>
            )
        },
        { 
            key: "/parent/health-result",
            icon: <BarChartOutlined style={{ fontSize: '18px' }} />,
            label: (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Kết quả sức khỏe
                </span>
            )
        },
        { 
            key: "/parent/send-medicine",
            icon: <SendOutlined style={{ fontSize: '18px' }} />,
            label: (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Gửi thuốc
                </span>
            )
        },
        { 
            key: "/parent/health-profile",
            icon: <FileProtectOutlined style={{ fontSize: '18px' }} />,
            label: (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Hồ sơ sức khỏe
                </span>
            )
        },
        { 
            key: "/parent/setting",
            icon: <SettingOutlined style={{ fontSize: '18px' }} />,
            label: (
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Cài đặt
                </span>
            )
        },
    ];

    const handleMenuClick = (key) => {
        navigate(key);
    };

    const handleMouseEnter = () => setCollapsed(false);
    const handleMouseLeave = () => setCollapsed(true);

    return (
        <Sider
            trigger={null}
            collapsible={true}
            collapsed={collapsed}
            collapsedWidth={80}
            width={240}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={styles.sider}
            theme="dark"
        >
            <div className={styles.logo}>
                <img
                    src="https://img.lovepik.com/free-png/20210922/lovepik-icon-of-vector-hospital-png-image_401050686_wh1200.png"
                    alt="Logo"
                    style={{
                        width: collapsed ? "40px" : "60px",
                        height: "auto",
                        transition: "all 0.3s ease"
                    }}
                />
            </div>
            <Menu
                theme="dark"
                mode="inline"
                inlineCollapsed={collapsed}
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={({ key }) => handleMenuClick(key)}
            />
        </Sider>
    );
}

export default SidebarParent;