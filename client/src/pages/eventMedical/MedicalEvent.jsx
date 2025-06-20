import React from 'react';
import { Card, Typography, Descriptions } from 'antd';
import styles from './MedicalEvent.module.css';

const { Title } = Typography;

const MedicalEvent = () => {
  const eventData = {
    eventId: "EV2024031501",
    dateTime: {
      time: "9:30 AM",
      date: "6/3/2025"
    },
    description: "Học sinh than phiền đau đầu và chóng mặt trong giờ học Toán. Các triệu chứng bao gồm: nhức đầu vùng trán, hoa mắt, và mệt mỏi.",
    treatment: "• Cho học sinh nghỉ ngơi tại phòng y tế trong 30 phút\n• Đo nhiệt độ và huyết áp\n• Cho uống thuốc giảm đau (Paracetamol 250mg)\n• Đã thông báo cho phụ huynh",
    notes: "Học sinh có tiền sử đau nửa đầu. Cần theo dõi thêm và đề xuất khám chuyên khoa nếu tình trạng tái diễn.",
    nurseId: "N2024005",
    eventTypeId: "ET003"
  };

  return (
    <div className={styles.eventContainer}>
      <Card className={styles.eventCard}>
        <Title level={2} className={styles.title}>Sự Kiện Y Tế</Title>
        
        <Descriptions bordered column={1} className={styles.descriptions}>
          <Descriptions.Item label="Mã sự kiện" className={styles.eventId}>
            {eventData.eventId}
          </Descriptions.Item>
          
          <Descriptions.Item label="Ngày xảy ra sự kiện">
            <div>
              {eventData.dateTime.time}
              <br />
              {eventData.dateTime.date}
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Mô tả" className={styles.description}>
            {eventData.description}
          </Descriptions.Item>
          
          <Descriptions.Item label="Biện pháp xử lý" className={styles.treatment}>
            <div className={styles.treatmentContent}>
              {eventData.treatment.split('\n').map((item, index) => (
                <div key={index}>{item}</div>
              ))}
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Chú thích" className={styles.notes}>
            {eventData.notes}
          </Descriptions.Item>
          
          <Descriptions.Item label="Mã y tá thực hiện">
            {eventData.nurseId}
          </Descriptions.Item>
          
          <Descriptions.Item label="Mã kiểu sự kiện">
            {eventData.eventTypeId}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default MedicalEvent;
