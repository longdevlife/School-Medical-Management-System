/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Typography,
  Tag,
  Badge,
  Tabs,
  List,
  Avatar,
  Statistic,
  Alert,
  Divider,
  TimePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

function MedicationManagement() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmissionModalVisible, setIsSubmissionModalVisible] =
    useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [form] = Form.useForm();
  const [submissionForm] = Form.useForm();

  // Mock data - thay thế bằng API calls thực tế
  const medicationsData = [
    {
      key: "1",
      id: "MED001",
      name: "Paracetamol",
      type: "Thuốc hạ sốt",
      concentration: "500mg",
      form: "Viên nén",
      manufacturer: "Công ty ABC",
      batchNumber: "B2024001",
      quantity: 100,
      unit: "Viên",
      expiryDate: "2025-12-31",
      importDate: "2024-01-15",
      status: "Còn hàng",
      minStock: 20,
      location: "Tủ A - Ngăn 1",
      price: 500,
      prescriptionRequired: false,
    },
    {
      key: "2",
      id: "MED002",
      name: "Amoxicillin",
      type: "Kháng sinh",
      concentration: "250mg",
      form: "Viên nang",
      manufacturer: "Công ty XYZ",
      batchNumber: "B2024002",
      quantity: 15,
      unit: "Viên",
      expiryDate: "2024-12-31",
      importDate: "2024-02-01",
      status: "Sắp hết",
      minStock: 20,
      location: "Tủ B - Ngăn 2",
      price: 1200,
      prescriptionRequired: true,
    },
  ];

  const medicationSubmissions = [
    {
      key: "1",
      id: "SUB001",
      studentId: "HS001",
      studentName: "Nguyễn Văn An",
      class: "1A",
      medicationName: "Paracetamol",
      dosage: "1 viên",
      frequency: "3 lần/ngày",
      duration: "3 ngày",
      reason: "Sốt cao",
      submittedBy: "Y tá Nguyễn Thị A",
      submissionDate: "2024-11-25",
      status: "Đang điều trị",
      instructions: "Uống sau ăn, nhiều nước",
      sideEffects: "Không có",
      parentApproval: true,
    },
    {
      key: "2",
      id: "SUB002",
      studentId: "HS002",
      studentName: "Trần Thị Bảo",
      class: "1B",
      medicationName: "Salbutamol",
      dosage: "2 nhát",
      frequency: "Khi cần",
      duration: "Dài hạn",
      reason: "Hen suyễn",
      submittedBy: "Y tá Lê Thị B",
      submissionDate: "2024-11-20",
      status: "Hoàn thành",
      instructions: "Sử dụng khi khó thở",
      sideEffects: "Tim đập nhanh nhẹ",
      parentApproval: true,
    },
  ];

  const medicationColumns = [
    {
      title: "Mã thuốc",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Tên thuốc",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.concentration} - {record.form}
          </Text>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Số lượng",
      key: "quantity",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>
            {record.quantity} {record.unit}
          </Text>
          {record.quantity <= record.minStock && (
            <Tag color="red" icon={<WarningOutlined />}>
              Sắp hết
            </Tag>
          )}
        </Space>
      ),
      width: 100,
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => {
        const isExpiring = dayjs(date).diff(dayjs(), "month") < 6;
        return (
          <div>
            <Text style={{ color: isExpiring ? "#ff4d4f" : "inherit" }}>
              {dayjs(date).format("DD/MM/YYYY")}
            </Text>
            {isExpiring && (
              <div>
                <Tag color="red" size="small">
                  Sắp hết hạn
                </Tag>
              </div>
            )}
          </div>
        );
      },
      width: 120,
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Còn hàng"
            ? "green"
            : status === "Sắp hết"
            ? "orange"
            : "red";
        return (
          <Badge
            status={
              color === "green"
                ? "success"
                : color === "orange"
                ? "warning"
                : "error"
            }
            text={status}
          />
        );
      },
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
            onClick={() => viewMedication(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => editMedication(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<MedicineBoxOutlined />}
            onClick={() => openSubmissionModal(record)}
          >
            Cấp phát
          </Button>
        </Space>
      ),
      width: 180,
    },
  ];

  const submissionColumns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Học sinh",
      key: "student",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.studentName}</Text>
          <Text type="secondary">
            {record.studentId} - Lớp {record.class}
          </Text>
        </Space>
      ),
    },
    {
      title: "Thuốc",
      key: "medication",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong>{record.medicationName}</Text>
          <Text type="secondary">
            {record.dosage} - {record.frequency}
          </Text>
        </Space>
      ),
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      width: 120,
    },
    {
      title: "Ngày cấp",
      dataIndex: "submissionDate",
      key: "submissionDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      width: 100,
    },
    {
      title: "Người cấp",
      dataIndex: "submittedBy",
      key: "submittedBy",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Hoàn thành"
            ? "green"
            : status === "Đang điều trị"
            ? "blue"
            : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
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
            onClick={() => viewSubmission(record)}
          >
            Xem
          </Button>
        </Space>
      ),
      width: 80,
    },
  ];

  const viewMedication = (medication) => {
    setSelectedMedication(medication);
    setIsModalVisible(true);
  };

  const editMedication = (medication) => {
    setSelectedMedication(medication);
    form.setFieldsValue({
      ...medication,
      expiryDate: dayjs(medication.expiryDate),
      importDate: dayjs(medication.importDate),
    });
    setIsModalVisible(true);
  };

  const openSubmissionModal = (medication) => {
    setSelectedMedication(medication);
    submissionForm.setFieldsValue({
      medicationName: medication.name,
      medicationId: medication.id,
    });
    setIsSubmissionModalVisible(true);
  };

  const viewSubmission = (submission) => {
    console.log("View submission:", submission);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedMedication(null);
    form.resetFields();
  };

  const handleSubmissionModalClose = () => {
    setIsSubmissionModalVisible(false);
    setSelectedMedication(null);
    submissionForm.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      console.log("Form values:", values);
      // Gọi API để lưu thông tin thuốc
      handleModalClose();
    } catch (error) {
      console.error("Error saving medication data:", error);
    }
  };

  const handleSubmissionSubmit = async (values) => {
    try {
      console.log("Submission values:", values);
      // Gọi API để lưu thông tin cấp phát thuốc
      handleSubmissionModalClose();
    } catch (error) {
      console.error("Error saving submission data:", error);
    }
  };

  const MedicationDetails = ({ medication }) => (
    <Row gutter={[16, 16]}>
      <Col span={12}>
        <Card title="Thông tin cơ bản">
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Mã thuốc: </Text>
              <Text>{medication.id}</Text>
            </div>
            <div>
              <Text strong>Tên thuốc: </Text>
              <Text>{medication.name}</Text>
            </div>
            <div>
              <Text strong>Loại: </Text>
              <Tag color="blue">{medication.type}</Tag>
            </div>
            <div>
              <Text strong>Nồng độ: </Text>
              <Text>{medication.concentration}</Text>
            </div>
            <div>
              <Text strong>Dạng bào chế: </Text>
              <Text>{medication.form}</Text>
            </div>
            <div>
              <Text strong>Nhà sản xuất: </Text>
              <Text>{medication.manufacturer}</Text>
            </div>
            <div>
              <Text strong>Số lô: </Text>
              <Text>{medication.batchNumber}</Text>
            </div>
          </Space>
        </Card>
      </Col>

      <Col span={12}>
        <Card title="Thông tin kho">
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Số lượng: </Text>
              <Text>
                {medication.quantity} {medication.unit}
              </Text>
            </div>
            <div>
              <Text strong>Tồn kho tối thiểu: </Text>
              <Text>
                {medication.minStock} {medication.unit}
              </Text>
            </div>
            <div>
              <Text strong>Vị trí: </Text>
              <Text>{medication.location}</Text>
            </div>{" "}
            <div>
              <Text strong>Ngày nhập: </Text>
              <Text>{dayjs(medication.importDate).format("DD/MM/YYYY")}</Text>
            </div>
            <div>
              <Text strong>Hạn sử dụng: </Text>
              <Text>{dayjs(medication.expiryDate).format("DD/MM/YYYY")}</Text>
            </div>
            <div>
              <Text strong>Giá: </Text>
              <Text>{medication.price.toLocaleString("vi-VN")} VNĐ</Text>
            </div>
            <div>
              <Text strong>Cần đơn thuốc: </Text>
              <Tag color={medication.prescriptionRequired ? "red" : "green"}>
                {medication.prescriptionRequired ? "Có" : "Không"}
              </Tag>
            </div>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: "24px" }}
    >
      <Title level={2} style={{ marginBottom: "24px", color: "#0F6CBD" }}>
        Quản lý thuốc & Cấp phát
      </Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số loại thuốc"
              value={medicationsData.length}
              prefix={<MedicineBoxOutlined style={{ color: "#0F6CBD" }} />}
              valueStyle={{ color: "#0F6CBD" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thuốc sắp hết"
              value={
                medicationsData.filter((m) => m.quantity <= m.minStock).length
              }
              prefix={<WarningOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn thuốc hôm nay"
              value={2}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            {" "}
            <Statistic
              title="Thuốc sắp hết hạn"
              value={
                medicationsData.filter(
                  (m) => dayjs(m.expiryDate).diff(dayjs(), "month") < 6
                ).length
              }
              prefix={
                <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
              }
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Quản lý kho thuốc" key="1">
          <Card>
            <div style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Thêm thuốc mới
              </Button>
            </div>

            <Table
              columns={medicationColumns}
              dataSource={medicationsData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} loại thuốc`,
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Lịch sử cấp phát" key="2">
          <Card>
            <Table
              columns={submissionColumns}
              dataSource={medicationSubmissions}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} đơn thuốc`,
              }}
              scroll={{ x: 1000 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Medication Modal */}
      <Modal
        title={
          selectedMedication && form.isFieldsTouched()
            ? `Chỉnh sửa thuốc - ${selectedMedication.name}`
            : selectedMedication
            ? `Thông tin thuốc - ${selectedMedication.name}`
            : "Thêm thuốc mới"
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        width={1000}
        footer={
          selectedMedication && !form.isFieldsTouched()
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
        {selectedMedication && !form.isFieldsTouched() ? (
          <MedicationDetails medication={selectedMedication} />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên thuốc"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên thuốc!" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Loại thuốc"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại thuốc!" },
                  ]}
                >
                  <Select>
                    <Option value="Thuốc hạ sốt">Thuốc hạ sốt</Option>
                    <Option value="Kháng sinh">Kháng sinh</Option>
                    <Option value="Vitamin">Vitamin</Option>
                    <Option value="Thuốc dị ứng">Thuốc dị ứng</Option>
                    <Option value="Thuốc hen suyễn">Thuốc hen suyễn</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="concentration" label="Nồng độ">
                  <Input placeholder="VD: 500mg" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="form" label="Dạng bào chế">
                  <Select>
                    <Option value="Viên nén">Viên nén</Option>
                    <Option value="Viên nang">Viên nang</Option>
                    <Option value="Siro">Siro</Option>
                    <Option value="Thuốc xịt">Thuốc xịt</Option>
                    <Option value="Kem/Gel">Kem/Gel</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="manufacturer" label="Nhà sản xuất">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="batchNumber" label="Số lô">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="quantity" label="Số lượng">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="unit" label="Đơn vị">
                  <Select>
                    <Option value="Viên">Viên</Option>
                    <Option value="Hộp">Hộp</Option>
                    <Option value="Chai">Chai</Option>
                    <Option value="Ống">Ống</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="minStock" label="Tồn kho tối thiểu">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="importDate" label="Ngày nhập">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="expiryDate" label="Hạn sử dụng">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="location" label="Vị trí trong kho">
                  <Input placeholder="VD: Tủ A - Ngăn 1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="price" label="Giá (VNĐ)">
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* Medication Submission Modal */}
      <Modal
        title={`Cấp phát thuốc - ${selectedMedication?.name}`}
        open={isSubmissionModalVisible}
        onCancel={handleSubmissionModalClose}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleSubmissionModalClose}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => submissionForm.submit()}
          >
            Cấp phát
          </Button>,
        ]}
      >
        <Form
          form={submissionForm}
          layout="vertical"
          onFinish={handleSubmissionSubmit}
        >
          <Alert
            message="Lưu ý"
            description="Vui lòng kiểm tra kỹ thông tin học sinh và liều lượng thuốc trước khi cấp phát."
            type="warning"
            showIcon
            style={{ marginBottom: "16px" }}
          />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Mã học sinh"
                rules={[
                  { required: true, message: "Vui lòng nhập mã học sinh!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentName"
                label="Tên học sinh"
                rules={[
                  { required: true, message: "Vui lòng nhập tên học sinh!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="medicationName" label="Tên thuốc">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dosage"
                label="Liều lượng"
                rules={[
                  { required: true, message: "Vui lòng nhập liều lượng!" },
                ]}
              >
                <Input placeholder="VD: 1 viên, 5ml" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="Tần suất"
                rules={[{ required: true, message: "Vui lòng nhập tần suất!" }]}
              >
                <Input placeholder="VD: 3 lần/ngày, 8h một lần" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Thời gian điều trị"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian!" },
                ]}
              >
                <Input placeholder="VD: 3 ngày, 1 tuần" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="reason"
                label="Lý do sử dụng"
                rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
              >
                <TextArea
                  rows={2}
                  placeholder="Mô tả triệu chứng và lý do cấp thuốc"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="instructions" label="Hướng dẫn sử dụng">
                <TextArea rows={2} placeholder="VD: Uống sau ăn, nhiều nước" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="sideEffects" label="Tác dụng phụ có thể xảy ra">
                <TextArea
                  rows={2}
                  placeholder="Mô tả các tác dụng phụ cần lưu ý"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </motion.div>
  );
}

export default MedicationManagement;
