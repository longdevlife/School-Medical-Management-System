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
          // Lấy ảnh từ các trường phổ biến
          let image =
            (Array.isArray(item.image) && item.image.length > 0 && typeof item.image[0] === "string")
              ? item.image[0]
              : item.image && typeof item.image === "string"
              ? item.image
              : item.image && item.image.url
              ? item.image.url
              : item.fileLink
              ? item.fileLink
              : item.files && Array.isArray(item.files) && item.files[0]?.fileLink
              ? item.files[0].fileLink
              : "";

          const newsData = {
            id: item.newsID || item.NewsID || item.id || item.ID || `news-${index + 1}`,
            title: item.title || item.Title || item.newsTitle || item.name || `Tin tức ${index + 1}`,
            dateTime: item.dateTime || item.DateTime || item.date || item.Date || item.createdAt || item.created_at || new Date().toISOString(),
            summary: item.summary || item.Summary || item.description || item.Description || '',
            body: item.body || item.Body || item.content || item.Content || item.detail || item.Detail || '',
            status: item.status || item.Status || item.isActive || item.IsActive || item.active || 1,
            userID: item.userID || item.UserID || item.userId || item.UserId || item.user_id || '',
            image: image
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
            userID: newsData.userID,
            image: newsData.image
          };
        });
        
        console.log('🔄 All transformed news:', transformedNews);
        
        // Don't filter by status for now to see all news items
        // const activeNews = transformedNews.filter(news => news.status === 1 || news.status === true);
        console.log('📋 Setting news list to all items:', transformedNews);
        
        // Sắp xếp tin: ưu tiên ngày (không tính giờ), nếu ngày giống nhau thì so sánh thời gian chi tiết
        const sortedNews = [...transformedNews].sort((a, b) => {
          // Lấy giá trị gốc dateTime hoặc date
          const getRawDate = (item) => {
            // Ưu tiên dateTime, DateTime, date, Date, createdAt, created_at
            return (
              item.dateTime || item.DateTime || item.date || item.Date || item.createdAt || item.created_at || ''
            );
          };
          const rawA = getRawDate(response.data.find(x => x.newsID == a.id || x.NewsID == a.id || x.id == a.id || x.ID == a.id));
          const rawB = getRawDate(response.data.find(x => x.newsID == b.id || x.NewsID == b.id || x.id == b.id || x.ID == b.id));
          // Lấy phần ngày (yyyy-mm-dd)
          const dayA = rawA ? new Date(rawA).toISOString().slice(0, 10) : '';
          const dayB = rawB ? new Date(rawB).toISOString().slice(0, 10) : '';
          if (dayA !== dayB) {
            // So sánh ngày trước
            return dayB.localeCompare(dayA);
          }
          // Nếu ngày giống nhau, so sánh thời gian chi tiết
          const timeA = rawA ? new Date(rawA).getTime() : 0;
          const timeB = rawB ? new Date(rawB).getTime() : 0;
          return timeB - timeA;
        });
        setNewsList(sortedNews);
        
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


  // Search bar state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = React.useRef(null);

  // Focus input when searchOpen
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Filter news by search
  const filteredNews = newsList.filter(item =>
    item.title.toLowerCase().includes(searchValue.trim().toLowerCase())
  );
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const pageSize = 5;
  const pagedNews = filteredNews.slice((currentPage-1)*currentPageSize, currentPage*currentPageSize);

  // Close search on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

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
              {/* Bỏ logo, chỉ giữ khung tin tức lớn ra giữa */}
              <div className="w-full flex flex-col items-center justify-center">
                <div className="space-y-8 w-full max-w-5xl flex flex-col items-center justify-center animate-fadeInLeft mx-auto bg-white/95 rounded-3xl shadow-2xl border border-blue-100/40 backdrop-blur-md p-12" style={{ minHeight: '70vh' }}>
                  {/* Đưa tiêu đề và mô tả ra giữa */}
                  <div className="flex flex-col items-center justify-center text-center mb-8">
                    <Title className="text-5xl xl:text-6xl font-bold text-blue-700 leading-tight animate-fadeInUp mb-4" style={{ animationDelay: "0.2s" }}>
                      Tin tức y tế học đường
                    </Title>
                    <Paragraph className="text-xl text-gray-700 leading-relaxed animate-fadeInUp max-w-3xl mx-auto" style={{ animationDelay: "0.4s" }}>
                      Cập nhật các tin tức, sự kiện mới nhất về y tế học đường, sức khỏe học sinh, các chương trình, hoạt động nổi bật và thông báo quan trọng từ hệ thống.
                    </Paragraph>
                  </div>
                  {/* Search bar - only one, above news list */}
                  <div className="flex justify-end w-full mb-4">
                    <div className="relative">
                      {!searchOpen ? (
                        <button
                          className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md border border-blue-200 hover:bg-blue-50 transition-all focus:outline-none"
                          onClick={() => setSearchOpen(true)}
                          aria-label="Tìm kiếm tin tức"
                        >
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      ) : (
                        <div className="flex items-center bg-white rounded-full shadow-md border border-blue-200 px-4 py-2 w-64 transition-all">
                          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          <input
                            ref={searchInputRef}
                            type="text"
                            className="flex-1 outline-none bg-transparent text-base text-blue-700 placeholder-gray-400"
                            placeholder="Tìm kiếm tin tức..."
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                            onBlur={() => setSearchOpen(false)}
                          />
                          {searchValue && (
                            <button
                              className="ml-2 text-gray-400 hover:text-blue-600 focus:outline-none"
                              onClick={() => setSearchValue("")}
                              tabIndex={-1}
                              aria-label="Xóa tìm kiếm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* News List - Pagination */}
                  <div className="space-y-5 mt-4 animate-fadeInUp text-left w-full" style={{ animationDelay: "0.6s" }}>
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
                          {/* Hiển thị ảnh nếu có */}
                          {item.image && (
                            <div className="mb-3 flex justify-center">
                              <img
                                src={item.image}
                                alt={item.title}
                                style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 12, objectFit: "cover" }}
                                onError={e => { e.target.style.display = "none"; }}
                              />
                            </div>
                          )}
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
                  {newsList.length > 4 && (
                    <div className="flex justify-center pt-4">
                      <Pagination
                        current={currentPage}
                        pageSize={currentPageSize}
                        total={newsList.length}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={true}
                        pageSizeOptions={['5', '10', '20', '50']}
                        showQuickJumper={true}
                        size="default"
                        className="custom-pagination"
                        showTotal={(total, range) => 
                          `${range[0]}-${range[1]} của ${total} tin tức`
                        }
                        onShowSizeChange={(current, size) => {
                          setCurrentPageSize(Number(size));
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
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
              // Xóa maxHeight và overflow để không còn thanh kéo
            }
          }}
        >
          {selectedNews && (
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs">
                    {selectedNews.date}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight text-center">
                  {selectedNews.title}
                </h1>
              
               
                {/* Ảnh lớn */}
                {selectedNews.image && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={selectedNews.image}
                      alt={selectedNews.title}
                      style={{
                        width: "100%",
                        height: "auto",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: 12,
                        boxShadow: "0 4px 24px rgba(59,130,246,0.08)",
                        border: "2px solid #e0e7ef",
                        background: "#f0f9ff",
                        display: selectedNews.image ? "block" : "none"
                      }}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
                {/* Nếu không có ảnh hoặc ảnh lỗi, hiển thị placeholder */}
                {!selectedNews.image && (
                  <div className="flex justify-center mb-4">
                    <div style={{
                      width: 200,
                      height: 120,
                      background: "#e5e7eb",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      fontSize: 32,
                      fontWeight: 600
                    }}>
                      Không có ảnh
                    </div>
                  </div>
                )}
                {/* Tóm tắt */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4 text-gray-700 text-base text-center">
                  {selectedNews.content}
                </div>
                {/* Nội dung chi tiết */}
                <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line mb-4 text-justify">
                  {selectedNews.fullContent}
                </div>
                {/* Footer Info */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-200 mt-6">
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <span>🆔</span>
                    <span>ID tin tức: {selectedNews.id}</span>
                  </span>
                  <span className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    <span>✅</span>
                    <span>Đã xuất bản</span>
                  </span>
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