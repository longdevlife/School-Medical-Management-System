import React from "react";
import { Card, List, Tag, Button, Space, Grid } from "antd";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";

function EventsPage() {
  const events = [
    {
      id: 1,
      title: "Khám sức khỏe định kỳ",
      date: "15/03/2024",
      time: "08:00 - 11:00",
      location: "Phòng y tế",
      status: "Sắp diễn ra",
    },
    {
      id: 2,
      title: "Tư vấn dinh dưỡng",
      date: "20/03/2024",
      time: "14:00 - 16:00",
      location: "Hội trường",
      status: "Sắp diễn ra",
    },
    // Thêm sự kiện khác ở đây
  ];
  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Sự kiện Y tế</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm sự kiện
        </Button>
      </div>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={events}
        renderItem={(item) => (
          <List.Item>
            <Card
              title={item.title}
              extra={
                <Tag color={item.status === "Sắp diễn ra" ? "blue" : "green"}>
                  {item.status}
                </Tag>
              }
            >
              <p>
                <CalendarOutlined /> {item.date} - {item.time}
              </p>
              <p>Địa điểm: {item.location}</p>
              <Space>
                <Button type="link">Chi tiết</Button>
                <Button type="link">Sửa</Button>
                <Button type="link" danger>
                  Xóa
                </Button>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export default EventsPage;
