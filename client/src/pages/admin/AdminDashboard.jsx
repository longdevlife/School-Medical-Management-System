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
import { Pie, Funnel } from '@ant-design/plots';
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

  const pieConfig = {
    data: chartData,
    angleField: 'count',
    colorField: 'role',
    radius: 0.8,
    label: {
      type: 'outer',
      content: ({ percent, count, role }) => `${role}: ${count} (${(percent * 100).toFixed(1)}%)`,
      style: {
        fontSize: 13,
        fontWeight: 'bold',
        fill: '#1e293b',
      },
    },
    color: ({ role }) => {
      if (role === 'Admin') return '#ff6b6b';
      if (role === 'Nurse + Manager') return '#4ecdc4';
      return '#a855f7';
    },
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 14,
          fontWeight: 600,
          fill: '#1e293b',
        },
      },
      marker: {
        symbol: 'circle',
        style: {
          r: 6,
        },
      },
    },
    tooltip: false, // Bỏ tooltip
    interactions: [], // Bỏ tất cả interactions
    statistic: {
      title: {
        style: {
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#1e293b',
        },
        content: 'Tổng cộng',
      },
      content: {
        style: {
          fontSize: 24,
          fontWeight: 'bold',
          fill: '#667eea',
        },
        content: `${stats.totalUsers}`,
      },
    },
  };

  const funnelConfig = {
    data: chartData.sort((a, b) => b.count - a.count),
    xField: 'role',
    yField: 'count',
    color: ['#ff6b6b', '#4ecdc4', '#a855f7'],
    label: {
      style: {
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#ffffff',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
      },
    },
    conversionTag: {
      style: {
        fontSize: 12,
        fontWeight: 600,
        fill: '#64748b',
      },
    },
    funnelStyle: {
      stroke: '#ffffff',
      lineWidth: 2,
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
    <div style={{ 
      padding: '40px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh' 
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '40px', 
        textAlign: 'center',
        background: 'rgba(255,255,255,0.95)',
        padding: '30px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <TrophyOutlined style={{ fontSize: '48px', color: '#f59e0b', marginBottom: '16px' }} />
        <Title level={1} style={{ 
          color: '#1e293b', 
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          fontSize: '2.5rem'
        }}>
          🏆 Admin Dashboard
        </Title>
        <Text style={{ 
          fontSize: '18px',
          color: '#64748b',
          fontWeight: 500
        }}>
          Hệ thống quản lý toàn diện
        </Text>
        <Divider style={{ margin: '20px 0 0 0' }} />
      </div>

      {/* Main Stats Cards */}
      <Row gutter={[32, 32]} justify="center" style={{ marginBottom: '40px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
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
      </Row>

      {/* Role Distribution Cards */}
      <Row gutter={[24, 24]} justify="center" style={{ marginBottom: '40px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            }}
            className="hover-card"
          >
            <Statistic
              title={<span style={{ color: '#be185d', fontSize: '16px', fontWeight: 600 }}>👑 Admin</span>}
              value={stats.adminCount}
              prefix={<CrownOutlined style={{ color: '#dc2626', fontSize: '24px' }} />}
              valueStyle={{ color: '#be185d', fontWeight: 700, fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            }}
            className="hover-card"
          >
            <Statistic
              title={<span style={{ color: '#0e7490', fontSize: '16px', fontWeight: 600 }}>🏥 Nurse + Manager</span>}
              value={stats.nurseManagerCount}
              prefix={<MedicineBoxOutlined style={{ color: '#0e7490', fontSize: '24px' }} />}
              valueStyle={{ color: '#0e7490', fontWeight: 700, fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #d299c2 0%, #fef9d3 100%)',
            }}
            className="hover-card"
          >
            <Statistic
              title={<span style={{ color: '#7c3aed', fontSize: '16px', fontWeight: 600 }}>👨‍👩‍👧‍👦 Parent</span>}
              value={stats.parentCount}
              prefix={<UserSwitchOutlined style={{ color: '#7c3aed', fontSize: '24px' }} />}
              valueStyle={{ color: '#7c3aed', fontWeight: 700, fontSize: '28px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[32, 32]} justify="center">
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                }}>
                  <span style={{ color: 'white', fontSize: '16px' }}>🥧</span>
                </div>
                <div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '18px', 
                    color: '#1e293b',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block',
                  }}>
                    Biểu đồ tròn
                  </span>
                  <span style={{ 
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}>
                    Phân bố theo tỷ lệ
                  </span>
                </div>
              </div>
            }
            style={{ 
              ...cardStyle,
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            bodyStyle={{ 
              padding: '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            }}
          >
            <Pie {...pieConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                }}>
                  <span style={{ color: 'white', fontSize: '16px' }}>🔺</span>
                </div>
                <div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    fontSize: '18px', 
                    color: '#1e293b',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block',
                  }}>
                    Biểu đồ phân cấp
                  </span>
                  <span style={{ 
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}>
                    Phân bố theo cấp bậc
                  </span>
                </div>
              </div>
            }
            style={{ 
              ...cardStyle,
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
            bodyStyle={{ 
              padding: '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            }}
          >
            <Funnel {...funnelConfig} />
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.2);
        }
        
        .hover-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
   