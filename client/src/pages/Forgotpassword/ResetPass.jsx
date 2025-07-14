import React, { useState } from "react";
import { Card, Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/authApi";

const ResetPass = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const onFinish = async (values) => {
    if (!token) {
      message.error("Liên kết không hợp lệ hoặc đã hết hạn.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword });
      message.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      setTimeout(() => navigate("/login"), 1500);
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
            <LockOutlined style={{ fontSize: 32, color: "#fff" }} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Đặt lại mật khẩu</h2>
          <p className="text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự." },
            ]}
            hasFeedback
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu mới"
              className="rounded-xl"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Xác nhận mật khẩu mới"
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
              {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
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

export default ResetPass;
