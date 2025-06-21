import React from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import {
    UserOutlined,
    CalendarOutlined,
    MedicineBoxOutlined,
    BarChartOutlined,
    SendOutlined,
    FileProtectOutlined,
    SettingOutlined,
    HeartOutlined
} from '@ant-design/icons';
import "./SidebarStyles.css";

const { Sider } = Layout;

function SidebarParent({ collapsed, setCollapsed }) {
    const navigate = useNavigate();
    const location = useLocation();

    const basePath = "/parent";

    const menuItems = [
        { 
            key: `${basePath}/profile-student`, 
            icon: <UserOutlined />, 
            label: "Hồ sơ học sinh"
        },
        { 
            key: `${basePath}/health-profile`,
            icon: <HeartOutlined />,
            label: "Hồ sơ sức khỏe"
        },
        { 
            key: `${basePath}/health-result`,
            icon: <BarChartOutlined />,
            label: "Kết quả sức khỏe",
        },
        { 
            key: `${basePath}/events`,
            icon: <CalendarOutlined />,
            label: "Sự kiện y tế"
        },
        { 
            key: `${basePath}/vaccinations`,
            icon: <MedicineBoxOutlined />,
            label: "Tiêm chủng",
            children:[
               {
                    key:`${basePath}/vaccinations/history`,
                    label: "Lịch sử tiêm chủng",
               },
               {
                    key:`${basePath}/vaccinations/results`,
                    label: "Kết quả tiêm chủng",
               },
               {
                   key:`${basePath}/vaccinations/requirements`,
                   label: "Yêu cầu tiêm chủng",
               },
            ],
        },
        { 
            key: `${basePath}/send-medicine`,
            icon: <SendOutlined />,
            label: "Gửi thuốc"
        },
        { 
            key: `${basePath}/setting`,
            icon: <SettingOutlined />,
            label: "Cài đặt"
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    const handleMouseEnter = () => {
        if (collapsed) {
            setCollapsed(false);
        }
    };

    const handleMouseLeave = () => {
        setCollapsed(true);
    };

    return (
        <Sider
            trigger={null}
            collapsible={true}
            collapsed={collapsed}
            collapsedWidth={80}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            width={200}
            className="fixed h-screen left-0 top-0 bottom-0 z-10 transition-all duration-200"
            theme="dark"
            style={{
                background: "linear-gradient(135deg, #47c8f8 0%, #1890ff 100%)",
            }}
        >
            {/* Vùng hiển thị logo bệnh viện */}
        <div className="logoContainer flex justify-center items-center h-24">
        <img
          src="/SchoolMedical.gif"
          alt="School Medical Logo"
          style={{
            height: collapsed ? "5500px" : "5500px",
            width: collapsed ? "auto" : "auto",
            maxWidth: "95%",
            objectFit: "contain",
            margin: "0 auto",
            display: "block",
          }}
        />
        </div>
            {/* Menu điều hướng chính */}
            <Menu
                theme="dark"
                mode="inline"
                inlineCollapsed={collapsed}
                selectedKeys={[location.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                className="sidebar-menu border-none bg-transparent"
                style={{
                    background: "transparent",
                }}
            />
        </Sider>
    );
}

export default SidebarParent;