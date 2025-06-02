import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";

function NurseDashboard() {
  return (
    <div>
      <h1>Tổng quan</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={150}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Số lượng thuốc"
              value={45}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sự kiện sắp tới"
              value={3}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Nhân viên y tế"
              value={5}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default NurseDashboard;
