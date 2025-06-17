import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { HeartOutlined, MedicineBoxOutlined, CalendarOutlined } from '@ant-design/icons';

function ParentDashboard() {
  // Mock data - replace with actual API calls
  const healthStats = {
    totalCheckups: 12,
    upcomingVaccinations: 2,
    activeMedications: 1
  };

  const recentHealthRecords = [
    {
      key: '1',
      date: '2024-03-15',
      type: 'Khám sức khỏe định kỳ',
      status: 'Hoàn thành',
      notes: 'Sức khỏe tốt, chiều cao và cân nặng phát triển bình thường'
    },
    {
      key: '2',
      date: '2024-03-10',
      type: 'Tiêm chủng',
      status: 'Hoàn thành',
      notes: 'Tiêm vắc-xin cúm mùa'
    }
  ];

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  return (
    <div>
      <h1>Thông tin sức khỏe của con</h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số lần khám"
              value={healthStats.totalCheckups}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Lịch tiêm chủng sắp tới"
              value={healthStats.upcomingVaccinations}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Thuốc đang sử dụng"
              value={healthStats.activeMedications}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Lịch sử khám sức khỏe gần đây">
        <Table
          columns={columns}
          dataSource={recentHealthRecords}
          pagination={false}
        />
      </Card>
    </div>
  );
}

export default ParentDashboard; 