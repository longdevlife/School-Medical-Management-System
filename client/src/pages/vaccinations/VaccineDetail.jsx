import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Timeline, Button, Tag, Statistic, Row, Col, Form, Radio, Input, Modal, notification } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import "./VaccineDetail.css";

// Dữ liệu mẫu cho từng section
const vaccineData = [
  {
    id: 'history',
    content: {
      recentVaccines: [
        {
          name: 'MMR (Sởi, Quai bị, Rubella)',
          date: '15/03/2023',
          status: 'completed',
          nurse: 'BS. Nguyễn Văn A',
          location: 'Phòng khám đa khoa ABC'
        },
        {
          name: 'Tdap (Bạch hầu, Uốn ván, Ho gà)',
          date: '20/06/2023',
          status: 'completed',
          nurse: 'YT. Trần Thị B',
          location: 'Bệnh viện Nhi Đồng'
        },
        {
          name: 'Flu Shot',
          date: '10/12/2024',
          status: 'scheduled',
          nurse: 'YT. Lê Văn C',
          location: 'Phòng khám đa khoa XYZ'
        }
      ],
      stats: {
        totalVaccines: 8,
        completedVaccines: 6,
        upcomingVaccines: 2
      }
    }
  },
  {
    id: 'results',
    content: {
      vaccineResults: [
        {
          name: 'MMR',
          status: 'Đạt yêu cầu',
          date: '15/03/2023',
          nextDose: null,
          notes: 'Phản ứng bình thường, không có tác dụng phụ'
        },
        {
          name: 'Tdap',
          status: 'Đạt yêu cầu',
          date: '20/06/2023',
          nextDose: '20/06/2026',
          notes: 'Cần tiêm nhắc lại sau 3 năm'
        },
        {
          name: 'Flu Shot',
          status: 'Cần tiêm nhắc',
          date: '10/12/2024',
          nextDose: '10/12/2025',
          notes: 'Tiêm nhắc hàng năm'
        }
      ],
      overallStatus: 'good'
    }
  },
  {
    id: 'requirements',
    content: {
      requiredVaccines: [
        {
          name: 'MMR (Sởi, Quai bị, Rubella)',
          required: true,
          doseCount: 2,
          ageRange: '12-15 tháng, 4-6 tuổi',
          status: 'completed'
        },
        {
          name: 'Tdap (Bạch hầu, Uốn ván, Ho gà)',
          required: true,
          doseCount: 5,
          ageRange: '2, 4, 6, 15-18 tháng, 4-6 tuổi',
          status: 'in-progress'
        },
        {
          name: 'Varicella (Thủy đậu)',
          required: true,
          doseCount: 2,
          ageRange: '12-15 tháng, 4-6 tuổi',
          status: 'pending'
        }
      ],
      nextRequired: {
        vaccine: 'Varicella',
        dueDate: '15/04/2024'
      },
      upcomingVaccine: {
        name: 'Varicella (Thủy đậu)',
        date: '15/04/2024',
        nurse: 'Nguyễn Văn A',
        location: 'Hall C (Trường Tiểu học FPT)',
        time: '09:30',
        notes: 'Mang theo sổ tiêm chủng và đến trước 15 phút'
      },
      consentForm: {
        patientInfo: {
          name: 'Lê Văn Bình',
          dob: '22-09-2004',
          parentName: 'Nguyễn Thị Hạnh',
          phone: '0853643832'
        }
      }
    }
  }
];

const VaccineDetail = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { id } = useParams();
  const vaccine = vaccineData.find((v) => v.id === id);

  const handleConsentSubmit = (values) => {
    console.log('Form values:', values);
    notification.success({
      message: 'Đã gửi phản hồi',
      description: values.consent === 'agree' 
        ? 'Cảm ơn bạn đã đồng ý. Chúng tôi sẽ gửi thông tin chi tiết qua SMS.' 
        : 'Cảm ơn phản hồi của bạn. Chúng tôi sẽ liên hệ lại sau.',
    });
    setIsModalOpen(false);
  };

  if (!vaccine) {
    return (
      <div className="vaccine-detail-container">
        <Link to="/parent/vaccinations" className="back-button">
          ← Quay lại
        </Link>
        <div className="not-found">
          <h2>Không tìm thấy thông tin</h2>
          <p>Thông tin về mục tiêm chủng này không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  const renderHistoryContent = () => (
    <div className="history-content">
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={8}>
          <Statistic 
            title="Tổng số vắc xin" 
            value={vaccine.content.stats.totalVaccines}
            className="stat-card"
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic 
            title="Đã tiêm" 
            value={vaccine.content.stats.completedVaccines}
            className="stat-card completed"
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic 
            title="Sắp tới" 
            value={vaccine.content.stats.upcomingVaccines}
            className="stat-card upcoming"
          />
        </Col>
      </Row>
      <Card title="Lịch sử tiêm chủng gần đây" className="timeline-card">
        <Timeline
          items={vaccine.content.recentVaccines.map(v => ({
            color: v.status === 'completed' ? 'green' : 'blue',
            children: (
              <div className="timeline-item">
                <h4>{v.name}</h4>
                <p><CalendarOutlined /> {v.date}</p>
                <p>Y tá: {v.nurse}</p>
                <p>Địa điểm: {v.location}</p>
                <Tag color={v.status === 'completed' ? 'success' : 'processing'}>
                  {v.status === 'completed' ? 'Đã hoàn thành' : 'Đã lên lịch'}
                </Tag>
              </div>
            )
          }))}
        />
      </Card>
      <Button type="primary" size="large" className="action-button">
        Đặt lịch tiêm chủng
      </Button>
    </div>
  );

  const renderResultsContent = () => (
    <div className="results-content">
      <div className="overall-status">
        <h3>Tình trạng tổng quát</h3>
        {vaccine.content.overallStatus === 'good' ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Đạt yêu cầu
          </Tag>
        ) : (
          <Tag icon={<WarningOutlined />} color="warning">
            Cần chú ý
          </Tag>
        )}
      </div>
      <div className="results-grid">
        {vaccine.content.vaccineResults.map((result, index) => (
          <Card key={index} className="result-card">
            <h3>{result.name}</h3>
            <Tag color={result.status === 'Đạt yêu cầu' ? 'success' : 'warning'}>
              {result.status}
            </Tag>
            <p><CalendarOutlined /> Tiêm ngày: {result.date}</p>
            {result.nextDose && (
              <p className="next-dose">
                Tiêm nhắc lại: {result.nextDose}
              </p>
            )}
            <p className="notes">{result.notes}</p>
          </Card>
        ))}
      </div>
      <Button type="primary" size="large" className="action-button">
        Xem lịch tiêm nhắc
      </Button>
    </div>
  );

  const renderRequirementsContent = () => (
    <div className="requirements-content">
      <Card className="upcoming-vaccine-card">
        <h2>Lịch tiêm chủng sắp tới</h2>
        <div className="vaccine-info">
          <h3>{vaccine.content.upcomingVaccine.name}</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Ngày tiêm:</label>
              <p>{vaccine.content.upcomingVaccine.date}</p>
            </div>
            <div className="info-item">
              <label>Thời gian:</label>
              <p>{vaccine.content.upcomingVaccine.time}</p>
            </div>
            <div className="info-item">
              <label>Y tá:</label>
              <p>{vaccine.content.upcomingVaccine.nurse}</p>
            </div>
            <div className="info-item">
              <label>Địa điểm:</label>
              <p>{vaccine.content.upcomingVaccine.location}</p>
            </div>
          </div>
          <div className="notes">
            <p><strong>Lưu ý:</strong> {vaccine.content.upcomingVaccine.notes}</p>
          </div>
        </div>
      </Card>

      <Card title="Đơn đồng ý tiêm chủng" className="consent-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleConsentSubmit}
          initialValues={{
            patientName: vaccine.content.consentForm.patientInfo.name,
            dob: vaccine.content.consentForm.patientInfo.dob,
            parentName: vaccine.content.consentForm.patientInfo.parentName,
            phone: vaccine.content.consentForm.patientInfo.phone
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ tên học sinh"
                name="patientName"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ngày sinh"
                name="dob"
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ tên phụ huynh"
                name="parentName"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="consent"
            label="Quyết định đồng ý tiêm chủng"
            rules={[{ required: true, message: 'Vui lòng chọn quyết định của bạn' }]}
          >
            <Radio.Group>
              <Radio value="agree">Đồng ý tiêm chủng</Radio>
              <Radio value="disagree">Không đồng ý tiêm chủng</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="note"
            label="Ghi chú (nếu có)"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="submit-button">
              Gửi phản hồi
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (id) {
      case 'history':
        return renderHistoryContent();
      case 'results':
        return renderResultsContent();
      case 'requirements':
        return renderRequirementsContent();
      default:
        return null;
    }
  };

  return (
    <div className="vaccine-detail-container">
      <Link to="/parent/vaccinations" className="back-button">
        ← Quay lại
      </Link>
      <div className="vaccine-detail-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default VaccineDetail;