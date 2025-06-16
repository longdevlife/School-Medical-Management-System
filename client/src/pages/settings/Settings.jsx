import React from "react";
import { Card, Form, Input, Button, Switch, Select, Space } from "antd";

function Settings() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Form values:", values);
  };

  return (
    <div>
      <h1>Cài đặt</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            notifications: true,
            language: "vi",
            theme: "light",
          }}
        >
          <Form.Item
            label="Tên trường"
            name="schoolName"
            rules={[{ required: true, message: "Vui lòng nhập tên trường" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Thông báo"
            name="notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Ngôn ngữ" name="language">
            <Select>
              <Select.Option value="vi">Tiếng Việt</Select.Option>
              <Select.Option value="en">English</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Giao diện" name="theme">
            <Select>
              <Select.Option value="light">Sáng</Select.Option>
              <Select.Option value="dark">Tối</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Lưu thay đổi
              </Button>
              <Button onClick={() => form.resetFields()}>Đặt lại</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Settings;
