import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  message,
  Typography,
  Divider,
} from 'antd';
import {
  MedicineBoxOutlined,
  CrownOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  UserOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Pie, Bar } from '@ant-design/plots';
import { getAllAccounts } from '../../api/userApi';

const { Title, Text } = Typography;

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAccounts: 0,
    adminCount: 0,
    nurseCount: 0,
    managerCount: 0,
    parentCount: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await getAllAccounts();
      // Đảm bảo lấy đúng mảng dữ liệu từ backend
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];

      const totalUsers = data.length;
      const activeAccounts = data.filter((acc) => acc.isActive).length;
      const adminCount = data.filter((acc) => acc.roleName === 'Admin').length;
      const nurseCount = data.filter((acc) => acc.roleName === 'Nurse').length;
      const managerCount = data.filter((acc) => acc.roleName === 'Manager').length;
      const parentCount = data.filter((acc) => acc.roleName === 'Parent').length;

      setStats({
        totalUsers,
        activeAccounts,
        adminCount,
        nurseCount,
        managerCount,
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

  

  // Chỉ giữ biểu đồ cột ngang (Bar chart)
  const barData = [
    {
      role: 'ADMIN',
      count: stats.adminCount,
    },
    {
      role: 'Y TÁ',
      count: stats.nurseCount,
    },
    {
      role: 'QUẢN LÝ',
      count: stats.managerCount,
    },
    {
      role: 'PHỤ HUYNH',
      count: stats.parentCount,
    },
  ];
  const barConfig = {
    data: barData,
    xField: 'count',
    yField: 'role',
    seriesField: 'role',
    color: ['#ff6b6b', '#4ecdc4', '#a855f7'],
    legend: false,
    label: {
      position: 'right',
      style: {
        fontSize: 14,
        fontWeight: 600,
      },
      formatter: (datum) => `${datum.count}`,
    },
    barStyle: {
      radius: [8, 8, 8, 8],
    },
    xAxis: {
      title: { text: 'Số lượng', style: { fontWeight: 600 } },
      grid: { line: { style: { stroke: '#e5e7eb', lineDash: [4, 4] } } },
    },
    yAxis: {
      title: { text: 'Vai trò', style: { fontWeight: 600 } },
      label: {
        style: { fontWeight: 700, fontSize: 16 },
        formatter: (text) => text.toUpperCase(),
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.role,
        value: datum.count,
      }),
    },
  };

  const cardStyle = {
    borderRadius: 20,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };

  const cardHoverStyle = {
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
    },
  };

  return (
    <div className="p-0 sm:p-8 bg-gradient-to-br from-blue-200 via-white to-blue-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl">
        {/* Header tinh tế hơn */}
        <div className="mb-14 flex items-center gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-700 rounded-full p-7 shadow-2xl flex items-center justify-center border-4 border-white animate-fade-in">
              <TrophyOutlined className="text-white text-5xl drop-shadow-xl" />
            </div>
            <span className="absolute -bottom-3 -right-3 bg-white rounded-full px-3 py-1 text-xs text-blue-700 font-bold shadow border border-blue-100 select-none tracking-wide" style={{letterSpacing: 1}}>ADMIN</span>
          </div>
          <div className="flex flex-col gap-1">
            <Title level={2} className="text-blue-900 mb-0 font-black tracking-widest drop-shadow-xl leading-tight" style={{letterSpacing: 2}}>Tổng Quan Người Dùng </Title>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse shadow"></span>
              <Text type="secondary" className="text-lg font-medium text-gray-600 italic tracking-wide">Hệ thống quản lý toàn diện</Text>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}

        <Row gutter={[32, 32]} justify="center" style={{ marginBottom: '40px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                color: 'white',
              }}
              className="hover-card"
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 600 }}>👥 Tổng người dùng</span>}
                value={stats.totalUsers}
                prefix={<UserOutlined style={{ color: '#fbbf24' }} />}
                valueStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '32px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: 'white',
              }}
              className="hover-card"
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 600 }}>✅ Đang hoạt động</span>}
                value={stats.activeAccounts}
                prefix={<SettingOutlined style={{ color: '#fbbf24' }} />}
                valueStyle={{ color: '#ffffff', fontWeight: 700, fontSize: '32px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                border: '2px solid #3b82f6'
              }}
              className="hover-card"
            >
              <Statistic
                title={<span style={{ color: '#1e40af', fontSize: '16px', fontWeight: 600 }}>🏥 Nhân Viên </span>}
                value={stats.nurseManagerCount}
                prefix={<MedicineBoxOutlined style={{ color: '#10b981', fontSize: '24px' }} />}
                valueStyle={{ color: '#1e40af', fontWeight: 700, fontSize: '28px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                border: '2px solid #3b82f6'
              }}
              className="hover-card"
            >
              <Statistic
                title={<span style={{ color: '#1e40af', fontSize: '16px', fontWeight: 600 }}>👨‍👩‍👧‍👦 Phụ Huynh</span>}
                value={stats.parentCount}
                prefix={<UserSwitchOutlined style={{ color: '#7c3aed', fontSize: '24px' }} />}
                valueStyle={{ color: '#1e40af', fontWeight: 700, fontSize: '28px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} lg={16}>
            <Card
              title={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '8px 0',
                  borderBottom: '1px solid #e0e7ef',
                  marginBottom: 12
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(59, 130, 246, 0.18)',
                  }}>
                    <span style={{ color: 'white', fontSize: 22 }}>📊</span>
                  </div>
                  <div>
                    <span style={{
                      fontWeight: 800,
                      fontSize: 22,
                      color: '#1e293b',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'block',
                      letterSpacing: 1
                    }}>
                      Biểu đồ cột ngang
                    </span>
                    <span style={{
                      color: '#64748b',
                      fontSize: 14,
                      fontWeight: 500,
                      display: 'block',
                      marginTop: 2
                    }}>
                      So sánh số lượng từng vai trò
                    </span>
                  </div>
                </div>
              }
              className="rounded-3xl shadow-2xl border-blue-200"
              style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #fff 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid #e0e7ef',
                marginBottom: 32
              }}
              bodyStyle={{
                padding: '36px 32px 32px 32px',
                background: 'linear-gradient(135deg, #f8faff 0%, #ffffff 100%)',
                borderRadius: '0 0 24px 24px'
              }}
            >
              <div style={{ minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bar {...{
                  ...barConfig,
                  label: false, // Ẩn số lượng trên cột
                  tooltip: false, // Ẩn bảng khi hover vào biểu đồ
                }} />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(59, 130, 246, 0.18);
        }
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;

