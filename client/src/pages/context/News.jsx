import React from "react";
import { Typography, Row, Col, Card, Tag, Button, Input } from "antd";
import { SearchOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./News.css";

const { Title, Paragraph } = Typography;
const { Search } = Input;

const News = () => {
  const newsItems = [
    {
      id: 1,
      title: "Hướng dẫn phòng chống dịch COVID-19 trong trường học",
      summary: "Các biện pháp phòng chống dịch COVID-19 cần được thực hiện nghiêm ngặt trong môi trường học đường...",
      image: "https://img.freepik.com/free-vector/coronavirus-protection-concept-illustration_114360-7484.jpg",
      date: "15/03/2024",
      author: "BS. Nguyễn Văn A",
      category: "Sức khỏe",
      tags: ["COVID-19", "Phòng dịch", "Học đường"]
    },
    {
      id: 2,
      title: "Chương trình khám sức khỏe định kỳ cho học sinh",
      summary: "Nhà trường tổ chức chương trình khám sức khỏe định kỳ cho toàn bộ học sinh vào tháng 4/2024...",
      image: "https://img.freepik.com/free-vector/medical-check-up-concept-illustration_114360-7484.jpg",
      date: "10/03/2024",
      author: "ThS. Trần Thị B",
      category: "Sự kiện",
      tags: ["Khám sức khỏe", "Định kỳ", "Học sinh"]
    },
    {
      id: 3,
      title: "Tư vấn dinh dưỡng cho học sinh tiểu học",
      summary: "Chương trình tư vấn dinh dưỡng giúp học sinh có chế độ ăn uống hợp lý và khoa học...",
      image: "https://img.freepik.com/free-vector/nutrition-concept-illustration_114360-1003.jpg",
      date: "05/03/2024",
      author: "BS. Lê Văn C",
      category: "Dinh dưỡng",
      tags: ["Dinh dưỡng", "Tiểu học", "Tư vấn"]
    },
    {
      id: 4,
      title: "Hội thảo về sức khỏe tâm lý học đường",
      summary: "Hội thảo cung cấp kiến thức và kỹ năng cho giáo viên trong việc hỗ trợ sức khỏe tâm lý học sinh...",
      image: "https://img.freepik.com/free-vector/psychologist-concept-illustration_114360-8007.jpg",
      date: "01/03/2024",
      author: "TS. Phạm Thị D",
      category: "Tâm lý",
      tags: ["Tâm lý", "Học đường", "Hội thảo"]
    }
  ];

  const categories = [
    { name: "Tất cả", count: 12 },
    { name: "Sức khỏe", count: 4 },
    { name: "Sự kiện", count: 3 },
    { name: "Dinh dưỡng", count: 2 },
    { name: "Tâm lý", count: 3 }
  ];

  return (
    <div className="news-container">
      {/* Hero Section */}
      <div className="news-hero">
        <Title level={1}>Tin Tức Y Tế Học Đường</Title>
        <Paragraph className="hero-description">
          Cập nhật những thông tin mới nhất về sức khỏe, dinh dưỡng và các hoạt động y tế trong trường học
        </Paragraph>
        <Search
          placeholder="Tìm kiếm tin tức..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          className="news-search"
        />
      </div>

      <Row gutter={[24, 24]}>
        {/* Main Content */}
        <Col xs={24} lg={18}>
          <Row gutter={[24, 24]}>
            {newsItems.map((item) => (
              <Col xs={24} md={12} key={item.id}>
                <Link to={`/news/${item.id}`} className="news-link">
                  <Card
                    hoverable
                    className="news-card"
                    cover={
                      <div className="news-image-container">
                        <img alt={item.title} src={item.image} />
                        <Tag color="blue" className="news-category">
                          {item.category}
                        </Tag>
                      </div>
                    }
                  >
                    <Title level={4} className="news-title">
                      {item.title}
                    </Title>
                    <Paragraph className="news-summary">{item.summary}</Paragraph>
                    <div className="news-meta">
                      <span>
                        <CalendarOutlined /> {item.date}
                      </span>
                      <span>
                        <UserOutlined /> {item.author}
                      </span>
                    </div>
                    <div className="news-tags">
                      {item.tags.map((tag, index) => (
                        <Tag key={index} color="default">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={6}>
          <Card className="sidebar-card">
            <Title level={4}>Danh Mục</Title>
            <div className="category-list">
              {categories.map((category, index) => (
                <div key={index} className="category-item">
                  <span>{category.name}</span>
                  <span className="category-count">({category.count})</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="sidebar-card">
            <Title level={4}>Tin Tức Nổi Bật</Title>
            <div className="featured-news">
              {newsItems.slice(0, 3).map((item) => (
                <Link to={`/news/${item.id}`} key={item.id} className="featured-news-item">
                  <img src={item.image} alt={item.title} />
                  <div className="featured-news-content">
                    <Title level={5}>{item.title}</Title>
                    <span className="featured-news-date">{item.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default News; 