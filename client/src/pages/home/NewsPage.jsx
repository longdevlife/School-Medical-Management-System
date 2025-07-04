import React, { useState } from "react";
import { Layout, Row, Col, Typography, Pagination } from "antd";
import AppHeader from "../../components/Layout/Header";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const NewsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const newsList = [
    {
      title: "Khám sức khỏe định kỳ cho học sinh năm 2025",
      date: "Ngày 20/06/2025",
      content: "Trường THCS ABC phối hợp với hệ thống y tế học đường tổ chức khám sức khỏe định kỳ cho toàn bộ học sinh, đảm bảo phát hiện sớm các vấn đề sức khỏe."
    },
    {
      title: "Tập huấn sơ cứu cho giáo viên và học sinh",
      date: "Ngày 10/06/2025",
      content: "Chương trình tập huấn kỹ năng sơ cứu cơ bản giúp nâng cao ý thức an toàn và khả năng xử lý tình huống khẩn cấp trong trường học."
    },
    {
      title: "Thông báo tiêm chủng phòng bệnh cho học sinh",
      date: "Ngày 01/06/2025",
      content: "Hệ thống y tế học đường triển khai chương trình tiêm chủng phòng bệnh theo khuyến nghị của Bộ Y tế dành cho học sinh các cấp."
    },
    {
      title: "Chương trình dinh dưỡng học đường mới",
      date: "Ngày 25/05/2025",
      content: "Nhằm nâng cao sức khỏe và phát triển toàn diện cho học sinh, hệ thống y tế học đường phối hợp với các chuyên gia dinh dưỡng triển khai chương trình bữa ăn học đường cân đối, đa dạng và an toàn thực phẩm."
    },
    {
      title: "Hội thảo phòng chống dịch bệnh trong trường học",
      date: "Ngày 15/05/2025",
      content: "Hội thảo chuyên đề về phòng chống dịch bệnh, nâng cao ý thức vệ sinh cá nhân và cộng đồng cho học sinh, giáo viên và phụ huynh."
    }
  ];
  const pageSize = 3;
  const pagedNews = newsList.slice((currentPage-1)*pageSize, currentPage*pageSize);

  return (
    <>
      <style>{customStyles}</style>
      <Layout className="min-h-screen">
        <Content className={`p-0 ${isHeaderSticky ? "pt-16" : ""} transition-all duration-300`}>
          <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-200/30 flex flex-col overflow-hidden">
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
            <div className="flex-1 w-full relative z-10 flex items-center justify-center overflow-auto" style={{ minHeight: '600px' }}>
              <Row gutter={[48, 32]} align="middle" className="w-full h-full min-h-[600px]">
                {/* Left: News Illustration */}
                <Col xs={24} lg={12} className="h-full flex items-center justify-center">
                  <div className="relative h-full flex items-center justify-center px-8 lg:px-16">
                    {/* Background decorative circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-15 animate-pulse"></div>
                      <div className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-10"></div>
                    </div>
                    {/* News Illustration (use SchoolMedical.gif if available, else fallback to anhBacsi.png) */}
                    <div className="relative z-10 animate-fadeInRight animate-float">
                      <img
                        src="/SchoolMedical.gif"
                        alt="Tin tức y tế học đường"
                        className="w-full max-w-md mx-auto object-contain drop-shadow-2xl rounded-2xl"
                        onError={e => { e.target.onerror = null; e.target.src = '/anhBacsi.png'; }}
                      />
                    </div>
                  </div>
                </Col>
                {/* Right: News Content */}
                <Col xs={24} lg={12} className="h-full flex items-center justify-center">
                  <div className="space-y-8 max-w-2xl text-center animate-fadeInLeft mx-auto bg-white/90 rounded-3xl shadow-2xl border border-blue-100/40 backdrop-blur-md p-10" style={{ minHeight: '60vh' }}>
                    <Title className="text-5xl xl:text-6xl font-bold text-blue-700 leading-tight animate-fadeInUp" style={{ animationDelay: "0.2s" }}>Tin tức y tế học đường</Title>
                    <Paragraph className="text-xl text-gray-700 leading-relaxed animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
                      Cập nhật các tin tức, sự kiện mới nhất về y tế học đường, sức khỏe học sinh, các chương trình, hoạt động nổi bật và thông báo quan trọng từ hệ thống.
                    </Paragraph>
                    {/* Demo News List - Pagination */}
                    <div className="space-y-6 mt-8 animate-fadeInUp text-left" style={{ animationDelay: "0.6s" }}>
                      {pagedNews.map((item, idx) => (
                        <div key={idx} className="bg-blue-50 rounded-2xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-all cursor-pointer">
                          <h3 className="text-xl font-bold text-blue-600 mb-2">{item.title}</h3>
                          <p className="text-gray-600 mb-1">{item.date}</p>
                          <p className="text-gray-700">{item.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center pt-4">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={newsList.length}
                        onChange={setCurrentPage}
                        showSizeChanger={false}
                        hideOnSinglePage
                      />
                    </div>
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
                    <h4 className="text-xl font-bold text-white mb-6">LIÊN HỆ</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3"><span className="text-white">123 Đường ABC, Quận 1, TP.HCM</span></div>
                      <div className="flex items-center space-x-3"><span className="text-white">1800 6688</span></div>
                      <div className="flex items-center space-x-3"><span className="text-white">info@ytehocduong.edu.vn</span></div>
                      <div className="flex items-center space-x-3"><span className="text-white">www.ytehocduong.edu.vn</span></div>
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
    </>
  );
};

export default NewsPage;