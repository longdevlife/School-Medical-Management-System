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
          <div className="relative h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30 flex flex-col overflow-hidden">
            <div className={`relative z-30 w-full flex-shrink-0 transition-all duration-300 ${isHeaderSticky ? "sticky-header" : ""}`}>
              <div className="w-full">
                <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
              </div>
            </div>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full opacity-40 animate-pulse" style={{ animationDelay: "2s" }}></div>
              <div className="absolute bottom-32 left-16 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: "2.5s" }}></div>
              <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-50 animate-pulse" style={{ animationDelay: "3s" }}></div>
              <div className="absolute inset-0 opacity-5 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
                <div className="w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)`, backgroundSize: "40px 40px" }}></div>
              </div>
              <div className="absolute top-1/4 left-10 w-2 h-20 bg-gradient-to-b from-blue-300 to-transparent rounded-full opacity-30 animate-fadeInLeft" style={{ animationDelay: "1.5s" }}></div>
              <div className="absolute bottom-1/4 right-10 w-2 h-16 bg-gradient-to-t from-blue-400 to-transparent rounded-full opacity-25 animate-fadeInRight" style={{ animationDelay: "1.8s" }}></div>
              <div className="absolute top-32 left-1/4 w-6 h-6 border-2 border-blue-300 rounded rotate-45 opacity-20 animate-spin-slow"></div>
              <div className="absolute bottom-40 right-1/4 w-4 h-4 bg-blue-200 rotate-12 opacity-30 animate-float" style={{ animationDelay: "2.2s" }}></div>
            </div>
            <div className="flex-1 w-full relative z-10 flex items-center justify-center">
              <Row gutter={[48, 32]} align="middle" className="w-full h-full">
                {/* Left: Image & Decorative */}
                <Col xs={24} lg={12} className="h-full flex items-center justify-center">
                  <div className="relative h-full flex items-center justify-center px-8 lg:px-16">
                    {/* Background decorative circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-15 animate-pulse"></div>
                      <div className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-10"></div>
                    </div>
                    {/* Main Image */}
                    <div className="relative z-10 transform hover:scale-105 transition-transform duration-700 animate-fadeInRight animate-float">
                      <img
                        src="/anhBacsi.png"
                        alt="Bác sĩ chuyên nghiệp"
                        className="w-full max-w-max mx-auto object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </Col>
                {/* Right: About Content */}
                <Col xs={24} lg={12} className="h-full flex items-center justify-center">
                  <div className="max-w-2xl w-full animate-fadeInLeft mx-auto bg-white/90 rounded-3xl shadow-2xl border border-blue-100/40 backdrop-blur-md p-0">
                    {/* Section 1: Giới thiệu */}
                    <section className="px-10 pt-10 pb-8 border-b border-blue-100/40">
                      <Title className="text-5xl xl:text-6xl font-bold text-blue-700 leading-tight animate-fadeInUp mb-4" style={{ animationDelay: "0.2s" }}>
                        Giới thiệu về {schoolInfo?.Name || schoolInfo?.name || schoolInfo?.schoolName || "Y tế học đường"}
                      </Title>
                      <Paragraph className="text-xl text-gray-700 leading-relaxed animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
                        Hệ thống {schoolInfo?.Name || schoolInfo?.name || schoolInfo?.schoolName || "Y tế học đường"} mang đến giải pháp chăm sóc sức khỏe toàn diện cho học sinh, với đội ngũ chuyên gia, y tá giàu kinh nghiệm và các dịch vụ hiện đại, an toàn, tận tâm.
                      </Paragraph>
                    </section>

                    {/* Section 2: Thông tin liên hệ */}
                    <section className="px-10 py-8 border-b border-blue-100/40">
                      <Title level={3} className="text-blue-700 font-bold mb-6">📞 Thông tin liên hệ</Title>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 rounded-2xl p-6 shadow-md border border-blue-100 animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
                          <h4 className="text-lg font-bold text-blue-600 mb-3">📍 Địa chỉ</h4>
                          <p className="text-gray-600">
                            {schoolInfo?.Address || schoolInfo?.address || schoolInfo?.schoolAddress || "123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM"}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-6 shadow-md border border-blue-100 animate-fadeInUp" style={{ animationDelay: "0.7s" }}>
                          <h4 className="text-lg font-bold text-blue-600 mb-3">📞 Hotline</h4>
                          <p className="text-gray-600">
                            {schoolInfo?.Hotline || schoolInfo?.hotline || schoolInfo?.phone || schoolInfo?.Phone || "0365858084"}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-6 shadow-md border border-blue-100 animate-fadeInUp" style={{ animationDelay: "0.8s" }}>
                          <h4 className="text-lg font-bold text-blue-600 mb-3">✉️ Email</h4>
                          <p className="text-gray-600">
                            {schoolInfo?.Email || schoolInfo?.email || schoolInfo?.schoolEmail || "contact@schoolabc.edu.vn"}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-6 shadow-md border border-blue-100 animate-fadeInUp" style={{ animationDelay: "0.9s" }}>
                          <h4 className="text-lg font-bold text-blue-600 mb-3">🌐 Website</h4>
                          <p className="text-gray-600">www.schoolabc.edu.vn</p>
                        </div>
                      </div>
                    </section>

                    {/* Section 3: Sứ mệnh & Tầm nhìn */}
                    <section className="px-10 py-10 border-b border-blue-100/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-blue-50 rounded-2xl p-6 shadow-md border border-blue-100 animate-fadeInUp" style={{ animationDelay: "1.0s" }}>
                          <h3 className="text-2xl font-bold text-blue-600 mb-3">🎯 Sứ mệnh</h3>
                          <p className="text-gray-600">Xây dựng môi trường học đường an toàn, khỏe mạnh, hỗ trợ phát triển toàn diện cho học sinh thông qua các dịch vụ y tế chất lượng cao.</p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-6 shadow-md border border-blue-100 animate-fadeInUp" style={{ animationDelay: "1.1s" }}>
                          <h3 className="text-2xl font-bold text-blue-600 mb-3">🚀 Tầm nhìn</h3>
                          <p className="text-gray-600">Trở thành hệ thống y tế học đường hàng đầu, ứng dụng công nghệ hiện đại, kết nối chuyên gia và cộng đồng để nâng cao sức khỏe thế hệ trẻ.</p>
                        </div>
                      </div>
                    </section>

                    {/* Section 4: Giá trị cốt lõi */}
                    <section className="px-10 py-10 border-b border-blue-100/40">
                      <Title level={3} className="text-blue-700 font-bold mb-4">💎 Giá trị cốt lõi</Title>
                      <ul className="flex flex-wrap justify-center gap-4 mt-4">
                        <li className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-3 rounded-full text-blue-700 font-semibold shadow-md hover:shadow-lg transition-shadow">🏆 Chuyên nghiệp</li>
                        <li className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-3 rounded-full text-blue-700 font-semibold shadow-md hover:shadow-lg transition-shadow">❤️ Tận tâm</li>
                        <li className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-3 rounded-full text-blue-700 font-semibold shadow-md hover:shadow-lg transition-shadow">🛡️ An toàn</li>
                        <li className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-3 rounded-full text-blue-700 font-semibold shadow-md hover:shadow-lg transition-shadow">🚀 Đổi mới</li>
                        <li className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-3 rounded-full text-blue-700 font-semibold shadow-md hover:shadow-lg transition-shadow">🤝 Hợp tác</li>
                      </ul>
                    </section>

                    {/* Section 5: Đội ngũ chuyên gia */}
                    <section className="px-10 py-10">
                      <Title level={4} className="text-blue-700 font-bold mb-2">👨‍⚕️ Đội ngũ chuyên gia</Title>
                      <Paragraph className="text-gray-700">
                        Đội ngũ y bác sĩ, y tá và chuyên gia y tế của {schoolInfo?.Name || schoolInfo?.name || "chúng tôi"} đều có trình độ chuyên môn cao, nhiều năm kinh nghiệm trong lĩnh vực chăm sóc sức khỏe học đường, luôn sẵn sàng hỗ trợ và đồng hành cùng học sinh, phụ huynh và nhà trường.
                      </Paragraph>
                    </section>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Content>
        
        <Footer className="bg-gray-900 text-white p-0" style={{ backgroundColor: "#37AEEF" }}>
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

