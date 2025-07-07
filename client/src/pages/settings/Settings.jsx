import React, { useEffect, useState } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Space, 
  message, 
  Typography, 
  Row, 
  Col, 
  Tabs,
  Upload
} from "antd";
import { 
  SettingOutlined, 
  HomeOutlined, 
  GlobalOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { updateSchoolInfo, getSchoolInfo } from "../../api/Schoolinfo";

const { Title, Text } = Typography;

function Settings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const res = await getSchoolInfo();
        console.log('Full response from getSchoolInfo:', res);
        
        // API trả về object chứa thông tin trường
        const info = res.data;
        if (!info) {
          message.info("Chưa có thông tin trường học, vui lòng nhập thông tin mới!");
          return;
        }

        console.log("School info from API:", info);

        // Map đúng tên field từ API response (sử dụng field names thực tế)
        form.setFieldsValue({
          schoolName: info.name || info.Name || info.schoolName || "",
          address: info.address || info.Address || "",
          phone: info.hotline || info.Hotline || info.phone || "",
          email: info.email || info.Email || "",
        });
      } catch (err) {
        console.error("Error fetching school info:", err);
        if (err.response?.status === 404) {
          message.info("API endpoint chưa có, vui lòng nhập thông tin trường học!");
        } else {
          message.info("Chưa có thông tin trường học, vui lòng nhập thông tin mới!");
        }
      }
    };
    fetchSchoolInfo();
  }, [form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      console.log('Form values:', values);
      
      // Create a simple default file if no logo is selected
      let logoFileToSend = logoFile;
      if (!logoFileToSend) {
        // Create a simple image file as default instead of text file
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Default Logo', 50, 50);
        
        // Convert canvas to blob and create file
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        logoFileToSend = new File([blob], 'default-logo.png', { type: 'image/png' });
      }
      
      // Payload với field names đúng theo backend yêu cầu
      const payload = {
        SchoolID: "S001",
        Name: values.schoolName || "",
        Address: values.address || "",
        Hotline: values.phone || "",
        Email: values.email || "",
        Logo: logoFileToSend,     // Backend expects both fields
        LogoGifs: logoFileToSend  // Same file for both fields
      };

      console.log("Payload gửi lên backend:", payload);

      const response = await updateSchoolInfo(payload);
      console.log("Update response:", response);
      
      message.success("Cập nhật thông tin trường thành công!");

      // Reload lại thông tin sau khi update với field names đúng
      try {
        const res = await getSchoolInfo();
        const info = res.data;
        if (info) {
          form.setFieldsValue({
            schoolName: info.name || info.Name || info.schoolName || "",
            address: info.address || info.Address || "",
            phone: info.hotline || info.Hotline || info.phone || "",
            email: info.email || info.Email || "",
          });
        }
      } catch (fetchErr) {
        console.warn("Không thể reload thông tin sau khi update:", fetchErr);
      }
      
    } catch (err) {
      console.error("Update error:", err);
      console.error("Error response:", err.response);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      
      if (err.response?.data) {
        console.error("Server error details:", JSON.stringify(err.response.data, null, 2));
      }
      
      let errorMessage = "Cập nhật thất bại!";
      if (err.response?.data?.title && err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        errorMessage = `${err.response.data.title}: ${errors.join(', ')}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại!";
      } else if (err.response?.status === 500) {
        errorMessage = "Lỗi server, vui lòng thử lại sau!";
      }
      
      message.error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (info) => {
    if (info.file.status === 'done' || info.file.originFileObj) {
      setLogoFile(info.file.originFileObj || info.file);
      message.success(`${info.file.name} đã được chọn thành công`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} upload thất bại.`);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <HomeOutlined />
          Thông tin trường
        </span>
      ),
      children: (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HomeOutlined style={{ color: '#667eea' }} />
              <span>Thông tin trường học</span>
            </div>
          }
          style={{ borderRadius: '16px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên trường"
                  name="schoolName"
                  rules={[{ required: true, message: "Vui lòng nhập tên trường" }]}
                >
                  <Input size="large" placeholder="Nhập tên trường học" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input size="large" placeholder="Nhập email trường" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                >
                  <Input size="large" placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Địa chỉ"
                  name="address"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <Input size="large" placeholder="Nhập địa chỉ trường" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Logo trường">
                  <Upload
                    name="logo"
                    listType="picture"
                    maxCount={1}
                    beforeUpload={() => false} // Không upload tự động
                    onChange={handleLogoUpload}
                  >
                    <Button icon={<UploadOutlined />} size="large">
                      Chọn Logo (không bắt buộc)
                    </Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={loading}
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  Lưu thay đổi
                </Button>
                <Button size="large" onClick={() => form.resetFields()}>
                  Đặt lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: '2',
      label: (
        <span>
          <GlobalOutlined />
          Giao diện
        </span>
      ),
      children: (
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GlobalOutlined style={{ color: '#667eea' }} />
              <span>Cài đặt giao diện</span>
            </div>
          }
          style={{ borderRadius: '16px' }}
        >
          <Form
            layout="vertical"
            initialValues={{
              language: "vi",
              theme: "light",
              dateFormat: "DD/MM/YYYY",
              timeFormat: "24h"
            }}
            onFinish={(values) => {
              console.log("Interface settings:", values);
              message.success("Đã lưu cài đặt giao diện!");
            }}
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Ngôn ngữ" name="language">
                  <Select size="large">
                    <Select.Option value="vi">🇻🇳 Tiếng Việt</Select.Option>
                    <Select.Option value="en">🇺🇸 English</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Giao diện" name="theme">
                  <Select size="large">
                    <Select.Option value="light">☀️ Sáng</Select.Option>
                    <Select.Option value="dark">🌙 Tối</Select.Option>
                    <Select.Option value="auto">🔄 Tự động</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="Định dạng ngày" name="dateFormat">
                  <Select size="large">
                    <Select.Option value="DD/MM/YYYY">DD/MM/YYYY</Select.Option>
                    <Select.Option value="MM/DD/YYYY">MM/DD/YYYY</Select.Option>
                    <Select.Option value="YYYY-MM-DD">YYYY-MM-DD</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Định dạng thời gian" name="timeFormat">
                  <Select size="large">
                    <Select.Option value="24h">24 giờ</Select.Option>
                    <Select.Option value="12h">12 giờ (AM/PM)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                Áp dụng
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ];

  return (
    <div className="p-0 sm:p-8 bg-gradient-to-br from-blue-200 via-white to-blue-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header tinh tế hơn */}
        <div className="mb-14 flex items-center gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-700 rounded-full p-7 shadow-2xl flex items-center justify-center border-4 border-white animate-fade-in">
              <SettingOutlined className="text-white text-5xl drop-shadow-xl" />
            </div>
            <span className="absolute -bottom-3 -right-3 bg-white rounded-full px-3 py-1 text-xs text-blue-700 font-bold shadow border border-blue-100 select-none tracking-wide" style={{letterSpacing: 1}}>SETTINGS</span>
          </div>
          <div className="flex flex-col gap-1">
            <Title level={2} className="text-blue-900 mb-0 font-black tracking-widest drop-shadow-xl leading-tight" style={{letterSpacing: 2}}>Cài Đặt Hệ Thống</Title>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse shadow"></span>
              <Text type="secondary" className="text-lg font-medium text-gray-600 italic tracking-wide">Quản lý thông tin trường học và cấu hình giao diện</Text>
            </div>
          </div>
        </div>

        <Card className="rounded-3xl shadow-2xl border-blue-200 bg-white/95">
          <Tabs 
            defaultActiveKey="1" 
            type="card" 
            size="large" 
            items={tabItems.map(item => ({
              ...item,
              children: (
                <div className="p-6">
                  {React.cloneElement(item.children, {
                    style: { 
                      borderRadius: '24px',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
                      background: 'linear-gradient(135deg, #f8faff 0%, #f1f5ff 100%)'
                    }
                  })}
                </div>
              )
            }))}
            className="rounded-2xl"
            tabBarStyle={{
              background: 'linear-gradient(135deg, #e0eaff 0%, #f0f6ff 100%)',
              borderRadius: '16px 16px 0 0',
              margin: 0,
              padding: '8px 16px 0'
            }}
          />
        </Card>
      </div>
    </div>
  );
}

export default Settings;

