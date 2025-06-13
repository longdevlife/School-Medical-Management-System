import React from "react";
import { Card } from "antd";

const HomePage = () => {
  return (
    <Card style={{ margin: 24 }}>
         <h1 style={{ color: "#0066cc" }}>School medical management system</h1>
      <p>Chào mừng bạn đến với hệ thống thông tin và quản lý y tế trực tuyến.</p>
      <hr />
      <h3 style={{ color: "#d80027" }}>📞 Đường dây nóng Y tế: 0243 906 9333 - 0837 069 333</h3>

      <h3 style={{ marginTop: 16, color: "#0d47a1" }}>📰 Tin Nổi Bật</h3>
      <ul>
        <li>✅ Đại hội Đảng bộ Cục Bảo trợ xã hội lần thứ nhất, nhiệm kỳ 2025-2030</li>
        <li>✅ Thứ trưởng Đỗ Xuân Tuyên khai mạc Hội nghị Diễn đàn FHH</li>
        <li>✅ Bộ Y tế bổ nhiệm Phó Giám đốc Bệnh viện TW Huế</li>
      </ul>

      <h3 style={{ marginTop: 16, color: "#0d47a1" }}>🛡️ Phòng, chống dịch COVID-19</h3>
      <p>
        Tiếp tục đẩy mạnh các biện pháp phòng chống dịch, đảm bảo cung ứng đủ thuốc, trang thiết bị y tế và nhân lực.
      </p>

      <h3 style={{ marginTop: 16, color: "#0d47a1" }}>📌 Chính sách Y tế</h3>
      <p>
        Xây dựng và triển khai các chính sách cải cách hành chính, nâng cao chất lượng khám chữa bệnh, phát triển y tế cơ sở.
      </p>
    </Card>
  );
};

export default HomePage;
