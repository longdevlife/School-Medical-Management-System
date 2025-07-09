import { Typography } from 'antd';
import React from 'react';
import { Card, Descriptions } from 'antd';
import styles from './ParentProfile.module.css';

const { Title } = Typography;

const ParentProfile = () => {
    return (
        <div className={styles.containerProfile}>
            <Card>
                <Title level={2}>Thông tin cá nhân</Title>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Họ và tên">Nguyễn Thị Hạnh</Descriptions.Item>
                    <Descriptions.Item label="Phụ huynh em">Lê Văn Bình</Descriptions.Item>
                    <Descriptions.Item label="Mối quan hệ">Mẹ</Descriptions.Item>
                    <Descriptions.Item label="Ngày sinh">01/01/1980</Descriptions.Item>
                    <Descriptions.Item label="Số điện thoại">0123456789</Descriptions.Item>
                    <Descriptions.Item label="Email">nguyenthihanh@example.com</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ">Quận 9, TP Thủ Đức, TP Hồ Chí Minh</Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default ParentProfile;