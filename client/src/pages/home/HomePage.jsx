import React from 'react';
import { Layout, Button, Row, Col, Card, Statistic, Typography, Space } from 'antd';
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
  InstagramOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/Layout/Header';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);

  const services = [
    {
      title: 'Khám sức khỏe định kỳ',
      description: 'Theo dõi và đánh giá tình trạng sức khỏe học sinh thường xuyên',
      icon: <HeartOutlined className="text-4xl text-blue-500" />
    },
    {
      title: 'Chăm sóc y tế',
      description: 'Hỗ trợ y tế khẩn cấp và chăm sóc sức khỏe hàng ngày',
      icon: <MedicineBoxOutlined className="text-4xl text-green-500" />
    },
    {
      title: 'An toàn học đường',
      description: 'Đảm bảo môi trường học tập an toàn và lành mạnh',
      icon: <SafetyOutlined className="text-4xl text-orange-500" />
    }
  ];

  return (
    <Layout className="min-h-screen">
      <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <Content className="p-0">
        {/* Hero Section */}
            <div className="relative h-screen overflow-hidden">
          {/* Left Side - Blue Gradient Content */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-start pl-24"
            style={{
              clipPath: 'polygon(0 0, 78% 0, 65% 100%, 0 100%)'
            }}
          >
            {/* ...existing background pattern... */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 right-10 w-16 h-16 bg-white opacity-10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-20 left-10 w-24 h-24 bg-white opacity-8 rounded-full animate-pulse delay-100"></div>
              <div className="absolute top-1/2 left-5 w-8 h-8 bg-white opacity-15 rounded-full animate-pulse delay-200"></div>
              <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-white opacity-6 rounded-full animate-pulse delay-300"></div>
            </div>
            
            {/* Medical Plus Icon */}
            <div className="absolute top-20 left-32 text-white opacity-20">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4V10H20C21.1 10 22 10.9 22 12S21.1 14 20 14H14V20C14 21.1 13.1 22 12 22S10 21.1 10 20V14H4C2.9 14 2 13.1 2 12S2.9 10 4 10H10V4C10 2.9 10.9 2 12 2Z"/>
              </svg>
            </div>
            
            {/* Content */}
            <div className="relative text-white max-w-lg z-10"
            style={{marginLeft:'40px'}}>
              <div className="mb-6">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="white" className="opacity-90 animate-bounce">
                  <path d="M12 2C13.1 2 14 2.9 14 4V10H20C21.1 10 22 10.9 22 12S21.1 14 20 14H14V20C14 21.1 13.1 22 12 22S10 21.1 10 20V14H4C2.9 14 2 13.1 2 12S2.9 10 4 10H10V4C10 2.9 10.9 2 12 2Z"/>
                </svg>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Y TẾ HỌC ĐƯỜNG<br />
                <span className="text-yellow-300 ">CHUYÊN NGHIỆP</span>
              </h1>
              <p className="text-lg mb-8 text-white opacity-90 leading-relaxed">
                Hệ thống quản lý y tế học đường hiện đại, chăm sóc 
                sức khỏe toàn diện cho học sinh. Đảm bảo môi trường 
                học tập an toàn và phát triển khỏe mạnh.
              </p>
              <div className="flex justify-start">
                <Button 
                  type="primary" 
                  size="large" 
                  className="h-12 px-8 rounded-full text-lg font-medium bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:scale-105 transition-all duration-300"
                >
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Purple Pastel - ĐIỀU CHỈNH ĐỂ TRÁNH CHE LOGO */}
          <div 
            className="absolute inset-0 flex items-center justify-end pr-24"
            style={{
              clipPath: 'polygon(65% 0, 100% 0, 100% 100%, 50% 100%)',
               backgroundColor: '#A9D5FA'
            }}
          >
            {/* Decorative Elements */}
            <div className="absolute top-16 left-20 w-4 h-4 bg-purple-400 rounded-full opacity-50 animate-ping"></div>
            <div className="absolute bottom-24 right-20 w-6 h-6 bg-pink-400 rounded-full opacity-40 animate-ping delay-100"></div>
            <div className="absolute top-1/3 right-10 w-3 h-3 bg-purple-500 rounded-full opacity-60 animate-ping delay-200"></div>
            <div className="absolute bottom-1/3 right-1/4 w-5 h-5 bg-pink-500 rounded-full opacity-45 animate-ping delay-300"></div>
            
            {/* Logo Container - DỊCH CHUYỂN VỀ BÊN PHẢI */}
            <div className="text-center transform hover:scale-105 transition-all duration-300 mr-8"
            style={{ marginRight: '85px'}}>
              <div className="mb-8">
                <img 
                  src="/SchoolMedical.gif" 
                  alt="School Medical System" 
                  className="w-64 h-64 mx-auto object-contain drop-shadow-lg"
                  style={{marginBottom:'-58px'}}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                TRƯỜNG TIỂU HỌC FPT
              </h2>
              <p className="text-gray-600">
                Hệ thống y tế học đường hiện đại
              </p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Statistics Section */}
        <div className="py-20 bg-blue-50">
          <div className="max-w-6xl mx-auto px-6">
            <Row gutter={[32, 32]} justify="center">
              <Col xs={12} sm={6}>
                <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                  <Statistic 
                    title={<span className="text-gray-600 font-medium">Học sinh được chăm sóc</span>} 
                    value={5000} 
                    suffix="+" 
                    valueStyle={{ color: '#1890ff', fontSize: '2rem', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                  <Statistic 
                    title={<span className="text-gray-600 font-medium">Y tá chuyên nghiệp</span>} 
                    value={50} 
                    suffix="+" 
                    valueStyle={{ color: '#52c41a', fontSize: '2rem', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                  <Statistic 
                    title={<span className="text-gray-600 font-medium">Trường học hợp tác</span>} 
                    value={100} 
                    suffix="+" 
                    valueStyle={{ color: '#fa541c', fontSize: '2rem', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card className="text-center border-0 shadow-lg rounded-xl hover:shadow-xl transition-shadow">
                  <Statistic 
                    title={<span className="text-gray-600 font-medium">Năm kinh nghiệm</span>} 
                    value={15} 
                    suffix="+" 
                    valueStyle={{ color: '#722ed1', fontSize: '2rem', fontWeight: 'bold' }}
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
                Chúng tôi cung cấp các dịch vụ y tế chuyên nghiệp và toàn diện cho học sinh
              </p>
            </div>
            <Row gutter={[24, 24]}>
              {services.map((service, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card className="text-center h-full border-0 shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                    <div className="mb-6">{service.icon}</div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
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
                    <h3 className="text-2xl font-bold text-blue-600 mb-4">Chăm sóc y tế chuyên nghiệp</h3>
                    <p className="text-gray-600">Đội ngũ y tá được đào tạo bài bản</p>
                  </div>
                </div>
              </Col>
              <Col xs={24} lg={12}>
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold text-blue-600">
                    Chăm Sóc Sức Khỏe Với<br />
                    Gói Y Tế Học Đường
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Chúng tôi cung cấp các gói chăm sóc sức khỏe toàn diện cho học sinh,
                    bao gồm khám định kỳ, theo dõi phát triển và hỗ trợ y tế khẩn cấp.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-700">Khám sức khỏe định kỳ hàng tháng</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="text-gray-700">Theo dõi phát triển thể chất</span>
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
                      <span className="text-gray-700">Tư vấn dinh dưỡng chuyên nghiệp</span>
                    </div>
                  </div>
                 
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer className="bg-gray-900 text-white p-0"
      style={{ backgroundColor: '#37AEEF' }}>
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <Row gutter={[48, 32]}>
              <Col xs={24} sm={12} lg={6}>
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white mb-6">DỊCH VỤ</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Khám sức khỏe</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Chăm sóc y tế</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Dinh dưỡng học đường</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">An toàn trường học</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Tư vấn sức khỏe</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Dịch vụ khẩn cấp</a></li>
                  </ul>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white mb-6">VỀ CHÚNG TÔI</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Giới thiệu</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Đội ngũ y tế</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Cơ sở vật chất</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Chứng nhận</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Tin tức & Sự kiện</a></li>
                  </ul>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white mb-6">HỖ TRỢ</h4>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Hướng dẫn sử dụng</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Câu hỏi thường gặp</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Chính sách bảo mật</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Điều khoản sử dụng</a></li>
                    <li><a href="#" className="text-white hover:text-blue-700 transition-colors">Liên hệ hỗ trợ</a></li>
                  </ul>
                </div>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-white mb-6">LIÊN HỆ</h4>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <EnvironmentOutlined className="text-white" />
                      <span className="text-white">123 Đường ABC, Quận 1, TP.HCM</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <PhoneOutlined className="text-white" />
                      <span className="text-white">1800 6688</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MailOutlined className="text-white" />
                      <span className="text-white">info@ytehocduong.edu.vn</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <GlobalOutlined className="text-white" />
                      <span className="text-white">www.ytehocduong.edu.vn</span>
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
              <span className="text-white">© 2024 Y Tế Học Đường. Tất cả quyền được bảo lưu.</span>
              <div className="flex space-x-6">
                <a href="#" className="text-white hover:text-white transition-colors">Điều khoản</a>
                <a href="#" className="text-white hover:text-white transition-colors">Bảo mật</a>
                <a href="#" className="text-white hover:ttext-white transition-colors">Liên hệ</a>
              </div>
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default HomePage;