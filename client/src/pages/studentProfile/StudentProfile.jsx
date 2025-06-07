import React from 'react';
import { Card, Typography, Descriptions } from 'antd';
import styles from './StudentProfile.module.css';

const { Title } = Typography;

const StudentProfile = () => {
  return (
    <div className={styles.profileContainer}>
      <Card>
        <Title level={2} className={styles.title}>Hồ Sơ Học Sinh</Title>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Họ và tên">Lê Văn Bình</Descriptions.Item>
          <Descriptions.Item label="Mã học sinh">B2209</Descriptions.Item>
          <Descriptions.Item label="Lớp">2E</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">22-09-2004</Descriptions.Item>
          <Descriptions.Item label="Giới tính">Nam</Descriptions.Item>
          <Descriptions.Item label="Họ và tên cha/mẹ">Nguyễn Thị Hạnh</Descriptions.Item>
          <Descriptions.Item label="Nơi ở hiện tại">Quận 9, TP Thủ Đức, TP Hồ Chí Minh</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default StudentProfile; 