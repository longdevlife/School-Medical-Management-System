import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, InputNumber, Checkbox, Button, Row, Col, Card, notification } from 'antd';
import styles from './HealthCheckupForm.module.css';

const { TextArea } = Input;
const { Option } = Select;

function HealthCheckupForm() {
  const [form] = Form.useForm();

  const calculateBMI = (height, weight) => {
    if (height && weight) {
      const heightInM = height / 100;
      const bmi = weight / (heightInM * heightInM);
      return Math.round(bmi * 10) / 10;
    }
    return null;
  };

  // Watch height và weight để tự động tính BMI
  const height = Form.useWatch('height', form);
  const weight = Form.useWatch('weight', form);

   // Hàm tự động tính BMI khi height hoặc weight thay đổi
  useEffect(() => {
    const bmi = calculateBMI(height, weight);
    if (bmi) {
      form.setFieldsValue({ bmi });
    }
  }, [height, weight, form]);
   

  const handleSubmit = (values) => {
    console.log('Health checkup data:', values);

    //hiển thị thông báo lưu thành công 
    
  };

  return (
    <Card className={styles.healthCheckupCard}>
      <div className={styles.header}>
        <h2>Thông tin kiểm tra sức khỏe</h2>
        <div className={styles.divider}></div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={styles.form}
      >
        <Row gutter={[24, 16]}>
          {/* Cột trái */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Mã kiểm tra sức khỏe :"
              name="healthCheckupCode"
              rules={[{ required: true, message: 'Vui lòng nhập mã kiểm tra!' }]}
            >
              <Input placeholder="HC001" />
            </Form.Item>

            <Form.Item
              label="Mã học sinh :"
              name="studentCode"
              rules={[{ required: true, message: 'Vui lòng nhập mã học sinh!' }]}
            >
              <Input placeholder="HS001" />
            </Form.Item>

            <Form.Item
              label="Ngày kiểm tra :"
              name="checkupDate"
              rules={[{ required: true, message: 'Vui lòng chọn ngày kiểm tra!' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Chiều cao (cm) :"
              name="height"
              rules={[{ required: true, message: 'Vui lòng nhập chiều cao!' }]}
            >
              <InputNumber 
                min={0} 
                max={250} 
                placeholder="150" 
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Cân nặng (kg) :"
              name="weight"
              rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
            >
              <InputNumber 
                min={0} 
                max={200} 
                step={0.1}
                placeholder="45.5" 
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              label="Chỉ số khối cơ thể (BMI) :"
              name="bmi"
            >
              <InputNumber 
                min={0} 
                max={50} 
                step={0.1}
                placeholder="19.5" 
                style={{ width: '100%' }}
                disabled
              />
            </Form.Item>

            <Form.Item
              label="Thị lực mắt trái :"
              name="leftEyeVision"
            >
              <Select placeholder="Chọn thị lực">
                <Option value="10/10">10/10</Option>
                <Option value="9/10">9/10</Option>
                <Option value="8/10">8/10</Option>
                <Option value="7/10">7/10</Option>
                <Option value="6/10">6/10</Option>
                <Option value="5/10">5/10 trở xuống</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Thị lực mắt phải :"
              name="rightEyeVision"
            >
              <Select placeholder="Chọn thị lực">
                <Option value="10/10">10/10</Option>
                <Option value="9/10">9/10</Option>
                <Option value="8/10">8/10</Option>
                <Option value="7/10">7/10</Option>
                <Option value="6/10">6/10</Option>
                <Option value="5/10">5/10 trở xuống</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Cột phải */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Mã phụ huynh :"
              name="parentCode"
            >
              <Input placeholder="PH001" />
            </Form.Item>

            <Form.Item
              label="Huyết áp :"
              name="bloodPressure"
            >
              <Input placeholder="120/80 mmHg" />
            </Form.Item>

            <Form.Item
              label="Sức khỏe răng miệng :"
              name="oralHealth"
            >
              <Select placeholder="Chọn tình trạng">
                <Option value="good">Tốt</Option>
                <Option value="fair">Khá</Option>
                <Option value="poor">Cần chú ý</Option>
                <Option value="treatment">Cần điều trị</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Da (kiểm tra tình trạng da) :"
              name="skinCondition"
            >
              <Select placeholder="Chọn tình trạng da">
                <Option value="normal">Bình thường</Option>
                <Option value="dry">Khô</Option>
                <Option value="oily">Nhờn</Option>
                <Option value="allergic">Dị ứng</Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Thính giác :"
              name="hearing"
            >
              <Select placeholder="Chọn tình trạng thính giác">
                <Option value="normal">Bình thường</Option>
                <Option value="mild">Giảm nhẹ</Option>
                <Option value="moderate">Giảm vừa</Option>
                <Option value="severe">Giảm nặng</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Tim mạch :"
              name="cardiovascular"
            >
              <Select placeholder="Chọn tình trạng tim mạch">
                <Option value="normal">Bình thường</Option>
                <Option value="irregular">Bất thường</Option>
                <Option value="murmur">Tiếng thổi</Option>
                <Option value="other">Cần theo dõi</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Thực hiện bởi :"
              name="performedBy"
              rules={[{ required: true, message: 'Vui lòng nhập tên người thực hiện!' }]}
            >
              <Input placeholder="BS. Nguyễn Văn A" />
            </Form.Item>

            <Form.Item
              label="Ghi chú :"
              name="notes"
            >
              <TextArea 
                rows={4} 
                placeholder="Ghi chú thêm về tình trạng sức khỏe..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: 24 }}>
          <Col>
            <Button type="primary" htmlType="submit" size="large">
              Lưu thông tin khám sức khỏe
            </Button>
            <Button style={{ marginLeft: 16 }} size="large">
              Hủy bỏ
            </Button>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default HealthCheckupForm;