import React from 'react';
import { Card, Form, Input, Button, Select, Switch, Divider, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Option } = Select;

function Settings() {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    message.success('Cài đặt đã được lưu thành công!');
  };

  return (
    <div>
      <h1>Cài đặt hệ thống</h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            schoolName: 'Trường Tiểu học ABC',
            address: '123 Đường XYZ, Quận 1, TP.HCM',
            phone: '02812345678',
            email: 'contact@school.edu.vn',
            language: 'vi',
            theme: 'light',
            notifications: true,
            autoBackup: true
          }}
        >
          <h2>Thông tin trường học</h2>
          <Form.Item
            name="schoolName"
            label="Tên trường"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Divider />

          <h2>Cài đặt hệ thống</h2>
          <Form.Item
            name="language"
            label="Ngôn ngữ"
            rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
          >
            <Select>
              <Option value="vi">Tiếng Việt</Option>
              <Option value="en">English</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="theme"
            label="Giao diện"
            rules={[{ required: true, message: 'Vui lòng chọn giao diện' }]}
          >
            <Select>
              <Option value="light">Sáng</Option>
              <Option value="dark">Tối</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notifications"
            label="Thông báo"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="autoBackup"
            label="Tự động sao lưu"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu cài đặt
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Settings; 