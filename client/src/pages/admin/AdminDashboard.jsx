import React from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space } from 'antd';
import { UserOutlined, TeamOutlined, MedicineBoxOutlined, SettingOutlined } from '@ant-design/icons';

function AdminDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalUsers: 50,
    totalStudents: 150,
 
    activeAccounts: 45
  };

  const recentActivities = [
    {
      key: '1',
      date: '2024-03-15',
      user: 'Nguyễn Văn A',
      action: 'Thêm học sinh mới',
      details: 'Thêm thông tin học sinh lớp 1A'
    },
    {
      key: '2',
      date: '2024-03-14',
      user: 'Trần Thị B',
      action: 'Cập nhật thông tin thuốc',
      details: 'Cập nhật số lượng thuốc Paracetamol'
    }
  ];

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Chi tiết',
      dataIndex: 'details',
      key: 'details',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link">Xem chi tiết</Button>
          <Button type="link" danger>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản lý Hệ thống</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
       
        <Col span={6}>
          <Card>
            <Statistic
              title="Tài khoản đang hoạt động"
              value={stats.activeAccounts}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Hoạt động gần đây">
        <Table
          columns={columns}
          dataSource={recentActivities}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default AdminDashboard; 