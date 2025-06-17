import React from "react";
import { Card, Row, Col, Typography, Divider } from "antd";
import { PhoneOutlined, FireOutlined, SafetyOutlined, FileTextOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import "./HomePages.css";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const newsItems = [
    {
      title: "Đại hội Đảng bộ Cục Bảo trợ xã hội lần thứ nhất, nhiệm kỳ 2025-2030",
      image: "https://img.freepik.com/free-vector/business-team-putting-together-jigsaw-puzzle-isolated-flat-vector-illustration-cartoon-partners-working-connection-teamwork-partnership-cooperation-concept_74855-9814.jpg",
      link: "/tin-tuc/dai-hoi-dang-bo-cuc-bao-tro-xa-hoi"
    },
    {
      title: "Thứ trưởng Đỗ Xuân Tuyên khai mạc Hội nghị Diễn đàn FHH",
      image: "https://img.freepik.com/free-vector/business-conference-concept-illustration_114360-1069.jpg",
      link: "/tin-tuc/hoi-nghi-dien-dan-fhh"
    },
    {
      title: "Bộ Y tế bổ nhiệm Phó Giám đốc Bệnh viện TW Huế",
      image: "https://img.freepik.com/free-vector/medical-team-concept-illustration_114360-2115.jpg",
      link: "/tin-tuc/bo-y-te-bo-nhiem-pho-giam-doc-bv-tw-hue"
    }
  ];

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <Title level={1} className="hero-title">
            Hệ Thống Quản Lý Y Tế Học Đường
          </Title>
          <Paragraph className="hero-description">
            Chào mừng bạn đến với hệ thống thông tin và quản lý y tế trực tuyến
          </Paragraph>
          <div className="hotline">
            <PhoneOutlined /> Đường dây nóng Y tế: 
            <span className="phone-number">0243 906 9333 - 0837 069 333</span>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://img.freepik.com/free-vector/medical-team-concept-illustration_114360-2115.jpg" alt="Medical Team" />
        </div>
      </div>

      {/* News Section */}
      <div className="section">
        <Title level={2} className="section-title">
          <FireOutlined /> Tin Nổi Bật
        </Title>
        <Row gutter={[24, 24]} className="news-grid">
          {newsItems.map((item, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Link to={item.link} className="news-link">
                <Card 
                  hoverable 
                  className="news-card"
                  cover={<img alt={item.title} src={item.image} />}
                >
                  <Card.Meta title={item.title} />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>

      {/* COVID-19 Section */}
      <div className="section covid-section">
        <Title level={2} className="section-title">
          <SafetyOutlined /> Phòng, chống dịch COVID-19
        </Title>
        <Row gutter={24} align="middle">
          <Col xs={24} md={12}>
            <img 
              src="https://img.freepik.com/free-vector/covid-19-protection-concept-illustration_114360-7770.jpg" 
              alt="COVID-19 Protection" 
              className="covid-image"
            />
          </Col>
          <Col xs={24} md={12}>
            <Paragraph className="covid-content">
              Tiếp tục đẩy mạnh các biện pháp phòng chống dịch, đảm bảo cung ứng đủ thuốc, 
              trang thiết bị y tế và nhân lực. Tăng cường công tác tuyên truyền, nâng cao 
              nhận thức của người dân về phòng chống dịch bệnh.
            </Paragraph>
          </Col>
        </Row>
      </div>

      {/* Policy Section */}
      <div className="section policy-section">
        <Title level={2} className="section-title">
          <FileTextOutlined /> Chính sách Y tế
        </Title>
        <Row gutter={24} align="middle">
          <Col xs={24} md={12}>
            <Paragraph className="policy-content">
              Xây dựng và triển khai các chính sách cải cách hành chính, nâng cao chất lượng 
              khám chữa bệnh, phát triển y tế cơ sở. Đẩy mạnh ứng dụng công nghệ thông tin 
              trong quản lý y tế, tạo điều kiện thuận lợi cho người dân tiếp cận dịch vụ y tế.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <img 
              src="https://img.freepik.com/free-vector/healthcare-workers-concept-illustration_114360-1516.jpg" 
              alt="Healthcare Policy" 
              className="policy-image"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HomePage;
