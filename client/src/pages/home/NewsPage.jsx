import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Typography, Pagination, Modal } from "antd";
import AppHeader from "../../components/Layout/Header";
import { getSchoolInfo } from "../../api/Schoolinfo";
import { getAllNews } from "../../api/newsApi";

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const NewsPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New states for news detail modal
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsDetailModalVisible, setNewsDetailModalVisible] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsHeaderSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch news from API
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await getAllNews();
        console.log('📰 News API response:', response);
        console.log('📊 Raw news data:', response.data);
        console.log('🔢 Number of news items:', response.data.length);
        
        // Log the actual structure of the first item to see what fields exist
        if (response.data.length > 0) {
          console.log('🔍 First news item structure:', response.data[0]);
          console.log('🔑 Available keys in first item:', Object.keys(response.data[0]));
          
          // Log all field values to see what's actually there
          const firstItem = response.data[0];
          console.log('🔍 Field values in first item:');
          Object.keys(firstItem).forEach(key => {
            console.log(`  ${key}:`, firstItem[key], `(type: ${typeof firstItem[key]})`);
          });
        }
        
        // Use the actual field names from your API response
        const transformedNews = response.data.map((item, index) => {
          console.log(`🔄 Processing item ${index + 1}:`, item);
          
          // Use exact field names based on the API response structure
          // Since all fields were undefined before, let's try all possible variations
          const newsData = {
            id: item.newsID || item.NewsID || item.id || item.ID || `news-${index + 1}`,
            title: item.title || item.Title || item.newsTitle || item.name || `Tin tức ${index + 1}`,
            dateTime: item.dateTime || item.DateTime || item.date || item.Date || item.createdAt || item.created_at || new Date().toISOString(),
            summary: item.summary || item.Summary || item.description || item.Description || '',
            body: item.body || item.Body || item.content || item.Content || item.detail || item.Detail || '',
            status: item.status || item.Status || item.isActive || item.IsActive || item.active || 1,
            userID: item.userID || item.UserID || item.userId || item.UserId || item.user_id || ''
          };
          
          console.log(`✅ Transformed item ${index + 1}:`, newsData);
          
          return {
            id: newsData.id,
            title: newsData.title,
            date: new Date(newsData.dateTime).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric'
            }),
            content: newsData.summary || newsData.body || 'Nội dung tin tức',
            fullContent: newsData.body || newsData.summary || 'Nội dung chi tiết tin tức',
            status: newsData.status,
            userID: newsData.userID
          };
        });
        
        console.log('🔄 All transformed news:', transformedNews);
        
        // Don't filter by status for now to see all news items
        // const activeNews = transformedNews.filter(news => news.status === 1 || news.status === true);
        console.log('📋 Setting news list to all items:', transformedNews);
        
        setNewsList(transformedNews);
        
      } catch (error) {
        console.error('❌ Error fetching news:', error);
        console.error('📄 Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Enhanced fallback data with more items for testing
        console.log('🔄 Using enhanced fallback mock data');
        setNewsList([
          {
            id: "N0001",
            title: "Khám sức khỏe định kỳ cho học sinh năm 2025",
            date: "5 tháng 7, 2025",
            content: "Tiêm chủng đợt 1 vào tháng 7.",
            fullContent: "Chi tiết lịch tiêm chủng cho học sinh toàn trường vào tháng 7, vui lòng theo dõi thông báo từ y tế trường.",
            status: 1,
            userID: "U0002"
          },
          {
            id: "N0002", 
            title: "Khám sức khỏe định kỳ",
            date: "5 tháng 7, 2025",
            content: "Khám sức khỏe toàn trường.",
            fullContent: "Bắt đầu từ ngày 10/07, nhà trường sẽ tổ chức khám sức khỏe cho toàn bộ học sinh. Đề nghị các lớp phối hợp tốt.",
            status: 1,
            userID: "U0002"
          },
          {
            id: "N0003",
            title: "Hướng dẫn phòng bệnh sốt xuất huyết", 
            date: "5 tháng 7, 2025",
            content: "Cách phòng chống sốt xuất huyết.",
            fullContent: "Để phòng chống sốt xuất huyết, học sinh cần mặc quần áo dài tay, ngủ màn và diệt muỗi thường xuyên.",
            status: 1,
            userID: "U0003"
          },
          {
            id: "N0004",
            title: "Chương trình dinh dưỡng học đường mới",
            date: "25 tháng 6, 2025", 
            content: "Triển khai chương trình bữa ăn học đường cân đối dinh dưỡng cho học sinh.",
            fullContent: "Nhằm nâng cao sức khỏe và phát triển toàn diện cho học sinh, hệ thống y tế học đường phối hợp với các chuyên gia dinh dưỡng triển khai chương trình bữa ăn học đường cân đối, đa dạng và an toàn thực phẩm.",
            status: 1,
            userID: "U0002"
          },
          {
            id: "N0005",
            title: "Hội thảo phòng chống dịch bệnh trong trường học",
            date: "15 tháng 6, 2025",
            content: "Nâng cao ý thức vệ sinh cá nhân và cộng đồng cho học sinh, giáo viên và phụ huynh.",
            fullContent: "Hội thảo chuyên đề về phòng chống dịch bệnh, nâng cao ý thức vệ sinh cá nhân và cộng đồng cho học sinh, giáo viên và phụ huynh. Chương trình bao gồm các chủ đề về vệ sinh tay, khẩu trang, giãn cách xã hội và các biện pháp phòng ngừa dịch bệnh hiệu quả.",
            status: 1,
            userID: "U0003"
          }
        ]);
      } finally {
        setLoading(false);
        console.log('🏁 News loading completed');
      }
    };

    console.log('🚀 Starting news fetch...');
    fetchNews();
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

  const pageSize = 5; // Tăng số lượng tin tức hiển thị mỗi trang
  const [currentPageSize, setCurrentPageSize] = useState(10); // Tăng từ 5 lên 10
  const pagedNews = newsList.slice((currentPage-1)*currentPageSize, currentPage*currentPageSize);
  
  console.log('📄 Current page:', currentPage);
  console.log('📋 Paged news for display:', pagedNews);
  console.log('🔢 Total news items:', newsList.length);

  // Function to handle clicking on a news item
  const handleNewsClick = (newsItem) => {
    setSelectedNews(newsItem);
    setNewsDetailModalVisible(true);
  };

  // Function to close news detail modal
  const handleCloseNewsDetail = () => {
    setNewsDetailModalVisible(false);
    setSelectedNews(null);
  };

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
              <Row gutter={[32, 32]} align="middle" className="w-full h-full min-h-[600px]">
                {/* Left: News Illustration */}
                <Col xs={24} lg={10} className="h-full flex items-center justify-center">
                  <div className="relative h-full flex items-center justify-center px-6 lg:px-8">
                    {/* Background decorative circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-72 h-72 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-15 animate-pulse"></div>
                      <div className="absolute w-80 h-80 bg-blue-500 rounded-full opacity-10"></div>
                    </div>
                    {/* News Illustration */}
                    <div className="relative z-10 animate-fadeInRight animate-float">
                      <img
                        src="/SchoolMedical.gif"
                        alt="Tin tức y tế học đường"
                        className="w-full max-w-sm mx-auto object-contain drop-shadow-2xl rounded-2xl"
                        onError={e => { e.target.onerror = null; e.target.src = '/anhBacsi.png'; }}
                      />
                    </div>
                  </div>
                </Col>
                
                {/* Right: News Content */}
                <Col xs={24} lg={14} className="h-full flex items-center justify-center">
                  <div className="space-y-8 w-full max-w-4xl text-center animate-fadeInLeft mx-auto bg-white/95 rounded-3xl shadow-2xl border border-blue-100/40 backdrop-blur-md p-10" style={{ minHeight: '65vh' }}>
                    <div className="text-center mb-8">
                      <Title className="text-5xl xl:text-6xl font-bold text-blue-700 leading-tight animate-fadeInUp mb-4" style={{ animationDelay: "0.2s" }}>
                        Tin tức y tế học đường
                      </Title>
                      <Paragraph className="text-xl text-gray-700 leading-relaxed animate-fadeInUp max-w-3xl mx-auto" style={{ animationDelay: "0.4s" }}>
                        Cập nhật các tin tức, sự kiện mới nhất về y tế học đường, sức khỏe học sinh, các chương trình, hoạt động nổi bật và thông báo quan trọng từ hệ thống.
                      </Paragraph>
                    </div>
                    
                    {/* News List - Pagination */}
                    <div className="space-y-5 mt-8 animate-fadeInUp text-left" style={{ animationDelay: "0.6s" }}>
                      {loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">Đang tải tin tức...</p>
                        </div>
                      ) : pagedNews.length > 0 ? (
                        pagedNews.map((item, idx) => (
                          <div 
                            key={item.id || idx} 
                            className="bg-gradient-to-r from-blue-50 to-blue-100/80 rounded-2xl p-5 shadow-md border border-blue-200 hover:shadow-lg transition-all cursor-pointer hover:from-blue-100 hover:to-blue-200/80 transform hover:-translate-y-1"
                            onClick={() => handleNewsClick(item)}
                          >
                            <h3 className="text-lg font-bold text-blue-700 mb-2 line-clamp-2">{item.title}</h3>
                            <p className="text-gray-600 mb-2 text-sm font-medium">{item.date}</p>
                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-3">{item.content}</p>
                            <div className="text-right">
                              <span className="text-blue-600 text-xs font-semibold bg-blue-100 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors">
                                Xem chi tiết →
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-500">
                          <div className="mb-4">
                            <span className="text-6xl">📰</span>
                          </div>
                          <p className="text-lg font-medium">Hiện tại chưa có tin tức nào được đăng tải.</p>
                        </div>
                      )}
                    </div>
                    
                    {newsList.length > 4 && ( // Chỉ hiện pagination khi có nhiều hơn 4 tin tức
                      <div className="flex justify-center pt-4">
                        <Pagination
                          current={currentPage}
                          pageSize={currentPageSize}
                          total={newsList.length}
                          onChange={(page) => setCurrentPage(page)}
                          showSizeChanger={true}
                          pageSizeOptions={['5', '10', '20', '50']} // Tăng các tùy chọn
                          showQuickJumper={true}
                          size="default"
                          className="custom-pagination"
                          showTotal={(total, range) => 
                            `${range[0]}-${range[1]} của ${total} tin tức`
                          }
                          onShowSizeChange={(current, size) => {
                            setCurrentPageSize(Number(size));
                            setCurrentPage(1); // Reset to first page when changing page size
                          }}
                        />
                      </div>
                    )}
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
                      <div className="flex items-start space-x-3">
                        <span className="text-white flex-shrink-0">📍</span>
                        <span className="text-white break-words">
                          {schoolInfo?.Address || schoolInfo?.address || "123 Đường ABC, Quận 1, TP.HCM"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white">📞</span>
                        <a href={`tel:${schoolInfo?.Hotline || schoolInfo?.hotline || "1800 6688"}`} className="text-white hover:text-blue-200 transition-colors">
                          {schoolInfo?.Hotline || schoolInfo?.hotline || "1800 6688"}
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white">✉️</span>
                        <a href={`mailto:${schoolInfo?.Email || schoolInfo?.email || "info@ytehocduong.edu.vn"}`} className="text-white hover:text-blue-200 transition-colors break-all">
                          {schoolInfo?.Email || schoolInfo?.email || "info@ytehocduong.edu.vn"}
                        </a>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-white">🌐</span>
                        <a href="https://www.ytehocduong.edu.vn" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
                          www.ytehocduong.edu.vn
                        </a>
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
                <span className="text-white">© 2024 {schoolInfo?.Name || schoolInfo?.name || "Y Tế Học Đường"}. Tất cả quyền được bảo lưu.</span>
                <div className="flex space-x-6">
                  <a href="#" className="text-white hover:text-white transition-colors">Điều khoản</a>
                  <a href="#" className="text-white hover:text-white transition-colors">Bảo mật</a>
                  <a href="#" className="text-white hover:ttext-white transition-colors">Liên hệ</a>
                </div>
              </div>
            </div>
          </div>
        </Footer>

        {/* News Detail Modal */}
        <Modal
          title={
            <div className="flex items-center justify-center space-x-2">
              <span className="text-blue-700 font-bold text-xl">📰</span>
              <span className="font-bold text-blue-700 text-lg">Chi tiết tin tức</span>
            </div>
          }
          open={newsDetailModalVisible}
          onCancel={handleCloseNewsDetail}
          footer={null}
          width={900}
          centered
          className="news-detail-modal"
          styles={{
            body: {
              padding: '24px',
              maxHeight: '75vh',
              overflowY: 'auto'
            }
          }}
        >
          {selectedNews && (
            <div className="space-y-6">
              {/* News Header */}
              <div className="text-center border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-blue-700 leading-tight mb-4">
                  {selectedNews.title}
                </h1>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                    <span>📅</span>
                    <span className="font-medium">{selectedNews.date}</span>
                  </span>
                  {selectedNews.userID && (
                    <span className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                      <span>👤</span>
                      <span className="font-medium">ID: {selectedNews.userID}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-2">
                    <span>🔖</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      Đang hoạt động
                    </span>
                  </span>
                </div>
              </div>

              {/* News Content */}
              <div className="prose max-w-none">
                {selectedNews.fullContent ? (
                  <div className="space-y-6">
                    {/* Summary Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-400">
                      <div className="flex items-center mb-3">
                        <span className="text-blue-600 text-lg mr-2">📋</span>
                        <h3 className="font-bold text-blue-700 text-lg">Tóm tắt</h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-base">{selectedNews.content}</p>
                    </div>
                    
                    {/* Full Content Section */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-4">
                        <span className="text-gray-600 text-lg mr-2">📄</span>
                        <h3 className="font-bold text-gray-800 text-lg">Nội dung chi tiết</h3>
                      </div>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                        {selectedNews.fullContent}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                    <div className="text-gray-800 leading-relaxed text-base">
                      <p>{selectedNews.content}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span>🆔</span>
                    <span className="font-medium">ID tin tức: {selectedNews.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span className="font-medium">Trạng thái: Đã xuất bản</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </Layout>
    </>
  );
};

export default NewsPage;