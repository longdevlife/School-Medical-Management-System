import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Select,
  message,
  Spin,
  Typography,
  Space,
  Divider,
  Alert
} from 'antd';
import {
  UserOutlined,
  HeartOutlined,
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import declareApi from '../../api/declareApi';
import studentApi from '../../api/studentApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const DeclareHealthProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [healthProfile, setHealthProfile] = useState(null);

  // Fetch danh sách học sinh của phụ huynh
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await studentApi.parent.getMyChildren();

      if (response?.data) {
        let studentsData = [];

        if (Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        } else if (response.data.students && Array.isArray(response.data.students)) {
          studentsData = response.data.students;
        }

        const processedStudents = studentsData.map(student => ({
          StudentID: student.studentID || student.StudentID || student.id,
          StudentName: student.studentName || student.StudentName || student.name,
          Class: student.class || student.className || student.ClassName
        }));

        setStudents(processedStudents);

        console.log('👥 Danh sách học sinh đã load:', processedStudents);
        console.log('📋 Student IDs:', processedStudents.map(s => s.StudentID));

        // Auto select first student
        if (processedStudents.length > 0) {
          console.log('🎯 Auto selecting first student:', processedStudents[0].StudentID);
          setSelectedStudentId(processedStudents[0].StudentID);
        }
      }
    } catch (error) {
      message.error('Không thể tải danh sách học sinh');
    } finally {
      setStudentsLoading(false);
    }
  };

  // Load thông tin hồ sơ sức khỏe
  const loadHealthProfile = async (studentId) => {
    if (!studentId) return;

    try {
      setLoading(true);
      console.log(`🔍 Đang tải hồ sơ sức khỏe cho học sinh ID: ${studentId}`);

      // Gọi API để lấy health profiles của parent
      const response = await declareApi.parent.getHealthProfile();

      console.log('📋 Raw API response:', response);

      if (response?.data) {
        if (Array.isArray(response.data)) {
          console.log('📊 Dữ liệu là array với', response.data.length, 'health profiles');

          if (response.data.length === 0) {
            console.log('⚠️ Backend trả về empty array - có thể chưa có health profile nào trong DB');
            // Tạo form trống cho user điền
            form.resetFields();
            form.setFieldsValue({ studentID: studentId });
            setHealthProfile(null);
            message.info('Chưa có hồ sơ sức khỏe, vui lòng điền thông tin để tạo mới');
            return;
          }

          // Debug: In ra structure của từng item
          response.data.forEach((item, index) => {
            console.log(`📋 Item ${index}:`, JSON.stringify(item, null, 2));
          });

          // Tìm health profile của student được chọn
          const healthProfileData = response.data.find(item =>
            item.StudentID === studentId || item.studentID === studentId || item.studentId === studentId
          );

          if (healthProfileData) {
            console.log('✅ Tìm thấy health profile:', healthProfileData);
            setHealthProfile(healthProfileData);

            // Fill form với dữ liệu từ backend (Backend trả về camelCase)
            const formData = {
              studentID: healthProfileData.studentID || studentId,
              allergyHistory: healthProfileData.allergyHistory || '',
              chronicDiseases: healthProfileData.chronicDiseases || '',
              pastSurgeries: healthProfileData.pastSurgeries || 0,
              surgicalCause: healthProfileData.surgicalCause || '',
              disabilities: healthProfileData.disabilities || '',
              height: healthProfileData.height || '',
              weight: healthProfileData.weight || '',
              visionLeft: healthProfileData.visionLeft ? String(healthProfileData.visionLeft) : '',
              visionRight: healthProfileData.visionRight ? String(healthProfileData.visionRight) : '',
              toothDecay: healthProfileData.toothDecay || '',
              otheHealthIssues: healthProfileData.otheHealthIssues || ''
            };

            console.log('📝 Form data để fill:', formData);
            form.setFieldsValue(formData);

            // Kiểm tra xem có dữ liệu thực sự không
            const hasData = formData.allergyHistory || formData.chronicDiseases ||
              formData.height || formData.weight || formData.disabilities ||
              formData.surgicalCause || formData.toothDecay || formData.otheHealthIssues;

            if (hasData) {
              message.success('Đã tải thông tin hồ sơ sức khỏe');
            } else {
              message.info('Hồ sơ sức khỏe chưa có thông tin chi tiết, vui lòng cập nhật');
            }
          } else {
            console.log('❌ Không tìm thấy health profile cho student:', studentId);
            console.log('📋 Các Student ID có sẵn:', response.data.map(item =>
              item.StudentID || item.studentID || item.studentId || 'NO_ID'
            ));

            // Reset form khi không tìm thấy - có thể student này chưa có health profile
            form.resetFields();
            form.setFieldsValue({ studentID: studentId });
            setHealthProfile(null);
            message.info('Chưa có hồ sơ sức khỏe cho học sinh này, vui lòng điền thông tin để tạo mới');
          }
        } else {
          console.log('⚠️ Response data không phải array:', response.data);
          console.log('📋 Type của response.data:', typeof response.data);

          // Reset form khi data không đúng format
          form.resetFields();
          form.setFieldsValue({ studentID: studentId });
          setHealthProfile(null);
          message.info('Chưa có hồ sơ sức khỏe, vui lòng điền thông tin');
        }
      } else {
        console.log('⚠️ Response không có data:', response);

        // Reset form khi không có data
        form.resetFields();
        form.setFieldsValue({ studentID: studentId });
        setHealthProfile(null);
        message.info('Chưa có hồ sơ sức khỏe, vui lòng điền thông tin');
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải hồ sơ sức khỏe:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      // Reset form khi có lỗi
      form.resetFields();
      form.setFieldsValue({ studentID: studentId });
      setHealthProfile(null);

      if (error.response?.status === 404) {
        message.info('Chưa có hồ sơ sức khỏe, vui lòng điền thông tin để tạo mới');
      } else if (error.response?.status === 401) {
        message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
      } else {
        message.error('Không thể tải hồ sơ sức khỏe: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      console.log('📤 Form values:', values);
      console.log('🔍 otheHealthIssues value:', values.otheHealthIssues);

      // Chuẩn bị data theo format PascalCase mà backend mong đợi
      const submitData = {
        StudentID: selectedStudentId,
        AllergyHistory: values.allergyHistory || '',
        ChronicDiseases: values.chronicDiseases || '',
        PastSurgeries: parseInt(values.pastSurgeries) || 0,
        SurgicalCause: values.surgicalCause || '',
        Disabilities: values.disabilities || '',
        Height: values.height ? parseFloat(values.height) : null,
        Weight: values.weight ? parseFloat(values.weight) : null,
        VisionLeft: values.visionLeft ? parseInt(values.visionLeft.replace(/[^0-9]/g, '')) || null : null,
        VisionRight: values.visionRight ? parseInt(values.visionRight.replace(/[^0-9]/g, '')) || null : null,
        ToothDecay: values.toothDecay || '',
        OtheHealthIssues: values.otheHealthIssues || ''
      };

      console.log('📤 Submit data (PascalCase):', submitData);
      console.log('🔍 OtheHealthIssues submit value:', submitData.OtheHealthIssues);

      await declareApi.parent.updateHealthProfile(submitData);

      message.success('Cập nhật hồ sơ sức khỏe thành công!');

      // Reload để cập nhật dữ liệu mới
      await loadHealthProfile(selectedStudentId);

    } catch (error) {
      console.error('❌ Submit error:', error);

      if (error.response?.status === 400) {
        message.error('Dữ liệu không hợp lệ, vui lòng kiểm tra lại');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền cập nhật thông tin này');
      } else {
        message.error('Có lỗi xảy ra khi cập nhật hồ sơ sức khỏe');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý thay đổi học sinh
  const handleStudentChange = (studentId) => {
    setSelectedStudentId(studentId);
    form.resetFields();
  };

  // Load students khi component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Load health profile khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId) {
      loadHealthProfile(selectedStudentId);
    }
  }, [selectedStudentId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #0DACCD 0%, #2980b9 100%)",
          borderRadius: "32px",
          boxShadow: "0 10px 32px rgba(22,160,133,0.18)",
          padding: "32px 40px 28px 40px",
          margin: "32px 0 24px 0",
          maxWidth: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 120
        }}
      >
        {/* Left: Icon + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Icon */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "linear-gradient(135deg, #d1f4f9 0%, #80d0c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 8px 24px rgba(128,208,199,0.25), inset 0 2px 4px rgba(255,255,255,0.3)",
              border: "2px solid rgba(255,255,255,0.4)",
              backdropFilter: "blur(2px)",
            }}
          >
            <span style={{ fontSize: 44, filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.13))" }}>🗒</span>
          </div>
          {/* Title + Subtitle */}
          <div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: "#fff",
                textShadow: "2px 2px 8px rgba(0,0,0,0.13)",
                letterSpacing: "0.5px",
                marginBottom: 8
              }}
            >
              Khai báo hồ sơ sức khỏe
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 0 4px rgba(16,185,129,0.18)"
                }}
              />
              <span
                style={{
                  fontSize: 17,
                  color: "#f3f4f6",
                  fontWeight: 500,
                  textShadow: "1px 1px 3px rgba(0,0,0,0.10)"
                }}
              >
                Xem và cập nhật thông tin sức khỏe của con
              </span>
            </div>
          </div>
          
        </div>

        {/* Ngày */}
        <div style={{ display: "flex", gap: 18 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.13)",
              borderRadius: 18,
              padding: "18px 28px",
              minWidth: 110,
              textAlign: "center",
              color: "#fff",
              boxShadow: "0 2px 8px rgba(22,160,133,0.12)"
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 4 }}>
              <span role="img" aria-label="clock">⏰</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {new Date().toLocaleDateString('vi-VN')}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Hôm nay</div>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Student Selection Card */}

        {/* Health Profile Form */}
        {selectedStudentId && (
          <Spin spinning={loading}>
            <Card
              style={{
                borderRadius: 20,
                border: "none",
                background: "white",
                boxShadow: "0 8px 32px rgba(127,90,240,0.07), 0 0 0 1px #f3f4f6",
                marginBottom: 24,
              }}
              bodyStyle={{ padding: "32px" }}
              title={
                <Row align="middle" justify="space-between">
                  <Col>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(59,130,246,0.13)",
                          border: "2px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <span style={{
                          color: "white",
                          fontSize: 18,
                          textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}>🏥</span>
                      </div>
                      <div>
                        <Text strong style={{ fontSize: 16, color: "#1e293b" }}>
                          Hồ sơ sức khỏe chi tiết
                        </Text>
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          {healthProfile ? 'Cập nhật thông tin sức khỏe hiện tại' : 'Tạo mới hồ sơ sức khỏe'}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col>
                    <div style={{ minWidth: 280 }}>
                      <Select
                        style={{ width: '100%' }}
                        placeholder="Chọn học sinh để xem hồ sơ sức khỏe"
                        value={selectedStudentId}
                        onChange={handleStudentChange}
                        loading={studentsLoading}
                        size="large"
                      >
                        {students.map(student => (
                          <Option key={student.StudentID} value={student.StudentID}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '16px' }}>👨‍🎓</span>
                              <div>
                                <span>{student.StudentName}</span>
                                <span>-</span>
                                <span style={{ color: '#64748b', marginLeft: 8 }}>
                                   Lớp {student.Class}
                                </span>
                              </div>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                </Row>
              }
            >

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  pastSurgeries: 0,
                  height: '',
                  weight: ''
                }}
              >
                <Row gutter={[24, 24]}>
                  {/* Tiền sử bệnh án Section */}
                  <Col span={24}>
                    <Card
                      style={{
                        borderRadius: 16,
                        border: "2px solid #bfdbfe",
                        background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
                        boxShadow: "0 4px 16px rgba(59, 130, 246, 0.08)"
                      }}
                      bodyStyle={{ padding: "24px 28px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                          }}
                        >
                          <HeartOutlined style={{ color: "white", fontSize: 18 }} />
                        </div>
                        <div>
                          <Title level={4} style={{ margin: 0, marginRight: 127, color: "#1e3a8a" }}>
                            Tiền sử bệnh án
                          </Title>
                          <Text style={{ color: "#a3a3a3", fontSize: 13 }}>
                            Thông tin về các bệnh đã mắc phải và điều trị
                          </Text>
                        </div>
                      </div>

                      <Row gutter={[20, 20]}>
                        <Col span={12}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Tiền sử dị ứng
                              </span>
                            }
                            name="allergyHistory"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Ví dụ: Dị ứng thuốc kháng sinh, dị ứng phấn hoa..."
                              style={{
                                borderRadius: 8,
                                color: "#374151"
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Bệnh mãn tính
                              </span>
                            }
                            name="chronicDiseases"
                          >
                            <TextArea
                              rows={3}
                              placeholder="Ví dụ: Hen suyễn, tiểu đường, cao huyết áp..."
                              style={{
                                borderRadius: 8,
                                color: "#374151"
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Số lần phẫu thuật
                              </span>
                            }
                            name="pastSurgeries"
                          >
                            <InputNumber
                              style={{
                                width: '100%',
                                borderRadius: 8,
                                color: "#374151"
                              }}
                              min={0}
                              placeholder="0"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Nguyên nhân phẫu thuật
                              </span>
                            }
                            name="surgicalCause"
                          >
                            <Input
                              placeholder="Ví dụ: Phẫu thuật ruột thừa, phẫu thuật gãy xương..."
                              style={{
                                borderRadius: 8,
                                color: "#374151",
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Khuyết tật (nếu có)
                              </span>
                            }
                            name="disabilities"
                          >
                            <TextArea
                              rows={2}
                              placeholder="Mô tả các khuyết tật về thể chất hoặc tinh thần (nếu có)..."
                              style={{
                                borderRadius: 8,
                                color: "#374151"
                              }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Thông số cơ thể Section */}
                  <Col span={24}>
                    <Card
                      style={{
                        borderRadius: 16,
                        border: "2px solid #bfdbfe",
                        background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
                        boxShadow: "0 4px 16px rgba(59, 130, 246, 0.08)"
                      }}
                      bodyStyle={{ padding: "24px 28px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                          }}
                        >
                          <UserOutlined style={{ color: "white", fontSize: 18 }} />
                        </div>
                        <div>
                          <Title level={4} style={{ margin: 0, marginRight: 40, color: "#1e3a8a" }}>
                            Thông số cơ thể
                          </Title>
                          <Text style={{ color: "#a3a3a3", fontSize: 13 }}>
                            Các chỉ số về phát triển thể chất
                          </Text>
                        </div>
                      </div>

                      <Row gutter={[20, 20]}>
                        <Col span={8}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Chiều cao (m)
                              </span>
                            }
                            name="height"
                          >
                            <InputNumber
                              style={{
                                width: '100%',
                                borderRadius: 8,
                                border: "1px solid #93c5fd"
                              }}
                              min={0}
                              max={250}
                              step={0.1}
                              placeholder="VD: 120.5"
                              formatter={value => `${value} `}
                              parser={value => value.replace('m', '')}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Cân nặng (kg)
                              </span>
                            }
                            name="weight"
                          >
                            <InputNumber
                              style={{
                                width: '100%',
                                borderRadius: 8,
                                border: "1px solid #93c5fd"
                              }}
                              min={0}
                              max={200}
                              step={0.1}
                              placeholder="VD: 25.5"
                              formatter={value => `${value}`}
                              parser={value => value.replace(' kg', '')}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={8}>
                          <Form.Item name="toothDecay" label="Tình trạng răng miệng">
                            <Input placeholder="Nhập tình trạng răng miệng (nếu có)" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Thị lực Section */}
                  <Col span={24}>
                    <Card
                      style={{
                        borderRadius: 16,
                        border: "2px solid #bfdbfe",
                        background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
                        boxShadow: "0 4px 16px rgba(59, 130, 246, 0.08)"
                      }}
                      bodyStyle={{ padding: "24px 28px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                          }}
                        >
                          <EyeOutlined style={{ color: "white", fontSize: 18 }} />
                        </div>
                        <div>
                          <Title level={4} style={{ margin: 0, marginRight: 50, color: "#1e3a8a" }}>
                            Thị lực và tầm nhìn
                          </Title>
                          <Text style={{ color: "#a3a3a3", fontSize: 13 }}>
                            Đánh giá khả năng nhìn của cả hai mắt
                          </Text>
                        </div>
                      </div>

                      <Row gutter={[20, 20]}>
                        <Col span={12}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Thị lực mắt trái
                              </span>
                            }
                            name="visionLeft"
                          >
                            <Input placeholder="Nhập thị lực mắt trái " />
                          </Form.Item>
                        </Col>

                        <Col span={12}>
                          <Form.Item
                            label={
                              <span style={{ fontWeight: 600, color: "#374151" }}>
                                Thị lực mắt phải
                              </span>
                            }
                            name="visionRight"
                          >
                            <Input placeholder="Nhập thị lực mắt phải" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  {/* Vấn đề sức khỏe khác Section */}
                  <Col span={24}>
                    <Card
                      style={{
                        borderRadius: 16,
                        border: "2px solid #bfdbfe",
                        background: "linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)",
                        boxShadow: "0 4px 16px rgba(59, 130, 246, 0.08)"
                      }}
                      bodyStyle={{ padding: "24px 28px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
                          }}
                        >
                          <span style={{ color: "white", fontSize: 18 }}>🩺</span>
                        </div>
                        <div>
                          <Title level={4} style={{ margin: 0, marginRight: 70, color: "#1e3a8a" }}>
                            Vấn đề sức khỏe khác
                          </Title>
                          <Text style={{ color: "#a3a3a3", fontSize: 13 }}>
                            Các thông tin bổ sung về tình trạng sức khỏe
                          </Text>
                        </div>
                      </div>

                      <Form.Item
                        label={
                          <span style={{ fontWeight: 600, color: "#374151" }}>
                            Các vấn đề sức khỏe khác
                          </span>
                        }
                        name="otheHealthIssues"
                      >
                        <TextArea
                          rows={4}
                          placeholder="Ví dụ: Hay bị đau đầu, khó ngủ, hay ốm vặt, có sử dụng thuốc thường xuyên..."
                          style={{
                            borderRadius: 8,
                            color: "#374151"
                          }}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                </Row>

                {/* Submit Button Section */}
                <Col span={24}>
                  <Card
                    style={{
                      borderRadius: 16,
                      textAlign: "center"
                    }}
                    bodyStyle={{ padding: "32px" }}
                  >
                    <div style={{ marginBottom: 16 }}>
                      <Title level={5} style={{ color: "#1e3a8a", marginBottom: 8 }}>
                        🏥 Xác nhận thông tin
                      </Title>
                      <Text style={{ color: "#6b7280" }}>
                        Vui lòng kiểm tra kỹ thông tin trước khi lưu hồ sơ sức khỏe
                      </Text>
                    </div>

                    <Space size="large">
                      <Button
                        type="default"
                        onClick={() => form.resetFields()}
                        disabled={submitting}
                        size="large"
                        style={{
                          borderRadius: 12,
                          height: 48,
                          paddingLeft: 24,
                          paddingRight: 24,
                          border: "2px solid #e5e7eb",
                          fontWeight: 600
                        }}
                        icon={<ReloadOutlined />}
                      >
                        Đặt lại
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={submitting}
                        icon={<SaveOutlined />}
                        size="large"
                        style={{
                          borderRadius: 12,
                          height: 48,
                          paddingLeft: 32,
                          paddingRight: 32,
                          background: "linear-gradient(135deg,rgb(5, 82, 150) 0%,rgb(26, 147, 178) 100%)",
                          border: "none",
                          boxShadow: "0 4px 16px rgba(5, 74, 131, 0.25)",
                          fontWeight: 700,
                          fontSize: 16
                        }}
                      >
                        {healthProfile ? ' Cập nhật hồ sơ' : ' Lưu hồ sơ mới'}
                      </Button>
                    </Space>
                  </Card>
                </Col>
              </Form>
            </Card>
          </Spin>
        )}
        {/* Empty State */}
        {!selectedStudentId && !studentsLoading && (
          <Card
            style={{
              borderRadius: 20,
              border: "none",
              background: "white",
              boxShadow: "0 8px 32px rgba(127,90,240,0.07), 0 0 0 1px #f3f4f6",
            }}
            bodyStyle={{ padding: "48px" }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}
              >
                <UserOutlined style={{ fontSize: '32px', color: '#9ca3af' }} />
              </div>
              <Title level={4} type="secondary" style={{ marginBottom: '8px' }}>
                Vui lòng chọn học sinh
              </Title>
              <Text type="secondary">
                Chọn học sinh từ danh sách để xem và cập nhật hồ sơ sức khỏe
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
export default DeclareHealthProfile;