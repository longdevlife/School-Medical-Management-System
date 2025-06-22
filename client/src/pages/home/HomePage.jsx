import React, { useState } from "react";
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
  HeartOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/Layout/Header";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsHeaderSticky(scrollY > 50); 
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const customStyles = `
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 8s linear infinite;
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
      title: "Khám sức khỏe định kỳ",
      description:
        "Theo dõi và đánh giá tình trạng sức khỏe học sinh thường xuyên",
      icon: <HeartOutlined className="text-4xl text-blue-500" />,
    },
    {
      title: "Chăm sóc y tế",
      description: "Hỗ trợ y tế khẩn cấp và chăm sóc sức khỏe hàng ngày",
      icon: <MedicineBoxOutlined className="text-4xl text-green-500" />,
    },
    {
      title: "An toàn học đường",
      description: "Đảm bảo môi trường học tập an toàn và lành mạnh",
      icon: <SafetyOutlined className="text-4xl text-orange-500" />,
    },
  ];
  return (
    <>
      <style>{customStyles}</style>
      <Layout className="min-h-screen">
        <Content
          className={`p-0 ${
            isHeaderSticky ? "pt-16" : ""
          } transition-all duration-300`}
        >
          {" "}
          {/* Integrated Header + Hero Section */}
          <div className="relative h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20 flex flex-col overflow-hidden">
            {" "}
            {/* Integrated Header - Remove spacing */}
            <div
              className={`relative z-30 w-full flex-shrink-0 transition-all duration-300 ${
                isHeaderSticky ? "sticky-header" : ""
              }`}
            >
              <div className="w-full">
                <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
              </div>
            </div>
            {/* Enhanced Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Large decorative circles */}
              <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-40 animate-pulse"></div>
              <div className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 animate-pulse delay-300"></div>
              <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-50 animate-pulse delay-500"></div>

              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)`,
                    backgroundSize: "40px 40px",
                  }}
                ></div>
              </div>

              {/* Additional geometric shapes */}
              <div className="absolute top-1/4 left-10 w-2 h-20 bg-gradient-to-b from-blue-300 to-transparent rounded-full opacity-30"></div>
              <div className="absolute bottom-1/4 right-10 w-2 h-16 bg-gradient-to-t from-blue-400 to-transparent rounded-full opacity-25"></div>

              {/* Floating geometric elements */}
              <div className="absolute top-32 left-1/4 w-6 h-6 border-2 border-blue-300 rounded rotate-45 opacity-20 animate-spin-slow"></div>
              <div className="absolute bottom-40 right-1/4 w-4 h-4 bg-blue-200 rotate-12 opacity-30"></div>
            </div>{" "}
            {/* Hero Content - Reduce top spacing */}
            <div className="flex-1 w-full relative z-10 flex items-center -mt-4">
              <Row gutter={0} align="middle" className="w-full h-full">
                {/* Left Content */}
                <Col xs={24} lg={12} className="h-full">
                  <div className="h-full flex items-center justify-center px-12">
                    <div className="space-y-8 max-w-xl">
                      <div className="mb-4">
                        <span className="text-blue-500 text-lg font-semibold bg-blue-50 px-4 py-2 rounded-full">
                          Y tế học đường chuyên nghiệp
                        </span>
                      </div>
                      <h1 className="text-6xl lg:text-5xl font-bold text-gray-900 leading-tight">
                        Chăm sóc y tế học đường{" "}
                        <span className="text-blue-600 relative">
                          chuẩn bị cho tương lai
                        </span>{" "}
                        của con bạn.
                      </h1>
                      <p className="text-xl text-gray-600 leading-relaxed">
                        Bắt đầu, theo dõi, hoặc nâng cao sức khỏe con bạn với
                        hơn 50 dịch vụ y tế chuyên nghiệp, chứng chỉ sức khỏe,
                        và chương trình từ các bệnh viện và phòng khám hàng đầu.
                      </p>
                      <Button
                        type="primary"
                        size="large"
                        className="h-14 px-8 text-lg font-medium rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Khám phá dịch vụ
                      </Button>
                    </div>
                  </div>
                </Col>{" "}
                {/* Right Content with Doctor */}
                <Col xs={24} lg={12} className="h-full">
                  <div className="relative h-full flex items-center justify-center px-12">
                    {/* Enhanced Background circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-15 animate-pulse"></div>
                      <div className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-10"></div>
                    </div>
                    {/* Doctor Image */}
                    <div className="relative z-10 transform hover:scale-105 transition-transform duration-500">
                      <img
                        src="/anhBacsi.png"
                        alt="Bác sĩ chuyên nghiệp"
                        className="w-full max-w-md mx-auto object-contain drop-shadow-lg"
                      />
                    </div>
                    {/* Enhanced Floating Cards */}
                    {/* Students Count Card */}
                    <div className="absolute top-16 left-6 bg-white rounded-2xl shadow-2xl p-5 z-20 transform hover:scale-105 transition-all duration-300 border border-blue-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <UserOutlined className="text-white text-xl" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            5000+
                          </div>
                          <div className="text-gray-600 text-sm font-medium">
                            Học sinh được chăm sóc
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Quality Assurance Card */}
                    <div className="absolute bottom-16 right-6 bg-white rounded-2xl shadow-2xl p-5 z-20 transform hover:scale-105 transition-all duration-300 border border-blue-50">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            Tỷ lệ hài lòng 98%
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              ✓
                            </span>
                          </div>
                          <span className="text-gray-700 text-sm font-medium">
                            Y tá chuyên nghiệp
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Enhanced Decorative Elements */}
                    <div className="absolute bottom-12 left-12 grid grid-cols-4 gap-2 opacity-60">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${i * 100}ms` }}
                        ></div>
                      ))}
                    </div>
                    {/* Enhanced Floating elements */}
                    <div className="absolute top-24 right-16 w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce"></div>
                    <div className="absolute bottom-24 left-16 w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bounce delay-300"></div>
                    <div className="absolute top-1/2 right-4 w-2 h-2 bg-blue-300 rounded-full animate-ping delay-500"></div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          {/* Statistics Section */}
          <div className="py-20 bg-blue-50">
            <div className="max-w-6xl mx-auto px-6">
              <Row gutter={[32, 32]} justify="center">
                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                    <Statistic
                      title={
                        <span className="text-gray-600 font-medium">
                          Học sinh được chăm sóc
                        </span>
                      }
                      value={5000}
                      suffix="+"
                      valueStyle={{
                        color: "#1890ff",
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                    <Statistic
                      title={
                        <span className="text-gray-600 font-medium">
                          Y tá chuyên nghiệp
                        </span>
                      }
                      value={50}
                      suffix="+"
                      valueStyle={{
                        color: "#52c41a",
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                    <Statistic
                      title={
                        <span className="text-gray-600 font-medium">
                          Trường học hợp tác
                        </span>
                      }
                      value={100}
                      suffix="+"
                      valueStyle={{
                        color: "#fa541c",
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </Col>
                <Col xs={12} sm={6}>
                  <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                    <Statistic
                      title={
                        <span className="text-gray-600 font-medium">
                          Năm kinh nghiệm
                        </span>
                      }
                      value={15}
                      suffix="+"
                      valueStyle={{
                        color: "#722ed1",
                        fontSize: "2rem",
                        fontWeight: "bold",
                      }}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
          {/* Services Section */}
          <div className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-blue-600 mb-4">
                  Dịch Vụ Y Tế Học Đường
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Chúng tôi cung cấp các dịch vụ y tế chuyên nghiệp và toàn diện
                  cho học sinh
                </p>
              </div>
              <Row gutter={[24, 24]}>
                {services.map((service, index) => (
                  <Col xs={24} md={8} key={index}>
                    <Card className="text-center h-full border-0 shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                      <div className="mb-6">{service.icon}</div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
          {/* Health Package Section */}
          <div className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-6">
              <Row gutter={[48, 48]} align="middle">
                <Col xs={24} lg={12}>
                  <div className="relative">
                    <div className="bg-blue-100 rounded-3xl p-8 text-center">
                      <div className="w-32 h-32 bg-blue-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <MedicineBoxOutlined className="text-5xl text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-600 mb-4">
                        Chăm sóc y tế chuyên nghiệp
                      </h3>
                      <p className="text-gray-600">
                        Đội ngũ y tá được đào tạo bài bản
                      </p>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="space-y-6">
                    <h2 className="text-4xl font-bold text-blue-600">
                      Chăm Sóc Sức Khỏe Với
                      <br />
                      Gói Y Tế Học Đường
                    </h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Chúng tôi cung cấp các gói chăm sóc sức khỏe toàn diện cho
                      học sinh, bao gồm khám định kỳ, theo dõi phát triển và hỗ
                      trợ y tế khẩn cấp.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">
                          Khám sức khỏe định kỳ hàng tháng
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">
                          Theo dõi phát triển thể chất
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">Hỗ trợ y tế 24/7</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">
                          Tư vấn dinh dưỡng chuyên nghiệp
                        </span>
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
          style={{ backgroundColor: "#37AEEF" }}
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
                      LIÊN HỆ
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <EnvironmentOutlined className="text-white" />
                        <span className="text-white">
                          123 Đường ABC, Quận 1, TP.HCM
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <PhoneOutlined className="text-white" />
                        <span className="text-white">1800 6688</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MailOutlined className="text-white" />
                        <span className="text-white">
                          info@ytehocduong.edu.vn
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <GlobalOutlined className="text-white" />
                        <span className="text-white">
                          www.ytehocduong.edu.vn
                        </span>
                      </div>
                      <div className="flex space-x-4 mt-6">
                        <FacebookOutlined className="text-2xl text-white hover:text-blue-700 cursor-pointer transition-colors" />
                        <TwitterOutlined className="text-2xl text-white hover:text-blue-700cursor-pointer transition-colors" />
                        <InstagramOutlined className="text-2xl text-white hover:text-blue-700 cursor-pointer transition-colors" />
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
                  © 2024 Y Tế Học Đường. Tất cả quyền được bảo lưu.
                </span>
                <div className="flex space-x-6">
                  <a
                    href="#"
                    className="text-white hover:text-white transition-colors"
                  >
                    Điều khoản
                  </a>
                  <a
                    href="#"
                    className="text-white hover:text-white transition-colors"
                  >
                    Bảo mật
                  </a>
                  <a
                    href="#"
                    className="text-white hover:ttext-white transition-colors"
                  >
                    Liên hệ
                  </a>
                </div>
              </div>
            </div>
          </div>{" "}
        </Footer>
      </Layout>
    </>
  );
};

export default HomePage;
