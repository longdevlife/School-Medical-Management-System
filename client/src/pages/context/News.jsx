import React from "react";
import { Card, List, Typography } from "antd";

const data = [
  {
    title: "Đối tượng cần tiêm nhắc lại vaccine COVID-19",
    description:
      "Trước tình hình dịch bệnh có xu hướng gia tăng trở lại tại một số khu vực, Bộ Y tế nhấn mạnh người dân cần tiêm vắc xin mũi nhắc lại để bảo vệ sức khỏe cộng đồng.",
    image: "https://cdn.pixabay.com/photo/2021/02/20/07/22/vaccine-6038423_960_720.jpg",
    link: "https://baochinhphu.vn/doi-tuong-can-tiem-nhac-lai-vaccine-covid-19-102240124165123475.htm#:~:text=Theo%20%C4%91%C3%B3%2C%20quan%20%C4%91i%E1%BB%83m%20chung,sau%20m%C5%A9i%20ti%C3%AAm%20cu%E1%BB%91i%20c%C3%B9ng."
  },
  {
    title: "Cảnh báo sốt xuất huyết gia tăng mạnh ở miền Nam",
    description:
      "Tình hình thời tiết nóng ẩm khiến số ca sốt xuất huyết tăng nhanh. Người dân cần loại bỏ các ổ muỗi, ngủ mùng và vệ sinh môi trường xung quanh.",
    image: "https://cdn.pixabay.com/photo/2020/04/01/20/57/mosquito-4992751_960_720.jpg",
    link: "https://moh.gov.vn/web/guest/-/canh-bao-sot-xuat-huyet-gia-tang-manh-o-mien-nam"
  },
  {
    title: "Nguy cơ thiếu máu trầm trọng tại các bệnh viện",
    description:
      "Các trung tâm huyết học báo động thiếu máu trong mùa hè, kêu gọi cộng đồng tham gia hiến máu nhân đạo để cứu giúp bệnh nhân.",
    image: "https://cdn.pixabay.com/photo/2016/06/27/20/35/donation-1481704_960_720.jpg",
    link: "https://moh.gov.vn/web/guest/-/nguy-co-thieu-mau-tram-trong-tai-cac-benh-vien"
  },
];

const News = () => {
  return (
    <Card
      title="📰 Tin Tức Y Tế Mới Nhất"
      style={{ margin: 24, background: "#fff", borderRadius: 8 }}
      bordered={false}
    >
      <List
        itemLayout="vertical"
        size="large"
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            key={item.title}
            extra={
              <img
                width={200}
                alt="ảnh y tế"
                src={item.image}
                style={{ borderRadius: 8 }}
              />
            }
          >
            <List.Item.Meta
              title={
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#1890ff", fontWeight: "bold" }}
                >
                  {item.title}
                </a>
              }
              description={<Typography.Text>{item.description}</Typography.Text>}
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default News;
