import React from "react";
import { Card, Row, Col, Typography, Image } from "antd";

const { Title, Paragraph } = Typography;

const Information = () => {
  return (
    <Card style={{ margin: 24, borderRadius: 8 }} bordered={false}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Image
            src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80"
            alt="Hình ảnh trường học"
            style={{ borderRadius: 8 }}
          />
        </Col>
        <Col xs={24} md={12}>
          <Title level={2}>Giới thiệu Trường Trung học ABC</Title>
          <Paragraph>
            Trường Trung học ABC là một trong những cơ sở giáo dục hàng đầu trong khu vực,
            với môi trường học tập năng động, đội ngũ giáo viên tận tâm và cơ sở vật chất hiện đại.
          </Paragraph>
          <Paragraph>
            Sứ mệnh của chúng tôi là nuôi dưỡng tài năng, phát triển tư duy phản biện và trang bị cho học sinh
            những kỹ năng cần thiết để thành công trong tương lai.
          </Paragraph>
          <Paragraph>
            Các chương trình giảng dạy tại trường kết hợp giữa kiến thức học thuật và hoạt động ngoại khóa,
            giúp học sinh phát triển toàn diện về cả trí tuệ và nhân cách.
          </Paragraph>
        </Col>
      </Row>
    </Card>
  );
};

export default Information;
