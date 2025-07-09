import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Card,
  Tag,
  message,
  Row,
  Col,
  Descriptions,
  Typography,
  Spin,
  Empty,
  Badge,
  Tooltip,
  Select,
  Space,
  Input
} from 'antd';
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import appointApi from '../../api/appointApi';
import studentApi from '../../api/studentApi';


const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState(null);
  const [actionType, setActionType] = useState(''); // 'confirm' or 'denied'
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  // Student management states
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Component mount
  useEffect(() => {
    console.log('🚀 Appointment component mounting...');
    fetchStudents();
  }, []);

  // Effect để tải appointments khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId) {
      console.log('🔄 Học sinh đã thay đổi:', selectedStudentId);
      fetchAppointments();
    }
  }, [selectedStudentId]);

  // ==================== API FUNCTIONS ====================

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      console.log('🔄 Đang lấy danh sách học sinh của phụ huynh...');

      const response = await studentApi.parent.getMyChildren();
      console.log('✅ API getMyChildren response:', response);

      const studentsData = response.data || [];

      if (Array.isArray(studentsData) && studentsData.length > 0) {
        const processedStudents = studentsData.map(student => ({
          StudentID: student.studentID || student.StudentID || student.id,
          StudentName: student.studentName || student.StudentName || student.name || 'Học sinh',
          StudentCode: student.studentID || student.StudentID || student.studentCode || student.id,
          Class: student.class || student.className || student.ClassName || student.grade || student.classRoom || student.class_name || 'Chưa phân lớp',
        }));

        console.log('📋 Danh sách học sinh đã xử lý:', processedStudents);
        setStudents(processedStudents);

        // Tự động chọn học sinh đầu tiên nếu chưa chọn
        if (processedStudents.length > 0 && !selectedStudentId) {
          console.log('🔍 Tự động chọn học sinh đầu tiên:', processedStudents[0].StudentID);
          setSelectedStudentId(processedStudents[0].StudentID);
        }

        console.log(`✅ Đã tải ${processedStudents.length} học sinh`);
      } else {
        console.warn('⚠️ Không có dữ liệu học sinh hoặc dữ liệu không hợp lệ:', studentsData);
        setStudents([]);
        message.warning('Không tìm thấy thông tin học sinh');
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách học sinh:', error);
      message.error('Không thể tải danh sách học sinh. Vui lòng thử lại!');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!selectedStudentId) {
      console.log('⚠️ Chưa chọn học sinh, không tải appointments');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Đang lấy danh sách appointment cho học sinh:', selectedStudentId);

      // Lấy thông tin user hiện tại để có parentId
      const userInfoResponse = await appointApi.parent.getCurrentUserInfo();
      const parentId = userInfoResponse?.data?.user?.userID;

      if (!parentId) {
        console.error('❌ Không tìm thấy parentId trong user info:', userInfoResponse?.data);
        message.error('Không thể xác định thông tin phụ huynh');
        return;
      }

      console.log('👤 Parent ID:', parentId);

      const response = await appointApi.parent.getHealthCheckupsByParentId(parentId);
      console.log('✅ Health checkup response:', response);

      const healthCheckupData = response.data || [];

      if (Array.isArray(healthCheckupData)) {
        // Lọc health checkup theo học sinh đã chọn và có appointment
        const filteredAppointments = healthCheckupData
          .filter(item => {
            const matchStudent = item.studentID && selectedStudentId &&
              item.studentID.toString().toLowerCase() === selectedStudentId.toString().toLowerCase();
            const hasAppointment = item.appointment && item.appointment.appointmentID;
            return matchStudent && hasAppointment;
          })
          .map(item => {
            const appointment = item.appointment;
            return {
              key: appointment.appointmentID,
              AppointmentID: appointment.appointmentID,
              DateTime: appointment.dateTime || appointment.DateTime,
              Location: appointment.location || appointment.Location,
              Reason: appointment.reason || appointment.Reason,
              Status: appointment.status || appointment.Status,
              Notes: appointment.notes || appointment.Notes,
              HealthCheckUpID: appointment.healthCheckUpID || appointment.HealthCheckUpID,
              StudentID: item.studentID,
              StudentName: item.studentName || 'Học sinh',
              HealthCheckup: {
                CheckDate: item.checkDate || item.CheckDate,
                Height: item.height || item.Height,
                Weight: item.weight || item.Weight,
                BMI: item.bmi || item.BMI,
              }
            };
          });

        console.log('📋 Appointments đã lọc và chuẩn hóa:', filteredAppointments);
        setAppointments(filteredAppointments);

        if (filteredAppointments.length === 0) {
          message.info('Không có lịch hẹn nào cho học sinh này');
        } else {
          console.log(`✅ Đã tải ${filteredAppointments.length} appointment`);
        }
      } else {
        console.warn('⚠️ Dữ liệu health checkup không hợp lệ:', healthCheckupData);
        setAppointments([]);
        message.warning('Dữ liệu appointment không hợp lệ');
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách appointment:', error);
      message.error('Không thể tải danh sách appointment. Vui lòng thử lại!');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId, notes = '') => {
    try {
      setActionLoading(true);
      console.log('🔄 Đang xác nhận appointment:', appointmentId, 'với ghi chú:', notes);

      const response = await appointApi.parent.confirmAppointment({
        AppointmentID: appointmentId,
        Notes: notes
      });

      console.log('✅ Xác nhận appointment thành công:', response);
      message.success('Đã xác nhận tham gia cuộc hẹn thành công!');
      
      // Refresh danh sách
      await fetchAppointments();
      
      // Đóng modal
      setIsActionModalVisible(false);
      setNotes('');
    } catch (error) {
      console.error('❌ Lỗi khi xác nhận appointment:', error);
      message.error('Xác nhận appointment thất bại. Vui lòng thử lại!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeniedAppointment = async (appointmentId, notes = '') => {
    try {
      setActionLoading(true);
      console.log('🔄 Đang từ chối appointment:', appointmentId, 'với ghi chú:', notes);

      const response = await appointApi.parent.deniedAppointment({
        AppointmentID: appointmentId,
        Notes: notes
      });

      console.log('✅ Từ chối appointment thành công:', response);
      message.success('Đã từ chối cuộc hẹn thành công!');
      
      // Refresh danh sách
      await fetchAppointments();
      
      // Đóng modal
      setIsActionModalVisible(false);
      setNotes('');
    } catch (error) {
      console.error('❌ Lỗi khi từ chối appointment:', error);
      message.error('Từ chối appointment thất bại. Vui lòng thử lại!');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== UI HELPER FUNCTIONS ====================

  const getStatusTag = (status) => {
    const statusMap = {
      'Pending': { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ xác nhận' },
      'Confirmed': { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã xác nhận' },
      'Denied': { color: 'red', icon: <CloseCircleOutlined />, text: 'Đã từ chối' },
      'Completed': { color: 'blue', icon: <CheckCircleOutlined />, text: 'Đã hoàn thành' },
    };

    const statusInfo = statusMap[status] || { color: 'default', icon: null, text: status };

    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Chưa xác định';
    return moment(dateTime).format('DD/MM/YYYY HH:mm');
  };

  const formatDate = (date) => {
    if (!date) return 'Chưa xác định';
    return moment(date).format('DD/MM/YYYY');
  };

  const canTakeAction = (status) => {
    return status === 'Pending';
  };

  // ==================== TABLE COLUMNS ====================

  const columns = [
    {
      title: 'Thời gian hẹn',
      dataIndex: 'DateTime',
      key: 'DateTime',
      render: (dateTime) => (
        <Space direction="vertical" size={0}>
          <Text strong>{formatDateTime(dateTime)}</Text>
        </Space>
      ),
      sorter: (a, b) => moment(a.DateTime) - moment(b.DateTime),
    },
    {
      title: 'Địa điểm',
      dataIndex: 'Location',
      key: 'Location',
      render: (location) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <Text>{location || 'Chưa xác định'}</Text>
        </Space>
      ),
    },
    {
      title: 'Lý do khám',
      dataIndex: 'Reason',
      key: 'Reason',
      render: (reason) => (
        <Tooltip title={reason}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {reason || 'Khám sức khỏe định kỳ'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'Status',
      key: 'Status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Chờ xác nhận', value: 'Pending' },
        { text: 'Đã xác nhận', value: 'Confirmed' },
        { text: 'Đã từ chối', value: 'Denied' },
        { text: 'Đã hoàn thành', value: 'Completed' },
      ],
      onFilter: (value, record) => record.Status === value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'Notes',
      key: 'Notes',
      render: (notes) => (
        <Text type="secondary" italic>
          {notes || 'Không có ghi chú'}
        </Text>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setViewingAppointment(record);
                setIsDetailModalVisible(true);
              }}
            />
          </Tooltip>

          {canTakeAction(record.Status) && (
            <>
              <Tooltip title="Xác nhận">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => {
                    setViewingAppointment(record);
                    setActionType('confirm');
                    setIsActionModalVisible(true);
                  }}
                />
              </Tooltip>

              <Tooltip title="Từ chối">
                <Button
                  type="primary"
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  onClick={() => {
                    setViewingAppointment(record);
                    setActionType('denied');
                    setIsActionModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  // ==================== RENDER ====================

  const selectedStudent = students.find(s => s.StudentID === selectedStudentId);

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card
        title={
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              Quản lý lịch hẹn khám bệnh
            </Title>
          </Space>
        }
        extra={
          <Button type="primary" onClick={fetchAppointments} loading={loading}>
            Làm mới
          </Button>
        }
        style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        {/* Student Selector */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card
              size="small"
              title={
                <Space>
                  <UserOutlined style={{ color: '#52c41a' }} />
                  <Text strong>Chọn học sinh</Text>
                </Space>
              }
              style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
            >
              <Row gutter={[16, 16]} align="middle">
                <Col span={8}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn học sinh"
                    loading={studentsLoading}
                    value={selectedStudentId}
                    onChange={setSelectedStudentId}
                    showSearch
                    optionFilterProp="children"
                  >
                    {students.map(student => (
                      <Option key={student.StudentID} value={student.StudentID}>
                        {student.StudentName} - {student.Class}
                      </Option>
                    ))}
                  </Select>
                </Col>
                {selectedStudent && (
                  <Col span={16}>
                    <Space>
                      <Badge status="processing" />
                      <Text strong>Học sinh đã chọn:</Text>
                      <Text type="success">{selectedStudent.StudentName}</Text>
                      <Text type="secondary">({selectedStudent.Class})</Text>
                    </Space>
                  </Col>
                )}
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Appointments Table */}
        <Table
          columns={columns}
          dataSource={appointments}
          loading={loading}
          pagination={{
            total: appointments.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch hẹn`,
          }}
          locale={{
            emptyText: selectedStudentId ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có lịch hẹn nào"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Vui lòng chọn học sinh để xem lịch hẹn"
              />
            ),
          }}
          scroll={{ x: 1200 }}
          bordered
          size="middle"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <EyeOutlined style={{ color: '#1890ff' }} />
            <Text strong>Chi tiết lịch hẹn</Text>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {viewingAppointment && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Mã lịch hẹn" span={2}>
              <Text code>{viewingAppointment.AppointmentID}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian hẹn">
              <Text strong>{formatDateTime(viewingAppointment.DateTime)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa điểm">
              <Text>{viewingAppointment.Location}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Lý do khám" span={2}>
              <Text>{viewingAppointment.Reason}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(viewingAppointment.Status)}
            </Descriptions.Item>
            <Descriptions.Item label="Học sinh">
              <Text strong>{viewingAppointment.StudentName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              <Text>{viewingAppointment.Notes || 'Không có ghi chú'}</Text>
            </Descriptions.Item>
            {viewingAppointment.HealthCheckup && (
              <>
                <Descriptions.Item label="Ngày khám sức khỏe">
                  <Text>{formatDate(viewingAppointment.HealthCheckup.CheckDate)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Chiều cao">
                  <Text>{viewingAppointment.HealthCheckup.Height} cm</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Cân nặng">
                  <Text>{viewingAppointment.HealthCheckup.Weight} kg</Text>
                </Descriptions.Item>
                <Descriptions.Item label="BMI">
                  <Text>{viewingAppointment.HealthCheckup.BMI}</Text>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Action Modal (Confirm/Denied) */}
      <Modal
        title={
          <Space>
            {actionType === 'confirm' ? (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
            )}
            <Text strong>
              {actionType === 'confirm' ? 'Xác nhận lịch hẹn' : 'Từ chối lịch hẹn'}
            </Text>
          </Space>
        }
        open={isActionModalVisible}
        onCancel={() => {
          setIsActionModalVisible(false);
          setNotes('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsActionModalVisible(false);
              setNotes('');
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={actionLoading}
            onClick={() => {
              if (actionType === 'confirm') {
                handleConfirmAppointment(viewingAppointment?.AppointmentID, notes);
              } else {
                handleDeniedAppointment(viewingAppointment?.AppointmentID, notes);
              }
            }}
            style={{
              backgroundColor: actionType === 'confirm' ? '#52c41a' : '#ff4d4f',
              borderColor: actionType === 'confirm' ? '#52c41a' : '#ff4d4f',
            }}
          >
            {actionType === 'confirm' ? 'Xác nhận' : 'Từ chối'}
          </Button>,
        ]}
        width={600}
      >
        {viewingAppointment && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Thời gian hẹn">
                <Text strong>{formatDateTime(viewingAppointment.DateTime)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm">
                <Text>{viewingAppointment.Location}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lý do khám">
                <Text>{viewingAppointment.Reason}</Text>
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>
                <FileTextOutlined /> Ghi chú thêm (tuỳ chọn):
              </Text>
              <TextArea
                rows={4}
                placeholder={
                  actionType === 'confirm'
                    ? 'Nhập ghi chú về việc xác nhận tham gia...'
                    : 'Nhập lý do từ chối hoặc ghi chú...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointment;
