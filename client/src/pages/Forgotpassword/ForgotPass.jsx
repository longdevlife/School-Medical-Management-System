

import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";


const ForgotPass = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ usernameOrEmail: values.usernameOrEmail });
      message.success("Nếu tài khoản tồn tại, liên kết đặt lại mật khẩu đã được gửi đến email của bạn.");
    } catch (error) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-indigo-100 p-4">
      <Card
        style={{ maxWidth: 400, width: "100%", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        bodyStyle={{ padding: 32 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
            <MailOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Quên mật khẩu?</h2>
          <p className="text-gray-500">Nhập tên đăng nhập hoặc email để nhận liên kết đặt lại mật khẩu.</p>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="usernameOrEmail"
            label="Tên đăng nhập hoặc Email"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập hoặc email!" }]}
          >
            <Input
              size="large"
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Nhập tên đăng nhập hoặc email"
              autoFocus
              className="rounded-xl"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="gradient-button h-12 rounded-xl font-semibold border-none shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 text-lg relative overflow-hidden group"
            >
              {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
            </Button>
          </Form.Item>
          <div className="text-center mt-4">
            <Button type="link" onClick={() => navigate("/login")}>Quay lại đăng nhập</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPass;
