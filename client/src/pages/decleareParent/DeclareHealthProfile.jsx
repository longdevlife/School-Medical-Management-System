import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Typography,
  message,
  Spin,
  Alert,
  Tabs,
  InputNumber,
  DatePicker
} from 'antd';
import {
  HeartOutlined,
  SaveOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import declareApi from '../../api/declareApi';
import studentApi from '../../api/studentApi';


const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const DeclareHealthProfile = () => {
  // States
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  // Helper functions
  const getStudentName = (studentId) => {
    const student = students.find(s => s.StudentID === studentId);
    return student ? student.StudentName : '';
  };

  const getStudentClass = (studentId) => {
    const student = students.find(s => s.StudentID === studentId);
    return student ? (student.Class || 'Chưa phân lớp') : '';
  };

  // Fetch students từ database với debug mở rộng
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setError(null);
      
      console.log('🚀 Bắt đầu fetch students...');
      console.log('🔐 Token hiện tại:', localStorage.getItem('token') ? 'Có token' : 'Không có token');
      console.log('📡 Base URL:', 'https://localhost:7040/api/');
      console.log('📡 Full URL:', 'https://localhost:7040/api/parent/get-student-info-by-parent');
      
      // Test kết nối trước
      console.log('🔄 Đang test API connection...');
      
      const response = await studentApi.parent.getMyChildren();
      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Headers:', response.headers);
      console.log('📥 API Response Data:', response.data);
      
      if (response?.data) {
        console.log('📋 Response data type:', typeof response.data);
        console.log('📋 Response data keys:', Object.keys(response.data || {}));
        
        let studentsData = [];
        
        // Thử nhiều cách parse data
        if (Array.isArray(response.data)) {
          studentsData = response.data;
          console.log('✅ Data is direct array, length:', studentsData.length);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          studentsData = response.data.data;
          console.log('✅ Data in .data property, length:', studentsData.length);
        } else if (response.data.students && Array.isArray(response.data.students)) {
          studentsData = response.data.students;
          console.log('✅ Data in .students property, length:', studentsData.length);
        } else if (response.data.result && Array.isArray(response.data.result)) {
          studentsData = response.data.result;
          console.log('✅ Data in .result property, length:', studentsData.length);
        } else {
          console.log('⚠️ Cannot find array in response:', response.data);
          console.log('📝 Available keys:', Object.keys(response.data || {}));
          
          // Thử tìm array đầu tiên trong response
          const firstArrayKey = Object.keys(response.data || {}).find(key => 
            Array.isArray(response.data[key])
          );
          
          if (firstArrayKey) {
            studentsData = response.data[firstArrayKey];
            console.log(`✅ Found array in .${firstArrayKey}, length:`, studentsData.length);
          }
        }
        
        if (studentsData.length === 0) {
          console.log('⚠️ No students found in response');
          setStudents([]);
          message.warning('Không tìm thấy học sinh nào trong hệ thống');
          return;
        }
        
        console.log('📋 First student sample:', studentsData[0]);
        
        const processedStudents = studentsData.map((student, index) => {
          console.log(`🔍 Processing student ${index + 1}:`, student);
          const processed = {
            StudentID: student.studentID || student.StudentID || student.id || student.ID || index + 1,
            StudentName: student.studentName || student.StudentName || student.name || student.fullName || `Học sinh ${index + 1}`,
            Class: student.class || student.className || student.ClassName || student.grade || student.classRoom || student.class_name || 'Chưa phân lớp',
            Age: student.age || student.Age,
            Sex: student.sex || student.Sex || student.gender,
            Birthday: student.birthday || student.Birthday || student.dateOfBirth,
            ParentName: student.parentName || student.ParentName
          };
          console.log(`✅ Processed student ${index + 1}:`, processed);
          return processed;
        });
        
        console.log('✅ All processed students:', processedStudents);
        setStudents(processedStudents);
        message.success(`Đã tải thành công ${processedStudents.length} học sinh`);
        
        // Auto-select first student if available
        if (processedStudents.length > 0 && !selectedStudentId) {
          console.log('🎯 Auto-selecting first student:', processedStudents[0]);
          setSelectedStudentId(processedStudents[0].StudentID);
        }
      } else {
        console.log('❌ No response.data received');
        setStudents([]);
        message.error('API không trả về dữ liệu');
      }
    } catch (error) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error request:', error.request);
      console.error('❌ Error config:', error.config);
      
      let errorMessage = 'Không thể tải danh sách học sinh';
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
      } else if (error.code === 'ERR_CERT_AUTHORITY_INVALID') {
        errorMessage = 'Lỗi chứng chỉ SSL. Server có thể không được trust.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập dữ liệu này';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy API endpoint';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      }
      
      setError(errorMessage);
      setStudents([]);
      message.error(errorMessage);
    } finally {
      setStudentsLoading(false);
      console.log('🏁 Fetch students completed');
    }
  };

  // Load health profile khi chọn học sinh
  const loadHealthProfile = async (studentID) => {
    if (!studentID) return;
    
    try {
      setLoading(true);
      console.log('🔍 Đang tải health profile cho học sinh:', studentID);
      
      // Gọi API với studentID để lấy thông tin hiện tại
      const response = await declareApi.parent.declareHealthProfile(studentID, {});
      
      if (response?.data) {
        const healthData = response.data;
        console.log('✅ Đã tải health profile:', healthData);
        
        // Fill form với dữ liệu từ backend
        form.setFieldsValue({
          allergyHistory: healthData.allergyHistory || '',
          chronicDiseases: healthData.chronicDiseases || '',
          pastSurgeries: healthData.pastSurgeries || 0,
          surgicalCause: healthData.surgicalCause || '',
          disabilities: healthData.disabilities || '',
          height: healthData.height || '',
          weight: healthData.weight || '',
          visionLeft: healthData.visionLeft || '',
          visionRight: healthData.visionRight || '',
          toothDecay: healthData.toothDecay || '',
          otheHealthIssues: healthData.otheHealthIssues || ''
        });
        
        message.success('Đã tải thông tin hồ sơ sức khỏe');
      }
    } catch (error) {
      console.error('❌ Lỗi khi tải health profile:', error);
      
      if (error.response?.status === 404) {
        console.log('⚠️ Chưa có health profile, form sẽ trống');
        form.resetFields();
        message.info('Chưa có hồ sơ sức khỏe, vui lòng điền thông tin');
      } else {
        message.error('Không thể tải hồ sơ sức khỏe');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle student change
  const handleStudentChange = (studentID) => {
    setSelectedStudentId(studentID);
    loadHealthProfile(studentID);
  };

  // Load health profile khi selectedStudentId thay đổi
  useEffect(() => {
    if (selectedStudentId) {
      loadHealthProfile(selectedStudentId);
    }
  }, [selectedStudentId]);

  // Handle form submit
  const handleSubmit = async (values) => {
    if (!selectedStudentId) {
      message.error('Vui lòng chọn học sinh');
      return;
    }

    try {
      setSubmitting(true);
      
      const submitData = {
        studentID: selectedStudentId,
        allergyHistory: values.allergyHistory || '',
        chronicDiseases: values.chronicDiseases || '',
        pastSurgeries: parseInt(values.pastSurgeries) || 0,
        surgicalCause: values.surgicalCause || '',
        disabilities: values.disabilities || '',
        height: parseFloat(values.height) || 0,
        weight: parseFloat(values.weight) || 0,
        visionLeft: parseFloat(values.visionLeft) || 0,
        visionRight: parseFloat(values.visionRight) || 0,
        toothDecay: values.toothDecay || '',
        otheHealthIssues: values.otheHealthIssues || ''
      };

      console.log('🚀 Đang cập nhật health profile:', submitData);
      
      const response = await declareApi.parent.declareHealthProfile(selectedStudentId, submitData);
      
      if (response?.data) {
        console.log('✅ Cập nhật health profile thành công');
        message.success('Đã cập nhật hồ sơ sức khỏe thành công!');
      }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật health profile:', error);
      
      if (error.response?.status === 404) {
        message.error('Không tìm thấy học sinh');
      } else if (error.response?.status === 403) {
        message.error('Bạn không có quyền cập nhật hồ sơ này');
      } else {
        message.error('Có lỗi xảy ra khi cập nhật hồ sơ sức khỏe');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-xl p-8 m-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-4xl">❤️</span>
            </div>
            
            <div>
              <h1 className="text-4xl font-black mb-2 tracking-wide">
                Khai báo sức khỏe
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
                <p className="text-gray-100 text-lg font-medium">
                  Cập nhật thông tin sức khỏe cho con em
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[80px]">
              <div className="text-2xl mb-1">👦</div>
              <div className="text-2xl font-bold">{students.length}</div>
              <div className="text-xs opacity-80">Học sinh</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
              <div className="text-2xl mb-1">⏰</div>
              <div className="text-lg font-bold">
                {new Date().toLocaleDateString('vi-VN')}
              </div>
              <div className="text-xs opacity-80">Hôm nay</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8">
        {/* Student Selection Card */}
        <Card className="rounded-2xl shadow-lg border-0 mb-6 bg-gray-50">
          <Row gutter={16} align="middle">
            <Col xs={24} sm={12} md={8}>
              <div className="flex items-center space-x-2 mb-2">
                <UserOutlined className="text-blue-500 text-lg" />
                <span className="font-semibold text-gray-700">Chọn học sinh</span>
              </div>
              <Select
                placeholder="Chọn học sinh"
                className="w-full"
                value={selectedStudentId}
                onChange={handleStudentChange}
                loading={studentsLoading}
                showSearch
                optionFilterProp="children"
                size="large"
              >
                {students.map(student => (
                  <Option key={student.StudentID} value={student.StudentID}>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{student.StudentName}</span>
                      <span className="text-gray-500">- {student.Class}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={16} className="flex justify-end">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchStudents}
                loading={studentsLoading}
                className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200 rounded-xl font-semibold px-6"
                size="large"
              >
                Tải lại danh sách
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            message="Có lỗi xảy ra"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-6 rounded-xl"
            action={
              <Button 
                size="small" 
                type="primary" 
                onClick={fetchStudents}
                className="rounded-lg"
              >
                Thử lại
              </Button>
            }
          />
        )}

        {/* Main Form */}
        {selectedStudentId && (
          <>
            <Card
              className="rounded-2xl shadow-lg border-0"
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                      <HeartOutlined className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 m-0">
                        Hồ sơ sức khỏe - {getStudentName(selectedStudentId)}
                      </h3>
                      <p className="text-sm text-gray-500 m-0">
                        Lớp: {getStudentClass(selectedStudentId)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <CheckCircleOutlined />
                    <span>Sẵn sàng khai báo</span>
                  </div>
                </div>
              }
              loading={loading}
            >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="mt-6"
            >
              <Tabs 
                defaultActiveKey="physical" 
                type="card"
                className="custom-tabs"
              >
                {/* Tab 1: Thông tin thể chất */}
                <Tabs.TabPane 
                  tab={
                    <span className="flex items-center space-x-2">
                      <span>�</span>
                      <span>Thông tin thể chất</span>
                    </span>
                  } 
                  key="physical"
                >
                  <div className="bg-blue-50 rounded-xl p-6">
                    <Row gutter={24}>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          name="height"
                          label={<span className="font-semibold text-gray-700">Chiều cao (m)</span>}
                          rules={[
                            { required: true, message: 'Vui lòng nhập chiều cao' },
                            { type: 'number', min: 0.5, max: 2.5, message: 'Chiều cao phải từ 0.5-2.5m' }
                          ]}
                        >
                          <InputNumber
                            placeholder="Ví dụ: 1.9"
                            className="w-full rounded-xl"
                            size="large"
                            min={0.5}
                            max={2.5}
                            step={0.01}
                            precision={2}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          name="weight"
                          label={<span className="font-semibold text-gray-700">Cân nặng (kg)</span>}
                          rules={[
                            { required: true, message: 'Vui lòng nhập cân nặng' },
                            { type: 'number', min: 10, max: 200, message: 'Cân nặng phải từ 10-200kg' }
                          ]}
                        >
                          <InputNumber
                            placeholder="Ví dụ: 70"
                            className="w-full rounded-xl"
                            size="large"
                            min={10}
                            max={200}
                            precision={1}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          name="pastSurgeries"
                          label={<span className="font-semibold text-gray-700">Số lần phẫu thuật</span>}
                        >
                          <InputNumber
                            placeholder="Ví dụ: 1"
                            className="w-full rounded-xl"
                            size="large"
                            min={0}
                            max={50}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="visionLeft"
                          label={<span className="font-semibold text-gray-700">Thị lực mắt trái</span>}
                        >
                          <InputNumber
                            placeholder="Ví dụ: 10"
                            className="w-full rounded-xl"
                            size="large"
                            min={0}
                            max={10}
                            step={0.1}
                            precision={1}
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="visionRight"
                          label={<span className="font-semibold text-gray-700">Thị lực mắt phải</span>}
                        >
                          <InputNumber
                            placeholder="Ví dụ: 10"
                            className="w-full rounded-xl"
                            size="large"
                            min={0}
                            max={10}
                            step={0.1}
                            precision={1}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </Tabs.TabPane>

                {/* Tab 2: Tình trạng sức khỏe */}
                <Tabs.TabPane 
                  tab={
                    <span className="flex items-center space-x-2">
                      <span>🏥</span>
                      <span>Tình trạng sức khỏe</span>
                    </span>
                  } 
                  key="health"
                >
                  <div className="bg-green-50 rounded-xl p-6">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="allergyHistory"
                          label={<span className="font-semibold text-gray-700">Tiền sử dị ứng</span>}
                        >
                          <TextArea
                            rows={4}
                            placeholder="Mô tả tiền sử dị ứng của con (thực phẩm, thuốc, môi trường...)"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="chronicDiseases"
                          label={<span className="font-semibold text-gray-700">Bệnh mạn tính</span>}
                        >
                          <TextArea
                            rows={4}
                            placeholder="Mô tả các bệnh mạn tính của con (hen suyễn, tiểu đường, tim mạch...)"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="surgicalCause"
                          label={<span className="font-semibold text-gray-700">Nguyên nhân phẫu thuật</span>}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Mô tả nguyên nhân các lần phẫu thuật (nếu có)"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="disabilities"
                          label={<span className="font-semibold text-gray-700">Khuyết tật (nếu có)</span>}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Mô tả tình trạng khuyết tật của con (nếu có)"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </Tabs.TabPane>

                {/* Tab 3: Thông tin khác */}
                <Tabs.TabPane 
                  tab={
                    <span className="flex items-center space-x-2">
                      <span>📝</span>
                      <span>Thông tin khác</span>
                    </span>
                  } 
                  key="other"
                >
                  <div className="bg-orange-50 rounded-xl p-6">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="toothDecay"
                          label={<span className="font-semibold text-gray-700">Tình trạng răng miệng</span>}
                        >
                          <TextArea
                            rows={4}
                            placeholder="Mô tả tình trạng răng miệng, sâu răng của con"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </Col>
                      
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="otheHealthIssues"
                          label={<span className="font-semibold text-gray-700">Vấn đề sức khỏe khác</span>}
                        >
                          <TextArea
                            rows={4}
                            placeholder="Các vấn đề sức khỏe khác cần lưu ý"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </Tabs.TabPane>
              </Tabs>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
                <Button
                  size="large"
                  onClick={() => form.resetFields()}
                  disabled={submitting}
                  className="rounded-xl px-8 font-semibold"
                >
                  Đặt lại
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<SaveOutlined />}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-xl px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  size="large"
                >
                  Cập nhật hồ sơ sức khỏe
                </Button>
              </div>
            </Form>
          </Card>
          </>
        )}

        {/* No Student Selected */}
        {!selectedStudentId && !studentsLoading && students.length > 0 && (
          <Card className="text-center rounded-2xl shadow-lg border-0">
            <div className="py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartOutlined className="text-4xl text-gray-400" />
              </div>
              <Title level={3} className="text-gray-500 mb-4">
                Chọn học sinh để khai báo sức khỏe
              </Title>
              <Text className="text-gray-400 text-lg">
                Vui lòng chọn học sinh từ danh sách trên để bắt đầu khai báo thông tin sức khỏe
              </Text>
            </div>
          </Card>
        )}

        {/* No Students */}
        {students.length === 0 && !studentsLoading && (
          <Card className="text-center rounded-2xl shadow-lg border-0">
            <div className="py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-red-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationCircleOutlined className="text-4xl text-orange-500" />
              </div>
              <Title level={3} className="text-gray-500 mb-4">
                Chưa có học sinh nào
              </Title>
              <Text className="text-gray-400 text-lg mb-6">
                Hiện tại chưa có học sinh nào trong danh sách của bạn
              </Text>
              <Button 
                type="primary" 
                onClick={fetchStudents}
                icon={<ReloadOutlined />}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 rounded-xl px-8 font-semibold"
                size="large"
              >
                Tải lại danh sách
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {studentsLoading && (
          <Card className="text-center rounded-2xl shadow-lg border-0">
            <div className="py-16">
              <Spin size="large" tip="Đang tải danh sách học sinh..." />
            </div>
          </Card>
        )}
      </div>

      <style jsx>{`
        .custom-tabs .ant-tabs-tab {
          border-radius: 12px 12px 0 0;
          border: none;
          background: transparent;
          color: #6b7280;
          font-weight: 500;
          padding: 12px 24px;
        }

        .custom-tabs .ant-tabs-tab-active {
          background: white;
          color: #7c3aed;
          font-weight: 600;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #7c3aed;
        }

        .ant-input, .ant-input-number, .ant-select-selector, .ant-picker {
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s ease;
        }

        .ant-input:hover, .ant-input-number:hover, .ant-select-selector:hover, .ant-picker:hover {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
        }

        .ant-input:focus, .ant-input-number-focused, .ant-select-focused .ant-select-selector, .ant-picker-focused {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
        }

        .ant-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(124, 58, 237, 0.3);
        }

        .ant-form-item-required::before {
          color: #ef4444;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default DeclareHealthProfile;



