import React from "react";
import { Typography, Row, Col, Card, Divider } from "antd";
import {
  TeamOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import "./Information.css";

const { Title, Paragraph } = Typography;

const Information = () => {
  const departments = [
    {
      title: "Phòng Y tế Học đường",
      description: "Quản lý và chăm sóc sức khỏe cho học sinh, tổ chức khám sức khỏe định kỳ và theo dõi tình hình sức khỏe của học sinh.",
      icon: <MedicineBoxOutlined />,
      image: "https://img.freepik.com/free-vector/medical-team-concept-illustration_114360-2115.jpg"
    },
    {
      title: "Phòng Tư vấn Tâm lý",
      description: "Hỗ trợ tư vấn tâm lý cho học sinh, giúp các em vượt qua khó khăn trong học tập và cuộc sống.",
      icon: <HeartOutlined />,
      image: "https://img.freepik.com/free-vector/psychologist-concept-illustration_114360-8007.jpg"
    },
    {
      title: "Phòng Dinh dưỡng",
      description: "Xây dựng thực đơn dinh dưỡng hợp lý, đảm bảo sức khỏe và phát triển toàn diện cho học sinh.",
      icon: <SafetyCertificateOutlined />,
      image: "https://img.freepik.com/free-vector/nutrition-concept-illustration_114360-1003.jpg"
    }
  ];

  const teamMembers = [
    {
      name: "TS. Nguyễn Văn A",
      position: "Trưởng phòng Y tế",
      image: "https://img.freepik.com/free-vector/doctor-character-avatar-illustration_24877-506.jpg"
    },
    {
      name: "ThS. Trần Thị B",
      position: "Phó phòng Y tế",
      image: "https://img.freepik.com/free-vector/doctor-character-avatar-illustration_24877-506.jpg"
    },
    {
      name: "BS. Lê Văn C",
      position: "Bác sĩ phụ trách",
      image: "https://img.freepik.com/free-vector/doctor-character-avatar-illustration_24877-506.jpg"
    }
  ];

  return (
    <div className="information-container">
      {/* Giới thiệu chung */}
      <div className="intro-section">
        <Title level={1} className="main-title">
          Giới Thiệu Về Phòng Y Tế Học Đường
        </Title>
        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <Paragraph className="intro-text">
              Phòng Y tế học đường là đơn vị chuyên môn trực thuộc nhà trường, có nhiệm vụ 
              chăm sóc sức khỏe ban đầu cho học sinh, tổ chức khám sức khỏe định kỳ, theo dõi 
              và quản lý sức khỏe học sinh. Với đội ngũ y bác sĩ giàu kinh nghiệm và trang 
              thiết bị y tế hiện đại, chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe 
              tốt nhất cho học sinh.
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <img 
              src="https://img.freepik.com/free-vector/medical-team-concept-illustration_114360-2115.jpg" 
              alt="Medical Team" 
              className="intro-image"
            />
          </Col>
        </Row>
      </div>

      {/* Các phòng ban */}
      <div className="departments-section">
        <Title level={2} className="section-title">
          <TeamOutlined /> Các Phòng Ban
        </Title>
        <Row gutter={[24, 24]}>
          {departments.map((dept, index) => (
            <Col xs={24} md={8} key={index}>
              <Card 
                hoverable 
                className="department-card"
                cover={<img alt={dept.title} src={dept.image} />}
              >
                <div className="department-icon">{dept.icon}</div>
                <Title level={3}>{dept.title}</Title>
                <Paragraph>{dept.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Đội ngũ nhân viên */}
      <div className="team-section">
        <Title level={2} className="section-title">
          <TeamOutlined /> Đội Ngũ Nhân Viên
        </Title>
        <Row gutter={[24, 24]}>
          {teamMembers.map((member, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card className="team-card">
                <div className="team-member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <Title level={4}>{member.name}</Title>
                <Paragraph>{member.position}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Thông tin liên hệ */}
      <div className="contact-section">
        <Title level={2} className="section-title">
          Thông Tin Liên Hệ
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card className="contact-card">
              <Title level={4}>Địa Chỉ</Title>
              <Paragraph>
                123 Đường ABC, Quận XYZ<br />
                Thành phố Hồ Chí Minh
              </Paragraph>
              <Title level={4}>Điện Thoại</Title>
              <Paragraph>
                Hotline: 0243 906 9333<br />
                Đường dây nóng: 0837 069 333
              </Paragraph>
              <Title level={4}>Email</Title>
              <Paragraph>ytehocduong@example.com</Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <div className="map-container">
              <img 
                src="https://img.freepik.com/free-vector/city-map-with-streets-buildings_107791-1090.jpg" 
                alt="Map" 
                className="map-image"
              />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Information;
