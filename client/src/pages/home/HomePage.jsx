import React, { useState, useEffect } from "react";
import {
  Layout,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from "@ant-design/icons";

import AppHeader from "../../components/Layout/Header";
import { getSchoolInfo } from "../../api/Schoolinfo";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState(null);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsHeaderSticky(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const response = await getSchoolInfo();
        const info = response.data;
        if (info && Object.keys(info).length > 0) {
          setSchoolInfo(info);
        } else {
          // Fallback data
          setSchoolInfo({
            Name: "Y Tế Học Đường",
            Address: "123 Đường ABC, Quận 1, TP.HCM",
            Hotline: "1800 6688",
            Email: "info@ytehocduong.edu.vn"
          });
        }
      } catch (error) {
        console.error('Error fetching school info:', error);
        // Fallback data nếu API lỗi
        setSchoolInfo({
          Name: "Y Tế Học Đường",
          Address: "123 Đường ABC, Quận 1, TP.HCM",
          Hotline: "1800 6688",
          Email: "info@ytehocduong.edu.vn"
        });
      }
    };

    fetchSchoolInfo();
  }, []);

  const customStyles = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 8s linear infinite;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
      50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
    }
    
    .animate-fadeInUp {
      animation: fadeInUp 0.8s ease-out forwards;
    }
    
    .animate-fadeInLeft {
      animation: fadeInLeft 0.8s ease-out forwards;
    }
    
    .animate-fadeInRight {
      animation: fadeInRight 0.8s ease-out forwards;
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    .animate-glow {
      animation: glow 2s ease-in-out infinite;
    }
    
    /* Remove any default spacing from header */
    .ant-layout-header {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Sticky header styles with glass morphism */
    .sticky-header {
      position: fixed !important;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-bottom: 1px solid rgba(59, 130, 246, 0.15);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateY(0);
    }
    
    /* Enhance the header content when sticky */
    .sticky-header .ant-layout-header {
      background: transparent !important;
      border-bottom: none !important;
    }
    
    /* Add smooth padding adjustment */
    .sticky-header > div {
      padding: 8px 0;
      transition: padding 0.3s ease;
    }
    
    /* Optional: Add glow effect */
    .sticky-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
    }
  `;

  const services = [
    {
      title: "Chuyên gia kinh nghiệm",
      description:
        "Chuyên gia với dày dạn kinh nghiệm trong lĩnh vực y tế học đường",
      icon: <UserOutlined className="text-4xl text-blue-500" />,
    },
    {
      title: "Lên lịch tư vấn sức khỏe",
      description: "Dễ dàng lên lịch tư vấn sức khỏe cho trẻ",
      icon: <CalendarOutlined className="text-4xl text-green-500" />,
    },
    {
      title: "Chăm sóc sức khỏe toàn diện",
      description: "Cung cấp dịch vụ chăm sóc sức khỏe toàn diện cho học sinh",
      icon: <HeartOutlined className="text-4xl text-blue-500" />,
    },
  ];
  return (
    <>
      <style>{customStyles}</style>
      <Layout className="min-h-screen">
        <Content
          className={`p-0 ${isHeaderSticky ? "pt-16" : ""
            } transition-all duration-300`}
        >
          {" "}
          {/* Section 1 */}
          <div className="relative h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30 flex flex-col overflow-hidden">
            {" "}
            {/* Integrated Header */}
            <div
              className={`relative z-30 w-full flex-shrink-0 transition-all duration-300 ${isHeaderSticky ? "sticky-header" : ""
                }`}
            >
              <div className="w-full">
                <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
              </div>
            </div>{" "}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
              <div
                className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 animate-pulse"
                style={{ animationDelay: "2.5s" }}
              ></div>
              <div
                className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "3s" }}
              ></div>

              {/* Grid pattern overlay with fade-in */}
              <div
                className="absolute inset-0 opacity-5 animate-fadeInUp"
                style={{ animationDelay: "0.5s" }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                  }}
                ></div>
              </div>

              {/* Additional geometric shapes with improved spacing */}
              <div
                className="absolute top-1/4 left-10 w-2 h-20 bg-gradient-to-b from-blue-300 to-transparent rounded-full opacity-30 animate-fadeInLeft"
                style={{ animationDelay: "1.5s" }}
              ></div>
              <div
                className="absolute bottom-1/4 right-10 w-2 h-16 bg-gradient-to-t from-blue-400 to-transparent rounded-full opacity-25 animate-fadeInRight"
                style={{ animationDelay: "1.8s" }}
              ></div>

              {/* Floating geometric elements with enhanced animations */}
              <div className="absolute top-32 left-1/4 w-6 h-6 border-2 border-blue-300 rounded rotate-45 opacity-20 animate-spin-slow"></div>
              <div
                className="absolute bottom-40 right-1/4 w-4 h-4 bg-blue-200 rotate-12 opacity-30 animate-float"
                style={{ animationDelay: "2.2s" }}
              ></div>
            </div>{" "}
            <div className="flex-1 w-full relative z-10 flex items-center">
              <Row gutter={[48, 32]} align="middle" className="w-full h-full">
                {/* Left Content */}
                <Col xs={24} lg={12} className="h-full">
                  <div className="h-full flex items-center justify-center px-8 lg:px-16">
                    <div className="space-y-8 max-w-xl animate-fadeInLeft">
                      <div className="mb-6">
                        <span className="text-blue-500 text-lg font-semibold bg-blue-200/80 px-6 py-3 rounded-full backdrop-blur-sm shadow-lg animate-fadeInUp border border-blue-300/30">
                          Y tế học đường chuyên nghiệp
                        </span>
                      </div>
                      <h1
                        className="text-5xl xl:text-6xl font-bold text-gray-900 leading-tight animate-fadeInUp"
                        style={{ animationDelay: "0.2s" }}
                      >
                        Chăm sóc y tế học đường{" "}
                        <span className="text-blue-600 relative">
                          chuẩn bị cho tương lai
                        </span>{" "}
                        của con bạn.
                      </h1>
                      <p
                        className="text-xl text-gray-600 leading-relaxed animate-fadeInUp"
                        style={{ animationDelay: "0.4s" }}
                      >
                        Bắt đầu, theo dõi, hoặc nâng cao sức khỏe con bạn với
                        hơn 50 dịch vụ y tế chuyên nghiệp, chứng chỉ sức khỏe,
                        và chương trình từ các bệnh viện và phòng khám hàng đầu.
                      </p>
                      <div
                        className="pt-4 animate-fadeInUp"
                        style={{ animationDelay: "0.6s" }}
                      >
                        <Button
                          type="primary"
                          size="large"
                          className="h-16 px-10 text-lg font-medium rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-xl transform hover:scale-105 transition-all duration-300 animate-glow"
                        >
                          Khám phá dịch vụ
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>{" "}
                {/* Right Content with Doctor */}
                <Col xs={24} lg={12} className="h-full">
                  <div className="relative h-full flex items-center justify-center px-8 lg:px-16">
                    {/* Enhanced Background circles with better spacing */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-15 animate-pulse"></div>
                      <div className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-10"></div>
                    </div>
                    {/* Doctor Image with improved animation */}
                    <div className="relative z-10 transform hover:scale-105 transition-transform duration-700 animate-fadeInRight animate-float">
                      <img
                        src="/anhBacsi.png"
                        alt="Bác sĩ chuyên nghiệp"
                        className="w-full max-w-max mx-auto object-contain drop-shadow-2xl"
                      />
                    </div>
                    {/* Students Count Card with improved spacing and animation */}
                    <div
                      className="absolute top-12 left-4 lg:top-20 lg:left-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 z-20 transform hover:scale-105 transition-all duration-500 border border-blue-100/50 animate-fadeInUp"
                      style={{ animationDelay: "0.8s" }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <UserOutlined className="text-white text-2xl" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-gray-900 mb-1">
                            5000+
                          </div>
                          <div className="text-gray-600 text-sm font-medium">
                            Học sinh được chăm sóc
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Quality Assurance Card with improved spacing and animation */}
                    <div
                      className="absolute bottom-12 right-4 lg:bottom-20 lg:right-8 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 z-20 transform hover:scale-105 transition-all duration-500 border border-blue-100/50 animate-fadeInUp"
                      style={{ animationDelay: "1s" }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">
                              ✓
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            Tỷ lệ hài lòng 98%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold">
                              ✓
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            Y tá chuyên nghiệp
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Enhanced Decorative Elements with better spacing */}
                    <div className="absolute bottom-16 left-8 lg:bottom-24 lg:left-16 grid grid-cols-4 gap-3 opacity-60">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 150}ms` }}
                        ></div>
                      ))}
                    </div>
                    {/* Enhanced Floating elements with improved animation timing */}
                    <div
                      className="absolute top-20 right-12 lg:top-32 lg:right-20 w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: "1.2s" }}
                    ></div>
                    <div
                      className="absolute bottom-20 left-12 lg:bottom-32 lg:left-20 w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "1.5s" }}
                    ></div>
                    <div
                      className="absolute top-1/2 right-6 w-3 h-3 bg-blue-300 rounded-full animate-ping"
                      style={{ animationDelay: "1.8s" }}
                    ></div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          {/* Section 2 */}
          <div className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
              {/* Section Title */}
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-blue-600 mb-4">
                  Thành tựu của chúng tôi
                </h2>
                <p className="text-2xl font-bold text-black max-w-2xl mx-auto">
                  Những con số ấn tượng thể hiện cam kết và chất lượng dịch vụ
                  chăm sóc sức khỏe học đường
                </p>
              </div>

              <Row gutter={[32, 32]} justify="center">
                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 h-full flex flex-col">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-2xl">👥</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <Statistic
                        title={
                          <span className="text-blue-800 font-semibold text-lg">
                            Học sinh được chăm sóc
                          </span>
                        }
                        value={5000}
                        suffix="+"
                        valueStyle={{
                          color: "#1e40af",
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                        }}
                      />
                      <p className="text-blue-600 text-sm mt-3 leading-relaxed">
                        Học sinh trên toàn quốc đã được chăm sóc sức khỏe chuyên
                        nghiệp
                      </p>
                    </div>
                  </Card>
                </Col>

                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 h-full flex flex-col">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-2xl">👩‍⚕️</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <Statistic
                        title={
                          <span className="text-blue-800 font-semibold text-lg">
                            Y tá chuyên nghiệp
                          </span>
                        }
                        value={50}
                        suffix="+"
                        valueStyle={{
                          color: "#1e40af",
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                        }}
                      />
                      <p className="text-blue-600 text-sm mt-3 leading-relaxed">
                        Đội ngũ y tá được đào tạo bài bản, có chứng chỉ hành
                        nghề
                      </p>
                    </div>
                  </Card>
                </Col>

                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 h-full flex flex-col">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-2xl">🏫</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <Statistic
                        title={
                          <span className="text-blue-800 font-semibold text-lg">
                            Trường học hợp tác
                          </span>
                        }
                        value={100}
                        suffix="+"
                        valueStyle={{
                          color: "#1e40af",
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                        }}
                      />
                      <p className="text-blue-600 text-sm mt-3 leading-relaxed">
                        Trường học tin tưởng và sử dụng hệ thống quản lý y tế
                      </p>
                    </div>
                  </Card>
                </Col>

                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-blue-100 h-full flex flex-col">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-2xl">⭐</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <Statistic
                        title={
                          <span className="text-blue-800 font-semibold text-lg">
                            Năm kinh nghiệm
                          </span>
                        }
                        value={15}
                        suffix="+"
                        valueStyle={{
                          color: "#1e40af",
                          fontSize: "2.5rem",
                          fontWeight: "bold",
                        }}
                      />
                      <p className="text-blue-600 text-sm mt-3 leading-relaxed">
                        Kinh nghiệm trong lĩnh vực chăm sóc sức khỏe học đường
                      </p>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
          {/* Services Section */}
          <div
            className="py-20 relative overflow-hidden"
            style={{ backgroundColor: "#EEF5FF" }}
          >
            {/* Decorative elements from banner */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Top right decorative circle */}
              <div
                className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-40 animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>

              {/* Bottom left decorative circle */}
              <div
                className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 animate-pulse"
                style={{ animationDelay: "2.5s" }}
              ></div>

              {/* Middle right decorative circle */}
              <div
                className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-50 animate-pulse"
                style={{ animationDelay: "3s" }}
              ></div>

              {/* Floating geometric elements */}
              <div className="absolute top-32 left-1/4 w-6 h-6 border-2 border-blue-300 rounded rotate-45 opacity-20 animate-spin-slow"></div>
              <div
                className="absolute bottom-40 right-1/4 w-4 h-4 bg-blue-200 rotate-12 opacity-30 animate-float"
                style={{ animationDelay: "2.2s" }}
              ></div>

              {/* Additional decorative dots */}
              <div
                className="absolute top-40 left-20 w-3 h-3 bg-blue-300 rounded-full animate-ping"
                style={{ animationDelay: "2.8s" }}
              ></div>
              <div
                className="absolute bottom-60 right-32 w-3 h-3 bg-blue-400 rounded-full animate-ping"
                style={{ animationDelay: "3.2s" }}
              ></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-blue-600 mb-4">
                  Y tế chuyên sâu
                </h2>
                <p className="text-4xl font-bold text-black max-w-2xl mx-auto">
                  Tư vấn lịch khám phù hợp với trẻ
                </p>
              </div>
              <Row gutter={[48, 48]} align="middle">
                {/* Left Side - Doctor Image */}
                <Col xs={24} lg={12}>
                  <div className="relative flex items-center justify-center">
                    {/* Background decorative circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="w-80 h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-20 animate-pulse"
                        style={{ animationDelay: "2s" }}
                      ></div>
                      <div
                        className="absolute w-64 h-64 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-15 animate-pulse"
                        style={{ animationDelay: "2.5s" }}
                      ></div>
                    </div>

                    {/* Doctor Image */}
                    <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                      <img
                        src="/doctor1.png"
                        alt="Bác sĩ chuyên nghiệp"
                        className="w-full max-w-sm mx-auto object-contain drop-shadow-2xl"
                      />
                    </div>

                    {/* Floating service tags */}
                    <div className="absolute top-12 left-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 z-20 animate-float">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">👁</span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          Chăm sóc
                        </span>
                      </div>
                    </div>

                    <div
                      className="absolute top-32 right-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 z-20 animate-float"
                      style={{ animationDelay: "0.5s" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-gray-200 shadow-sm">
                          <span className="text-red-500 text-sm">❤</span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          Tim mạch
                        </span>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-15 right-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 z-20 animate-float"
                      style={{ animationDelay: "0.75s" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">📅</span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          Lịch khám
                        </span>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-20 left-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 z-20 animate-float"
                      style={{ animationDelay: "1s" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🦷</span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          Nha khoa
                        </span>
                      </div>
                    </div>

                    <div
                      className="absolute bottom-32 right-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 z-20 animate-float"
                      style={{ animationDelay: "1.5s" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">🏥</span>
                        </div>
                        <span className="text-gray-700 font-medium">Y tế</span>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Side - 3 Services vertically */}
                <Col xs={24} lg={12}>
                  <div className="space-y-6">
                    {services.map((service, index) => (
                      <Card
                        key={index}
                        className="border-0 shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex items-start space-x-6 p-6">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                              {service.icon}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-3 text-blue-600">
                              {service.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          {/* Health Package Section */}
          <div className="relative py-20 bg-white overflow-hidden">
  <div className="max-w-6xl mx-auto px-6 relative z-10">
    <Row gutter={[48, 48]} align="middle" className="min-h-[600px]">
      {/* Left Content - Medical Package Info */}
      <Col xs={24} lg={12} className="h-full">
        <div className="h-full flex items-center justify-center">
          <div className="space-y-8 max-w-xl animate-fadeInLeft">
            {/* Section Badge */}
            <div className="mb-6">
              <span className="text-blue-500 text-lg font-semibold bg-blue-50 px-6 py-3 rounded-full shadow-sm animate-fadeInUp border border-blue-100">
                ✨ Gói chăm sóc toàn diện
              </span>
            </div>

            {/* Main Title */}
            <h2 
              className="text-5xl xl:text-6xl font-bold text-gray-900 leading-tight animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              Chăm Sóc Sức Khỏe Với{" "}
              <span className="text-blue-600 relative">
                Gói Y Tế Học Đường
              </span>
            </h2>

            {/* Description */}
            <p 
              className="text-xl text-gray-600 leading-relaxed animate-fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              Chúng tôi cung cấp các gói chăm sóc sức khỏe toàn diện cho
              học sinh, bao gồm khám định kỳ, theo dõi phát triển và hỗ
              trợ y tế khẩn cấp.
            </p>

            {/* Feature List */}
            <div 
              className="space-y-4 animate-fadeInUp"
              style={{ animationDelay: "0.6s" }}
            >
              {[
                "Khám sức khỏe định kỳ hàng tháng",
                "Theo dõi phát triển thể chất",
                "Hỗ trợ y tế 24/7",
                "Tư vấn dinh dưỡng chuyên nghiệp"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="text-gray-700 text-lg">{item}</span>
                </div>
              ))}
            </div>

          
          </div>
        </div>
      </Col>

      {/* Right Content - Medical Icon with Floating Cards */}
      <Col xs={24} lg={12} className="h-full">
        <div className="relative h-full flex items-center justify-center">
          {/* Background circles - subtle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-30"></div>
            <div className="absolute w-96 h-96 bg-blue-50 rounded-full opacity-20"></div>
          </div>

          {/* Central Medical Icon */}
          <div className="relative z-10 transform hover:scale-105 transition-transform duration-700 animate-fadeInRight animate-float">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-xl">
              <MedicineBoxOutlined className="text-8xl text-blue-600" />
            </div>
          </div>

          {/* Floating Cards - Clean version */}
          <div
            className="absolute top-12 left-2 bg-white rounded-3xl shadow-xl p-6 z-20 transform hover:scale-105 transition-all duration-500 border border-gray-100 animate-fadeInUp"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">⭐</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-gray-600 text-sm font-medium">
                  Đánh giá dịch vụ
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute top-60 right-24 bg-white rounded-3xl shadow-xl p-6 z-20 transform hover:scale-105 transition-all duration-500 border border-gray-100 animate-fadeInUp"
            style={{ animationDelay: "1s" }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">✓</span>
              </div>
              <div>
                <div className="text-gray-700 text-sm font-medium">
                  Chứng nhận chất lượng
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-12 left-72 bg-white 
            rounded-3xl shadow-xl p-6 z-20 transform 
            hover:scale-105 transition-all duration-500 
            border border-gray-100 animate-fadeInUp"
            style={{ animationDelay: "1.2s" }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl 
              flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">🏥</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-gray-600 text-sm font-medium">
                  Hỗ trợ y tế
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-64 right-16 bg-white rounded-3xl 
            shadow-xl p-6 z-20 transform hover:scale-105 transition-all 
            duration-500 border border-gray-100 animate-fadeInUp"
            style={{ animationDelay: "1.4s" }}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-2xl 
              flex items-center justify-center shadow-lg">
                <span className="text-white text-xl">👩‍⚕️</span>
              </div>
              <div>
                <div className="text-gray-700 text-sm font-medium">
                  Đội ngũ chuyên nghiệp
                </div>
              </div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  </div>
</div>
        </Content>
        {/* Footer */}
        <Footer
          className="bg-gray-900 text-white p-0"
          style={{ backgroundColor: "#3B82F6" }}
        >
          <div className="py-16">
            <div className="max-w-6xl mx-auto px-6">
              <Row gutter={[48, 32]}>
                <Col xs={24} sm={12} lg={6}>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white mb-6">
                      DỊCH VỤ
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Khám sức khỏe
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Chăm sóc y tế
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Dinh dưỡng học đường
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          An toàn trường học
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Tư vấn sức khỏe
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Dịch vụ khẩn cấp
                        </a>
                      </li>
                    </ul>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white mb-6">
                      VỀ CHÚNG TÔI
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Giới thiệu
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Đội ngũ y tế
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Cơ sở vật chất
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Chứng nhận
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Tin tức & Sự kiện
                        </a>
                      </li>
                    </ul>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white mb-6">
                      HỖ TRỢ
                    </h4>
                    <ul className="space-y-3">
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Hướng dẫn sử dụng
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Câu hỏi thường gặp
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Chính sách bảo mật
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Điều khoản sử dụng
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-white hover:text-blue-700 transition-colors"
                        >
                          Liên hệ hỗ trợ
                        </a>
                      </li>
                    </ul>
                  </div>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-white mb-6">
                      📞 LIÊN HỆ
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <EnvironmentOutlined className="text-white mt-1 flex-shrink-0" />
                        <span className="text-white break-words">
                          {schoolInfo?.Address || schoolInfo?.address || "123 Đường ABC, Quận 1, TP.HCM"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <PhoneOutlined className="text-white" />
                        <a href={`tel:${schoolInfo?.Hotline || schoolInfo?.hotline || "1800 6688"}`} className="text-white hover:text-blue-200 transition-colors">
                          {schoolInfo?.Hotline || schoolInfo?.hotline || "1800 6688"}
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MailOutlined className="text-white" />
                        <a href={`mailto:${schoolInfo?.Email || schoolInfo?.email || "info@ytehocduong.edu.vn"}`} className="text-white hover:text-blue-200 transition-colors break-all">
                          {schoolInfo?.Email || schoolInfo?.email || "info@ytehocduong.edu.vn"}
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <GlobalOutlined className="text-white" />
                        <a href="https://www.ytehocduong.edu.vn" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
                          www.ytehocduong.edu.vn
                        </a>
                      </div>
                      <div className="flex space-x-4 mt-6">
                        <FacebookOutlined className="text-2xl text-white hover:text-blue-200 cursor-pointer transition-colors" />
                        <TwitterOutlined className="text-2xl text-white hover:text-blue-200 cursor-pointer transition-colors" />
                        <InstagramOutlined className="text-2xl text-white hover:text-blue-200 cursor-pointer transition-colors" />
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className="border-t text-white py-6">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <span className="text-white">
                  © 2024 {schoolInfo?.Name || schoolInfo?.name || "Y Tế Học Đường"}. Tất cả quyền được bảo lưu.
                </span>
                <div className="flex space-x-6">
                  <a
                    href="#"
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    Điều khoản
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    Bảo mật
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    Liên hệ
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Footer>
      </Layout>
    </>
  );
};

export default HomePage;
