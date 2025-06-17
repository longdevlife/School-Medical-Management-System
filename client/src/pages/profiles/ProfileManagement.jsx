/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Upload,
  Space,
  Tabs,
  Row,
  Col,
  Typography,
  Avatar,
  Tag,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  UploadOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

function ProfileManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();

  // Mock data - thay thế bằng API calls thực tế
  const studentsData = [
    {
      key: "1",
      id: "HS001",
      name: "Nguyễn Văn An",
      class: "1A",
      dateOfBirth: "2018-05-15",
      gender: "Nam",
      bloodType: "O+",
      weight: "25kg",
      height: "120cm",
      allergies: ["Đậu phộng", "Tôm cua"],
      chronicConditions: [],
      parentName: "Nguyễn Văn Bình",
      parentPhone: "0123456789",
      parentEmail: "nguyenvanbinh@email.com",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      emergencyContact: "0987654321",
      healthStatus: "Tốt",
      lastCheckup: "2024-11-15",
      vaccinations: [
        { name: "COVID-19", date: "2024-10-01", nextDue: "2025-10-01" },
        { name: "Sởi", date: "2023-05-01", nextDue: null },
      ],
      medications: [
        {
          name: "Vitamin D",
          dosage: "1 viên/ngày",
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        },
      ],
    },
    {
      key: "2",
      id: "HS002",
      name: "Trần Thị Bảo",
      class: "1B",
      dateOfBirth: "2018-08-20",
      gender: "Nữ",
      bloodType: "A+",
      weight: "23kg",
      height: "118cm",
      allergies: [],
      chronicConditions: ["Hen suyễn nhẹ"],
      parentName: "Trần Thị Cẩm",
      parentPhone: "0987654321",
      parentEmail: "tranthicam@email.com",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      emergencyContact: "0123456789",
      healthStatus: "Cần theo dõi",
      lastCheckup: "2024-11-20",
      vaccinations: [
        { name: "COVID-19", date: "2024-09-15", nextDue: "2025-09-15" },
      ],
      medications: [
        {
          name: "Ventolin",
          dosage: "Khi cần thiết",
          startDate: "2024-01-01",
          endDate: null,
        },
      ],
    },
  ];

  const columns = [
    {
      title: "Mã HS",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Lớp {record.class}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Tuổi",
      dataIndex: "dateOfBirth",
      key: "age",
      render: (dateOfBirth) => {
        const age =
          new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
        return `${age} tuổi`;
      },
      width: 80,
    },
    {
      title: "Tình trạng sức khỏe",
      dataIndex: "healthStatus",
      key: "healthStatus",
      render: (status) => {
        const color =
          status === "Tốt"
            ? "green"
            : status === "Cần theo dõi"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
      width: 150,
    },
    {
      title: "Dị ứng",
      dataIndex: "allergies",
      key: "allergies",
      render: (allergies) => (
        <div>
          {allergies.length > 0 ? (
            allergies.map((allergy, index) => (
              <Tag key={index} color="red" style={{ fontSize: "10px" }}>
                {allergy}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Không có</Text>
          )}
        </div>
      ),
      width: 150,
    },
    {
      title: "Khám gần nhất",
      dataIndex: "lastCheckup",
      key: "lastCheckup",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      width: 120,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewStudent(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => editStudent(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
      width: 120,
    },
  ];

  const viewStudent = (student) => {
    setSelectedStudent(student);
    setIsModalVisible(true);
  };

  const editStudent = (student) => {
    setSelectedStudent(student);
    form.setFieldsValue(student);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedStudent(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      console.log("Form values:", values);
      // Gọi API để lưu thông tin
      handleModalClose();
    } catch (error) {
      console.error("Error saving student data:", error);
    }
  };

  const HealthProfileDetails = ({ student }) => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Thông tin cơ bản">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Họ và tên: </Text>
                <Text>{student.name}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Mã học sinh: </Text>
                <Text>{student.id}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Lớp: </Text>
                <Text>{student.class}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Ngày sinh: </Text>
                <Text>
                  {new Date(student.dateOfBirth).toLocaleDateString("vi-VN")}
                </Text>
              </Col>
              <Col span={12}>
                <Text strong>Giới tính: </Text>
                <Text>{student.gender}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Nhóm máu: </Text>
                <Text>{student.bloodType}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Cân nặng: </Text>
                <Text>{student.weight}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Chiều cao: </Text>
                <Text>{student.height}</Text>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Thông tin y tế">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Tình trạng sức khỏe: </Text>
                <Tag
                  color={student.healthStatus === "Tốt" ? "green" : "orange"}
                >
                  {student.healthStatus}
                </Tag>
              </div>
              <div>
                <Text strong>Dị ứng: </Text>
                {student.allergies.length > 0 ? (
                  student.allergies.map((allergy, index) => (
                    <Tag key={index} color="red">
                      {allergy}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </div>
              <div>
                <Text strong>Bệnh mãn tính: </Text>
                {student.chronicConditions.length > 0 ? (
                  student.chronicConditions.map((condition, index) => (
                    <Tag key={index} color="orange">
                      {condition}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">Không có</Text>
                )}
              </div>
              <div>
                <Text strong>Khám gần nhất: </Text>
                <Text>
                  {new Date(student.lastCheckup).toLocaleDateString("vi-VN")}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Thông tin liên hệ">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div>
                <Text strong>Phụ huynh: </Text>
                <Text>{student.parentName}</Text>
              </div>
              <div>
                <Text strong>Số điện thoại: </Text>
                <Text>{student.parentPhone}</Text>
              </div>
              <div>
                <Text strong>Email: </Text>
                <Text>{student.parentEmail}</Text>
              </div>
              <div>
                <Text strong>Địa chỉ: </Text>
                <Text>{student.address}</Text>
              </div>
              <div>
                <Text strong>Liên hệ khẩn cấp: </Text>
                <Text>{student.emergencyContact}</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <Card
            title="Lịch sử tiêm chủng"
            extra={<SafetyCertificateOutlined />}
          >
            {student.vaccinations.map((vaccine, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "8px",
                  padding: "8px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                }}
              >
                <Space direction="vertical" size="small">
                  <Text strong>{vaccine.name}</Text>
                  <Text type="secondary">
                    Ngày tiêm:{" "}
                    {new Date(vaccine.date).toLocaleDateString("vi-VN")}
                  </Text>
                  {vaccine.nextDue && (
                    <Text type="secondary">
                      Mũi tiếp theo:{" "}
                      {new Date(vaccine.nextDue).toLocaleDateString("vi-VN")}
                    </Text>
                  )}
                </Space>
              </div>
            ))}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Thuốc đang sử dụng" extra={<MedicineBoxOutlined />}>
            {student.medications.map((medication, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "8px",
                  padding: "8px",
                  border: "1px solid #f0f0f0",
                  borderRadius: "6px",
                }}
              >
                <Space direction="vertical" size="small">
                  <Text strong>{medication.name}</Text>
                  <Text>Liều lượng: {medication.dosage}</Text>
                  <Text type="secondary">
                    Từ:{" "}
                    {new Date(medication.startDate).toLocaleDateString("vi-VN")}
                    {medication.endDate &&
                      ` - ${new Date(medication.endDate).toLocaleDateString(
                        "vi-VN"
                      )}`}
                  </Text>
                </Space>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "24px" }}
    >
      <Title level={2} style={{ marginBottom: "24px", color: "#0F6CBD" }}>
        Quản lý hồ sơ sức khỏe
      </Title>

      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
            style={{ marginBottom: "16px" }}
          >
            Thêm hồ sơ mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={studentsData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} học sinh`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={
          selectedStudent
            ? `Hồ sơ sức khỏe - ${selectedStudent.name}`
            : "Thêm hồ sơ mới"
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        width={1200}
        footer={
          selectedStudent && !form.isFieldsTouched()
            ? [
                <Button key="close" onClick={handleModalClose}>
                  Đóng
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={handleModalClose}>
                  Hủy
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={() => form.submit()}
                >
                  Lưu lại
                </Button>,
              ]
        }
      >
        {selectedStudent ? (
          <HealthProfileDetails student={selectedStudent} />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Họ và tên"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="class"
                  label="Lớp"
                  rules={[{ required: true, message: "Vui lòng chọn lớp!" }]}
                >
                  <Select>
                    <Option value="1A">1A</Option>
                    <Option value="1B">1B</Option>
                    <Option value="2A">2A</Option>
                    <Option value="2B">2B</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dateOfBirth"
                  label="Ngày sinh"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày sinh!" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính!" },
                  ]}
                >
                  <Select>
                    <Option value="Nam">Nam</Option>
                    <Option value="Nữ">Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bloodType" label="Nhóm máu">
                  <Select>
                    <Option value="A+">A+</Option>
                    <Option value="A-">A-</Option>
                    <Option value="B+">B+</Option>
                    <Option value="B-">B-</Option>
                    <Option value="AB+">AB+</Option>
                    <Option value="AB-">AB-</Option>
                    <Option value="O+">O+</Option>
                    <Option value="O-">O-</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="weight" label="Cân nặng">
                  <Input addonAfter="kg" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="height" label="Chiều cao">
                  <Input addonAfter="cm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="parentName" label="Tên phụ huynh">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="parentPhone" label="Số điện thoại phụ huynh">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="parentEmail" label="Email phụ huynh">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="address" label="Địa chỉ">
                  <TextArea rows={2} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="allergies" label="Dị ứng (ghi rõ từng loại)">
                  <TextArea
                    rows={2}
                    placeholder="Ví dụ: Đậu phộng, Tôm cua, Sữa..."
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="chronicConditions" label="Bệnh mãn tính">
                  <TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    </motion.div>
  );
}

export default ProfileManagement;
