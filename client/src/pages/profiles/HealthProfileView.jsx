/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Card,
  Table,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Tag,
  Modal,
  Descriptions,
  Badge,
  Space,
  Button,
  Avatar,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const HealthProfileView = () => {
  const [searchText, setSearchText] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock data - replace with API calls
  const studentsData = [
    {
      key: "1",
      id: "HS001",
      name: "Nguyễn Văn An",
      class: "6A",
      allergies: ["Sữa", "Đậu phộng"],
      chronicDiseases: ["Hen suyễn"],
      medicalHistory: "Phẫu thuật ruột thừa năm 2023",
      vaccinations: ["COVID-19", "Hepatitis B", "Sởi"],
      lastCheckup: "2024-12-15",
      healthStatus: "Tốt",
      medications: ["Inhaler hen suyễn"],
      emergencyContact: "0901234567",
    },
    {
      key: "2",
      id: "HS002",
      name: "Trần Thị Bình",
      class: "7B",
      allergies: [],
      chronicDiseases: [],
      medicalHistory: "Không có tiền sử bệnh lý",
      vaccinations: ["COVID-19", "Hepatitis B"],
      lastCheckup: "2024-11-20",
      healthStatus: "Tốt",
      medications: [],
      emergencyContact: "0912345678",
    },
    {
      key: "3",
      id: "HS003",
      name: "Lê Văn Cường",
      class: "8C",
      allergies: ["Thuốc kháng sinh Penicillin"],
      chronicDiseases: ["Tiểu đường type 1"],
      medicalHistory: "Chẩn đoán tiểu đường từ năm 2022",
      vaccinations: ["COVID-19", "Hepatitis B", "Sởi", "Quai bị"],
      lastCheckup: "2025-01-10",
      healthStatus: "Cần theo dõi",
      medications: ["Insulin", "Máy đo đường huyết"],
      emergencyContact: "0923456789",
    },
  ];

  const getHealthStatusColor = (status) => {
    switch (status) {
      case "Tốt":
        return "green";
      case "Cần theo dõi":
        return "orange";
      case "Cần can thiệp":
        return "red";
      default:
        return "default";
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const filteredData = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesClass =
      filterClass === "all" || student.class.includes(filterClass);
    return matchesSearch && matchesClass;
  });

  const columns = [
    {
      title: "Mã học sinh",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Tên học sinh",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      width: 80,
      align: "center",
    },
    {
      title: "Tình trạng sức khỏe",
      dataIndex: "healthStatus",
      key: "healthStatus",
      width: 150,
      align: "center",
      render: (status) => (
        <Tag color={getHealthStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: "Dị ứng",
      dataIndex: "allergies",
      key: "allergies",
      width: 150,
      render: (allergies) => (
        <div>
          {allergies.length > 0 ? (
            allergies.map((allergy, index) => (
              <Tag key={index} color="red" style={{ marginBottom: 4 }}>
                {allergy}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Không có</Text>
          )}
        </div>
      ),
    },
    {
      title: "Bệnh mãn tính",
      dataIndex: "chronicDiseases",
      key: "chronicDiseases",
      width: 150,
      render: (diseases) => (
        <div>
          {diseases.length > 0 ? (
            diseases.map((disease, index) => (
              <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
                {disease}
              </Tag>
            ))
          ) : (
            <Text type="secondary">Không có</Text>
          )}
        </div>
      ),
    },
    {
      title: "Khám gần nhất",
      dataIndex: "lastCheckup",
      key: "lastCheckup",
      width: 120,
      align: "center",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "24px" }}
    >
      <Title level={2} style={{ color: "#0F6CBD", marginBottom: "24px" }}>
        <HeartOutlined style={{ marginRight: 8 }} />
        Hồ sơ sức khỏe học sinh
      </Title>

      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Tìm kiếm theo tên hoặc mã học sinh..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Lọc theo lớp"
              value={filterClass}
              onChange={setFilterClass}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả lớp</Option>
              <Option value="6">Khối 6</Option>
              <Option value="7">Khối 7</Option>
              <Option value="8">Khối 8</Option>
              <Option value="9">Khối 9</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Text type="secondary">Tổng: {filteredData.length} học sinh</Text>
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} học sinh`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            Hồ sơ sức khỏe - {selectedStudent?.name}
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedStudent && (
          <div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã học sinh" span={1}>
                {selectedStudent.id}
              </Descriptions.Item>
              <Descriptions.Item label="Lớp" span={1}>
                {selectedStudent.class}
              </Descriptions.Item>
              <Descriptions.Item label="Tình trạng sức khỏe" span={1}>
                <Tag color={getHealthStatusColor(selectedStudent.healthStatus)}>
                  {selectedStudent.healthStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Liên hệ khẩn cấp" span={1}>
                {selectedStudent.emergencyContact}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <AlertOutlined style={{ color: "#ff4d4f" }} /> Dị ứng
            </Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedStudent.allergies.length > 0 ? (
                selectedStudent.allergies.map((allergy, index) => (
                  <Tag key={index} color="red" style={{ marginBottom: 4 }}>
                    {allergy}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Không có dị ứng nào được ghi nhận</Text>
              )}
            </div>

            <Divider orientation="left">
              <HeartOutlined style={{ color: "#orange" }} /> Bệnh mãn tính
            </Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedStudent.chronicDiseases.length > 0 ? (
                selectedStudent.chronicDiseases.map((disease, index) => (
                  <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
                    {disease}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Không có bệnh mãn tính</Text>
              )}
            </div>

            <Divider orientation="left">
              <MedicineBoxOutlined style={{ color: "#722ed1" }} /> Thuốc đang sử
              dụng
            </Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedStudent.medications.length > 0 ? (
                selectedStudent.medications.map((med, index) => (
                  <Tag key={index} color="purple" style={{ marginBottom: 4 }}>
                    {med}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">Không có thuốc đang sử dụng</Text>
              )}
            </div>

            <Divider orientation="left">
              <SafetyCertificateOutlined style={{ color: "#52c41a" }} /> Lịch sử
              tiêm chủng
            </Divider>
            <div style={{ marginBottom: 16 }}>
              {selectedStudent.vaccinations.map((vaccine, index) => (
                <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                  {vaccine}
                </Tag>
              ))}
            </div>

            <Divider orientation="left">Tiền sử bệnh án</Divider>
            <Text>{selectedStudent.medicalHistory}</Text>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default HealthProfileView;
