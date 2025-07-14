import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../services/authService";
// React Icons - Nguồn icons rõ ràng và dễ chỉnh sửa
import {
  MdLocalHospital, // Icon bệnh viện
  MdAssignment, // Icon hồ sơ y tế
  MdCheckCircle, // Icon tick
  MdHealthAndSafety, // Icon y tế an toàn
  MdEventNote, // Icon ghi chú sự kiện
  MdSecurity, // Icon bảo mật
} from "react-icons/md";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Google login success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      // Log complete response from Google
      console.log("=== Google OAuth Response ===");
      console.log("Full response:", credentialResponse);
      console.log("Client ID:", credentialResponse.clientId);
      console.log("Credential (idToken):", credentialResponse.credential);
      console.log("ID Token length:", credentialResponse.credential?.length);
      console.log(
        "ID Token starts with:",
        credentialResponse.credential?.substring(0, 20)
      );

      // Verify we have the idToken
      if (!credentialResponse.credential) {
        throw new Error("No credential (idToken) received from Google");
      }

      // Call backend API with Google idToken
      const response = await authService.googleLogin(
        credentialResponse.credential
      );
      console.log("Backend response:", response);

      message.success("Đăng nhập Google thành công!");
      navigate("/home");
    } catch (error) {
      console.error("Google login error:", error);
      message.error(
        "Đăng nhập Google thất bại: " + (error.message || "Lỗi không xác định")
      );
    } finally {
      setLoading(false);
    }
  };

  // Google login error handler
  const handleGoogleError = () => {
    console.error("Google login failed");
    message.error("Đăng nhập Google thất bại");
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await authService.login(
        values.username,
        values.password
      );
      console.log("Login response:", response);

      // Redirect to home page after login
      navigate("/home");
    } catch (error) {
      message.error(error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes rainbow {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 100% 50%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .gradient-button {
          background: linear-gradient(
            45deg,
            #3b82f6,
            #6366f1,
            #8b5cf6,
            #ec4899
          ) !important;
          background-size: 400% 400% !important;
          animation: gradientShift 3s ease infinite !important;
        }
        .gradient-button:hover {
          background: linear-gradient(
            45deg,
            #8b5cf6,
            #ec4899,
            #f59e0b,
            #10b981,
            #3b82f6
          ) !important;
          background-size: 500% 500% !important;
          animation: rainbow 2s ease infinite !important;
        }

        /* Override Chrome autofill ugly styles */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #374151 !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
        
        /* Custom autofill styling for our rounded inputs */
        .ant-input:-webkit-autofill {
          border-radius: 12px !important;
          border: 2px solid #e5e7eb !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
        }
        
        .ant-input:-webkit-autofill:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full animate-floatBubble"></div>
        <div
          className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full animate-floatBubble"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/4 right-1/4 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-full animate-floatBubble"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/5 w-24 h-24 bg-white/5 backdrop-blur-sm rounded-full animate-floatBubble"
          style={{ animationDelay: "3s" }}
        ></div>{" "}
        {/* Animated particles - Hiệu ứng hạt bay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 10}s`,
                width: `${1 + Math.random() * 2}px`,
                height: `${1 + Math.random() * 2}px`,
              }}
            ></div>
          ))}
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 bg-white/40 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                transform: `scale(${0.5 + Math.random() * 0.5})`,
              }}
            ></div>
          ))}
        </div>
        {/* Đốm sáng lấp lánh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div
              key={`light-spot-${i}`}
              className="absolute bg-gradient-to-r from-white/30 via-white/50 to-white/20 rounded-full blur-sm animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 8}px`,
                height: `${4 + Math.random() * 8}px`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>
        {/* Đốm sáng lớn hơn với hiệu ứng glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={`glow-spot-${i}`}
              className="absolute bg-white/20 rounded-full blur-md animate-bounce-slow"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${8 + Math.random() * 16}px`,
                height: `${8 + Math.random() * 16}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
                boxShadow: `0 0 ${
                  4 + Math.random() * 8
                }px rgba(255, 255, 255, 0.3)`,
              }}
            ></div>
          ))}
        </div>{" "}
        {/* Các phần tử trang trí y tế */}
        <div className="absolute top-20 right-[20%] w-10 h-10 bg-red-400/20 backdrop-blur-sm rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-[15%] w-16 h-16 border-2 border-white/20 backdrop-blur-sm rounded-full animate-spin-slow"></div>
        <div className="absolute top-[30%] left-[10%] w-8 h-8 bg-blue-300/20 backdrop-blur-sm rounded-full animate-bounce-slow"></div>
        <div
          className="absolute bottom-[20%] right-[25%] w-12 h-12 bg-green-400/20 backdrop-blur-sm rounded-full animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-[15%] right-[10%] w-14 h-14 border-2 border-indigo-300/10 backdrop-blur-sm rounded-full animate-bounce-slow"
          style={{ animationDelay: "2s" }}
        ></div>{" "}
        {/* Main container with 50-50 split */}
        <div className="w-full max-w-7xl flex flex-col lg:flex-row overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] relative z-10 min-h-[600px]">
          {/* Left side - Login Form */}
          <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white relative order-2 lg:order-1">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-blue-100 to-indigo-100"></div>

            <div className="max-w-md mx-auto w-full relative z-10">
              <div className="text-center mb-8 lg:mb-10">
                {" "}
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <MdLocalHospital className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 pb-1">
                  Đăng Nhập
                </h1>
                <p className="text-gray-600 text-base lg:text-lg">
                  Đăng nhập để truy cập website Y Tế Trường Học
                </p>{" "}
              </div>
              <Form
                name="login"
                onFinish={onFinish}
                autoComplete="off"
                layout="vertical"
                className="space-y-6"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                  ]}
                  className="mb-6"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Tên đăng nhập"
                    size="large"
                    autoComplete="off"
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 h-14 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                </Form.Item>{" "}
                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                  ]}
                  className="mb-8"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Mật khẩu"
                    size="large"
                    autoComplete="off"
                    className="rounded-xl border-2 border-gray-200 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 h-14 shadow-sm hover:shadow-md focus:shadow-lg"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="gradient-button h-14 rounded-xl font-semibold border-none shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transform hover:-translate-y-1 hover:scale-[1.02] transition-all duration-500 text-lg relative overflow-hidden group"
                  >
                    <span className="relative z-10">
                      {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
                    </span>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  </Button>
                </Form.Item>
                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-gray-500 text-sm">hoặc</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
                {/* Google Login Button */}
                <Form.Item>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="signin_with"
                    theme="outline"
                    size="large"
                    width="100%"
                    locale="vi"
                  />
                </Form.Item>
                <div className="text-center space-y-4">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium bg-transparent border-none p-0 cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                  Bằng cách nhấp vào tiếp tục, bạn đồng ý với{" "}
                  <a href="#">Điều khoản dịch vụ</a> and{" "}
                  <a href="#">Chính sách quyền riêng tư</a>.
                </div>{" "}
              </Form>
            </div>
          </div>
          {/* Right side - Illustration */}
          <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden order-1 lg:order-2 min-h-[300px] lg:min-h-auto">
            {/* Background decorative elements for right side */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div
              className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div className="absolute top-1/2 right-20 w-24 h-24 bg-white/8 rounded-full blur-xl animate-float"></div>{" "}
            {/* Floating medical icons */}
            <div className="absolute top-20 left-20 w-8 h-8 text-white/30 animate-bounce-slow hidden lg:block">
              <MdAssignment className="w-full h-full" />
            </div>
            <div
              className="absolute bottom-32 right-16 w-10 h-10 text-white/20 animate-float hidden lg:block"
              style={{ animationDelay: "2s" }}
            >
              <MdCheckCircle className="w-full h-full" />
            </div>
            <div className="relative z-10 text-center max-w-md">
              {" "}
              {/* Main illustration/icon */}{" "}
              <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto mb-6 lg:mb-8 bg-white/15 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl border border-white/20 transform hover:scale-105 transition-transform duration-300">
                <MdHealthAndSafety className="w-16 h-16 lg:w-20 lg:h-20 text-white" />
              </div>
              <h2 className="text-2xl text-gray-200 lg:text-4xl font-bold mb-4 leading-tight">
                Quản Lý Y Tế
                <br />
                <span className="text-blue-200">Trường Học</span>
              </h2>
              <p className="text-blue-100 mb-6 lg:mb-10 text-base lg:text-lg leading-relaxed opacity-90">
                Theo dõi sức khỏe toàn diện và quản lý y tế cho học sinh, phụ
                huynh và nhân viên y tế.
              </p>{" "}
              {/* Feature list */}
              <div className="space-y-3 lg:space-y-4 text-left">
                <div className="flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdCheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="text-blue-50 font-medium text-sm lg:text-base">
                    Quản Lý Hồ Sơ Sức Khỏe
                  </span>
                </div>

                <div className="flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdEventNote className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="text-blue-50 font-medium text-sm lg:text-base">
                    Theo Dõi Sự Kiện Y Tế
                  </span>
                </div>

                <div className="flex items-center space-x-3 lg:space-x-4 p-2 lg:p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MdSecurity className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="text-blue-50 font-medium text-sm lg:text-base">
                    Truy Cập An Toàn Cho Phụ Huynh
                  </span>
                </div>
              </div>{" "}
              {/* Bottom accent */}
              <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-white/20">
                <div className="text-blue-200 text-xs lg:text-sm font-medium">
                  Trường Tiểu Học FPT
                </div>
              </div>
            </div>{" "}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
