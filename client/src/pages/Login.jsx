import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await authService.login(
        values.username,
        values.password
      );
      const userRole = response.user.role;

      // Redirect based on role
      switch (userRole) {
        case "PARENT":
          navigate("/parent");
          break;
        case "NURSE":
          navigate("/nurses");
          break;
        case "MANAGER":
          navigate("/manager");
          break;
        default:
          message.error("Invalid role");
          break;
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-cyan-400 to-blue-500">
      <Card className="w-full max-w-md p-5 rounded-lg shadow-xl">
        <h1 className="text-center text-blue-500 mb-6 text-2xl font-semibold">
          School Medical System
        </h1>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          className="space-y-6"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
            className="mb-6"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
            className="mb-6"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="h-10 rounded-md font-medium"
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
