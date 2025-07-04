import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  message,
  Typography,
} from 'antd';
import {
  MedicineBoxOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { getAllAccounts } from '../../api/userApi';

const { Title, Text } = Typography;

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAccounts: 0,
    adminCount: 0,
    nurseManagerCount: 0,
    parentCount: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await getAllAccounts();
      const data = Array.isArray(res.data) ? res.data : [];

      const totalUsers = data.length;
      const activeAccounts = data.filter((acc) => acc.isActive).length;
      const adminCount = data.filter((acc) => acc.roleName === 'Admin').length;
      const nurseManagerCount = data.filter(
        (acc) => acc.roleName === 'Nurse' || acc.roleName === 'Manager'
      ).length;
      const parentCount = data.filter((acc) => acc.roleName === 'Parent').length;

      setStats({
        totalUsers,
        activeAccounts,
        adminCount,
        nurseManagerCount,
        parentCount,
      });
    } catch (error) {
      message.error('Không thể tải dữ liệu thống kê!');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = [
    {
      role: 'Admin',
      count: stats.adminCount,
    },
    {
      role: 'Nurse + Manager',
      count: stats.nurseManagerCount,
    },
    {
      role: 'Parent',
      count: stats.parentCount,
    },
  ];

  const config = {
    data: chartData,
    xField: 'role',
    yField: 'count',
    columnWidthRatio: 0.5,
    label: {
      position: 'top',
      style: {
        fill: '#1f2937',
        fontSize: 14,
        fontWeight: 'bold',
      },
    },
    color: ({ role }) => {
      if (role === 'Admin') return '#dc2626';
      if (role === 'Nurse + Manager') return '#0e7490';
      return '#7c3aed';
    },
    height: 300,
    xAxis: {
      label: {
        style: {
          fontSize: 14,
          fontWeight: 500,
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fontSize: 14,
        },
      },
    },
  };

  return (
    <div style={{ padding: '40px', background: '#f0f9ff', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#1d4ed8', fontWeight: 'bold' }}>
          📊 Dashboard Quản Lý
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Tổng quan hệ thống
        </Text>
      </div>

      {/* Tổng người dùng và đang hoạt động */}
      <Row gutter={[24, 24]} justify="center" style={{ marginBottom: '30px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              background: '#e0f2fe',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1e3a8a', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            bordered={false}
            style={{
              borderRadius: 20,
              background: '#dcfce7',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            }}
          >
            <Statistic
              title="Đang hoạt động"
              value={stats.activeAccounts}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#166534', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Các loại tài khoản */}
      <Row gutter={[24, 24]} justify="center" style={{ marginBottom: 40 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} style={{ background: '#fee2e2', borderRadius: 20 }}>
            <Statistic
              title="Admin"
              value={stats.adminCount}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#b91c1c', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} style={{ background: '#e0f7fa', borderRadius: 20 }}>
            <Statistic
              title="Nurse + Manager"
              value={stats.nurseManagerCount}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#0e7490', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card bordered={false} style={{ background: '#ede9fe', borderRadius: 20 }}>
            <Statistic
              title="Parent"
              value={stats.parentCount}
              prefix={<UserSwitchOutlined />}
              valueStyle={{ color: '#7c3aed', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ cột phân chia */}
      <Card
        title={
          <span style={{ fontWeight: 'bold', fontSize: 16, color: '#1d4ed8' }}>
            📊 Biểu đồ phân loại tài khoản
          </span>
        }
        style={{ borderRadius: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      >
        <Column {...config} />
      </Card>
    </div>
  );
}

export default AdminDashboard;
