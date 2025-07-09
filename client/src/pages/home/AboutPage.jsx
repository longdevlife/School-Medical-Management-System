import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Typography, Spin } from "antd";
import AppHeader from "../../components/Layout/Header";
import { getSchoolInfo } from "../../api/Schoolinfo";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const AboutPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        console.log('=== FETCHING SCHOOL INFO ===');
        const response = await getSchoolInfo();
        console.log('✅ API Response:', response);
        console.log('📊 Response Data:', response.data);
        console.log('🔍 Data Type:', typeof response.data);
        console.log('📝 Data Keys:', Object.keys(response.data || {}));
        console.log('📋 All Data Properties:', response.data);
        
        const info = response.data;
        
        // Log từng property để xem tên field thực tế
        console.log('🔍 Name variations:', {
          Name: info.Name,
          name: info.name,
          schoolName: info.schoolName,
          SchoolName: info.SchoolName
        });
        
        console.log('🔍 Address variations:', {
          Address: info.Address,
          address: info.address,
          schoolAddress: info.schoolAddress
        });
        
        console.log('🔍 Hotline variations:', {
          Hotline: info.Hotline,
          hotline: info.hotline,
          phone: info.phone,
          Phone: info.Phone
        });
        
        console.log('🔍 Email variations:', {
          Email: info.Email,
          email: info.email,
          schoolEmail: info.schoolEmail
        });
        
        if (info && Object.keys(info).length > 0) {
          console.log('✅ Setting school info from API');
          setSchoolInfo(info);
        } else {
          console.log('❌ No valid data, using fallback');
          setSchoolInfo({
            Name: "Trường Tiểu học ABC",
            Address: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM",
            Hotline: "0365858084",
            Email: "contact@schoolabc.edu.vn"
          });
        }
      } catch (error) {
        console.error('❌ API Error:', error);
        setSchoolInfo({
          Name: "Trường Tiểu học ABC (API Error)",
          Address: "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM", 
          Hotline: "0365858084",
          Email: "contact@schoolabc.edu.vn"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolInfo();
  }, []);

  const customStyles = `
    @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); } 50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); } }
    .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
    .animate-fadeInLeft { animation: fadeInLeft 0.8s ease-out forwards; }
    .animate-fadeInRight { animation: fadeInRight 0.8s ease-out forwards; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-glow { animation: glow 2s ease-in-out infinite; }
    .ant-layout-header { margin: 0 !important; padding: 0 !important; }
    .sticky-header { position: fixed !important; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(255,255,255,0.85); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(59,130,246,0.15); box-shadow: 0 8px 32px rgba(0,0,0,0.12); transition: all 0.4s cubic-bezier(0.4,0,0.2,1); transform: translateY(0); }
    .sticky-header .ant-layout-header { background: transparent !important; border-bottom: none !important; }
    .sticky-header > div { padding: 8px 0; transition: padding 0.3s ease; }
    .sticky-header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent); }
  `;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-blue-600 font-medium">Đang tải thông tin trường học...</p>
        </div>
      </div>
    );
  }

  // Debug log
  console.log('Current schoolInfo state:', schoolInfo);

  return (
    <>
      <style>{customStyles}</style>
      <Layout className="min-h-screen">
        <Content className={`p-0 ${isHeaderSticky ? "pt-16" : ""} transition-all duration-300`}>
          {/* Header Section */}
          <div className={`relative z-30 w-full flex-shrink-0 transition-all duration-300 ${isHeaderSticky ? "sticky-header" : ""}`}>
            <div className="w-full">
              <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
            </div>
          </div>

          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30 py-20">
            <div className="max-w-7xl mx-auto px-4">
              <Row gutter={[48, 32]} align="middle">
                {/* Left: Hero Content */}
                <Col xs={24} lg={12}>
                  <div className="text-center lg:text-left animate-fadeInLeft">
                    <Title className="text-4xl xl:text-5xl font-bold text-blue-700 leading-tight mb-6">
                      Giới thiệu về {schoolInfo?.Name || schoolInfo?.name || schoolInfo?.schoolName || "Y tế học đường"}
                    </Title>
                    <Paragraph className="text-xl text-gray-700 leading-relaxed mb-8">
                      Hệ thống {schoolInfo?.Name || schoolInfo?.name || schoolInfo?.schoolName || "Y tế học đường"} mang đến giải pháp chăm sóc sức khỏe toàn diện cho học sinh, với đội ngũ chuyên gia, y tá giàu kinh nghiệm và các dịch vụ hiện đại, an toàn, tận tâm.
                    </Paragraph>
                  </div>
                </Col>
                
                {/* Right: Hero Image */}
                <Col xs={24} lg={12}>
                  <div className="text-center animate-fadeInRight">
                    <img
                      src="/anhBacsi.png"
                      alt="Bác sĩ chuyên nghiệp"
                      className="w-full max-w-lg mx-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4">
              <Title level={2} className="text-center text-blue-700 font-bold mb-12">📞 Thông tin liên hệ</Title>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-blue-50 rounded-2xl p-6 text-center shadow-md border border-blue-100 h-full">
                    <h4 className="text-lg font-bold text-blue-600 mb-3">📍 Địa chỉ</h4>
                    <p className="text-gray-600">
                      {schoolInfo?.Address || schoolInfo?.address || schoolInfo?.schoolAddress || "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM"}
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-blue-50 rounded-2xl p-6 text-center shadow-md border border-blue-100 h-full">
                    <h4 className="text-lg font-bold text-blue-600 mb-3">📞 Hotline</h4>
                    <p className="text-gray-600">
                      {schoolInfo?.Hotline || schoolInfo?.hotline || schoolInfo?.phone || schoolInfo?.Phone || "0365858084"}
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-blue-50 rounded-2xl p-6 text-center shadow-md border border-blue-100 h-full">
                    <h4 className="text-lg font-bold text-blue-600 mb-3">✉️ Email</h4>
                    <p className="text-gray-600">
                      {schoolInfo?.Email || schoolInfo?.email || schoolInfo?.schoolEmail || "contact@schoolabc.edu.vn"}
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="bg-blue-50 rounded-2xl p-6 text-center shadow-md border border-blue-100 h-full">
                    <h4 className="text-lg font-bold text-blue-600 mb-3">🌐 Website</h4>
                    <p className="text-gray-600">www.schoolabc.edu.vn</p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Mission & Vision Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
            <div className="max-w-7xl mx-auto px-4">
              <Row gutter={[48, 32]} align="middle">
                <Col xs={24} lg={12}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 h-full">
                    <h3 className="text-3xl font-bold text-blue-600 mb-4">🎯 Sứ mệnh</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Xây dựng môi trường học đường an toàn, khỏe mạnh, hỗ trợ phát triển toàn diện cho học sinh thông qua các dịch vụ y tế chất lượng cao.
                    </p>
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-100 h-full">
                    <h3 className="text-3xl font-bold text-blue-600 mb-4">🚀 Tầm nhìn</h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      Trở thành hệ thống y tế học đường hàng đầu, ứng dụng công nghệ hiện đại, kết nối chuyên gia và cộng đồng để nâng cao sức khỏe thế hệ trẻ.
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4">
              <Title level={2} className="text-center text-blue-700 font-bold mb-12">💎 Giá trị cốt lõi</Title>
              <Row gutter={[24, 24]} justify="center">
                <Col xs={24} sm={12} md={8} lg={4}>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md h-full">
                    <div className="text-4xl mb-4">🏆</div>
                    <h4 className="text-lg font-bold text-blue-700 mb-2">Chuyên nghiệp</h4>
                    <p className="text-gray-600 text-sm">Đội ngũ y tế có trình độ cao</p>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md h-full">
                    <div className="text-4xl mb-4">❤️</div>
                    <h4 className="text-lg font-bold text-blue-700 mb-2">Tận tâm</h4>
                    <p className="text-gray-600 text-sm">Chăm sóc với tình yêu thương</p>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md h-full">
                    <div className="text-4xl mb-4">🛡️</div>
                    <h4 className="text-lg font-bold text-blue-700 mb-2">An toàn</h4>
                    <p className="text-gray-600 text-sm">Đảm bảo an toàn tuyệt đối</p>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md h-full">
                    <div className="text-4xl mb-4">🚀</div>
                    <h4 className="text-lg font-bold text-blue-700 mb-2">Đổi mới</h4>
                    <p className="text-gray-600 text-sm">Ứng dụng công nghệ hiện đại</p>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-md h-full">
                    <div className="text-4xl mb-4">🤝</div>
                    <h4 className="text-lg font-bold text-blue-700 mb-2">Hợp tác</h4>
                    <p className="text-gray-600 text-sm">Kết nối cộng đồng giáo dục</p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          {/* Team Section */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center">
                <Title level={2} className="text-blue-700 font-bold mb-6">👨‍⚕️ Đội ngũ chuyên gia</Title>
                <div className="max-w-4xl mx-auto">
                  <Paragraph className="text-lg text-gray-700 leading-relaxed">
                    Đội ngũ y bác sĩ, y tá và chuyên gia y tế của {schoolInfo?.Name || schoolInfo?.name || "chúng tôi"} đều có trình độ chuyên môn cao, nhiều năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe học đường, luôn sẵn sàng hỗ trợ và đồng hành cùng học sinh, phụ huynh và nhà trường.
                  </Paragraph>
                </div>
              </div>
            </div>
          </div>
        </Content>
        
        {/* Footer with proper spacing */}
        <Footer className="bg-gray-900 text-white p-0 mt-0" style={{ backgroundColor: "#37AEEF" }}>
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
                    <h4 className="text-xl font-bold text-white mb-6">📞 LIÊN HỆ</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-white">📍 {schoolInfo?.Address || schoolInfo?.address || "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM"}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white">📞 {schoolInfo?.Hotline || schoolInfo?.hotline || schoolInfo?.phone || "0365858084"}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white">✉️ {schoolInfo?.Email || schoolInfo?.email || "contact@schoolabc.edu.vn"}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white">🌐 www.schoolabc.edu.vn</span>
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
                <span className="text-white">© 2024 {schoolInfo?.Name || schoolInfo?.name || "Trường Tiểu học ABC"}. Tất cả quyền được bảo lưu.</span>
                <div className="flex space-x-6">
                  <a href="#" className="text-white hover:text-white transition-colors">Điều khoản</a>
                  <a href="#" className="text-white hover:text-white transition-colors">Bảo mật</a>
                  <a href="#" className="text-white hover:text-white transition-colors">Liên hệ</a>
                </div>
              </div>
            </div>
          </div>
        </Footer>
      </Layout>
    </>
  );
};

export default AboutPage;

