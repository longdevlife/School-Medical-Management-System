import React, { useEffect } from "react";
import { Card, Form, Input, Button, Switch, Select, Space, message } from "antd";
import { updateSchoolInfo, getSchoolInfo } from "../../api/Schoolinfo";

function Settings() {
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const res = await getSchoolInfo();
        const info = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!info) {
          message.error("Không có dữ liệu trường học!");
          return;
        }

        console.log("School info from API:", info);

        form.setFieldsValue({
          schoolName: info.schoolName || info.name || info.Name || "",
          address: info.address || info.Address || "",
          phone: info.phone || info.hotline || info.Hotline || "",
          email: info.email || info.Email || "",
        });
      } catch (err) {
        message.error("Không thể tải thông tin trường học!");
      }
    };
    fetchSchoolInfo();
  }, [form]);

  const onFinish = async (values) => {
    try {
      const payload = {
        SchoolID: "abc", // ID mặc định, đảm bảo backend xử lý được
        Name: values.schoolName,
        Address: values.address,
        Hotline: values.phone,
        Email: values.email,
        // Nếu bạn có xử lý upload Logo trong tương lai:
        // Logo: values.logo,
      };

      console.log("Payload gửi lên backend:", payload);

      await updateSchoolInfo(payload);
      message.success("Cập nhật thông tin trường thành công!");

      // Reload lại form
      const res = await getSchoolInfo();
      const info = Array.isArray(res.data) ? res.data[0] : res.data;
      form.setFieldsValue({
        schoolName: info.schoolName || info.name || info.Name || "",
        address: info.address || info.Address || "",
        phone: info.phone || info.hotline || info.Hotline || "",
        email: info.email || info.Email || "",
      });
    } catch (err) {
      console.error(err);
      message.error("Cập nhật thất bại!");
    }
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
