import {Layout, Button, Dropdown, Space, Avatar, Badge, Popover, Input } from 'antd';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import{
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
    SearchOutlined,
    HomeOutlined,
    ReadOutlined,
    InfoCircleOutlined
}from "@ant-design/icons";
import styles from "./ParentLayout.module.css"; 


const {Header} = Layout;
const { Search } = Input;

function HeaderParent({collapsed, setCollapsed}){
    const navigate = useNavigate();
    const [notificationCount, setNotificationCount] = useState(1);

    const notifications = [
        {
            id: 1,
            title: "Nhắc lịch tiêm chủng",
            description: "Con bạn có lịch tiêm vắc-xin vào ngày 15/04/2024",
            time: "1 giờ trước",
            link: "/parent/vaccinations/history"
        },
        {
            id: 2,
            title: "Kết quả tiêm chủng ",
            description: "Kết quả tiêm chủng đã được cập nhật",
            time: "2 giờ trước",
            link: "/parent/vaccinations/results"
        }
    ];

    const handleNotificationItemClick = (link) => {
        setNotificationCount(0);
        navigate(link);
    };

    const NotificationContent = () => (
        <div style={{ width: 300 }}>
            {notifications.map(notification => (
                <div 
                    key={notification.id} 
                    className={styles.notificationItem}
                    onClick={() => handleNotificationItemClick(notification.link)}
                >
                    <div className={styles.notificationTitle}>{notification.title}</div>
                    <div className={styles.notificationDescription}>{notification.description}</div>
                    <div className={styles.notificationTime}>{notification.time}</div>
                </div>
            ))}
        </div>
    );

    const userMenuItems = [
        {
            key: "parent-profile",
            icon: <UserOutlined />,
            label:"Hồ sơ cá nhân",
        },
        {
            type: "divider"
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
        },
    ];

    const handleUserMenuClick = ({key}) => {
        switch (key){
            case "parent-profile":
                navigate("/parent/profile");
                break;
            case "logout":
                navigate("/login");
                break;
            default:
                break;
        }
    };

    const onSearch = (value) => {
        console.log('Search:', value);
    };

    return(
        <Header className={styles.header}>            <div className={styles.headerLeft}>
                <Button 
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
                    onClick={() => setCollapsed(!collapsed)}
                    className={styles.trigger}
                />
                <Search
                    placeholder="Tìm kiếm..."
                    allowClear
                    onSearch={onSearch}
                    className={styles.searchBar}
                />
            </div>
            <div className={styles.headerCenter}>
                <Space size="large">
                    <Link to="/parent/home" className={styles.navLink}>
                        <HomeOutlined /> Trang chủ
                    </Link>
                    <Link to="/parent/news" className={styles.navLink}>
                        <ReadOutlined /> Tin tức
                    </Link>
                    <Link to="/parent/about" className={styles.navLink}>
                        <InfoCircleOutlined /> Giới thiệu
                    </Link>
                </Space>
            </div>
            <div className={styles.headerRight}>
                <Space size="large">
                    <Popover 
                        content={<NotificationContent />}
                        trigger="click"
                        placement="bottomRight"
                        arrow={true}
                    >
                        <Badge count={notificationCount} offset={[-2, 5]}>
                            <Button 
                                type="text"
                                icon={<BellOutlined/>}
                                className={styles.notificationButton}
                            />
                        </Badge>
                    </Popover>
                    <Dropdown
                        menu={{
                            items:userMenuItems,
                            onClick: handleUserMenuClick,
                        }}
                        placement="bottomRight"
                        arrow
                    >
                        <Space className={styles.userProfile}>
                            <Avatar icon={<UserOutlined />} />
                            <span className={styles.username}>Phụ huynh</span>
                        </Space>
                    </Dropdown>
                </Space>
            </div>
        </Header>
    );
}

export default HeaderParent;

