import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  DatePicker,
  TimePicker,
  InputNumber,
  Descriptions,
  Steps,
  Result,
  message,
  Image,
  Divider,
} from "antd";
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  UploadOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

function MedicationSubmission() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [classFilter, setClassFilter] = useState("all");
  const [form] = Form.useForm();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSubmissions = [
      {
        id: 1,
        submissionCode: "TN001",
        studentId: "HS001",
        studentName: "Nguyễn Văn An",
        studentClass: "6A1",
        parentName: "Nguyễn Thị B",
        parentPhone: "0912345678",
        medicationName: "Paracetamol 250mg",
        dosage: "1 viên",
        frequency: "2 lần/ngày",
        duration: "3 ngày",
        instructions: "Uống sau ăn, chia đôi viên nếu cần",
        reason: "Sốt, đau đầu",
        submissionDate: "2024-12-06T08:30:00",
        status: "pending",
        verifiedBy: null,
        verifiedDate: null,
        verificationNotes: null,
        medicationImages: [
          "/api/images/med1_front.jpg",
          "/api/images/med1_back.jpg",
        ],
        prescriptionImage: "/api/images/prescription1.jpg",
        parentSignature: "/api/images/signature1.jpg",
        urgencyLevel: "normal",
        administrationTimes: [
          { time: "08:00", given: false },
          { time: "20:00", given: false },
        ],
      },
      {
        id: 2,
        submissionCode: "TN002",
        studentId: "HS002",
        studentName: "Trần Thị Bình",
        studentClass: "6A2",
        parentName: "Trần Văn C",
        parentPhone: "0987654321",
        medicationName: "Ventolin Inhaler",
        dosage: "2 nhịp",
        frequency: "Khi cần",
        duration: "Theo yêu cầu",
        instructions: "Sử dụng khi khó thở, lắc đều trước khi dùng",
        reason: "Hen suyễn",
        submissionDate: "2024-12-06T07:45:00",
        status: "approved",
        verifiedBy: "Y tá Nguyễn Thị An",
        verifiedDate: "2024-12-06T09:00:00",
        verificationNotes: "Đã kiểm tra thuốc, phù hợp với đơn thuốc",
        medicationImages: ["/api/images/med2_front.jpg"],
        prescriptionImage: "/api/images/prescription2.jpg",
        parentSignature: "/api/images/signature2.jpg",
        urgencyLevel: "high",
        administrationTimes: [],
      },
      {
        id: 3,
        submissionCode: "TN003",
        studentId: "HS003",
        studentName: "Lê Minh Cường",
        studentClass: "6B1",
        parentName: "Lê Thị D",
        parentPhone: "0934567890",
        medicationName: "Vitamin C 500mg",
        dosage: "1 viên",
        frequency: "1 lần/ngày",
        duration: "7 ngày",
        instructions: "Uống sau bữa sáng",
        reason: "Tăng cường sức đề kháng",
        submissionDate: "2024-12-05T16:20:00",
        status: "rejected",
        verifiedBy: "Y tá Nguyễn Thị An",
        verifiedDate: "2024-12-05T17:00:00",
        verificationNotes:
          "Không có đơn thuốc từ bác sĩ, chỉ là thực phẩm chức năng",
        medicationImages: ["/api/images/med3_front.jpg"],
        prescriptionImage: null,
        parentSignature: "/api/images/signature3.jpg",
        urgencyLevel: "low",
        administrationTimes: [],
      },
    ];

    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  }, []);

  const handleVerify = (submission) => {
    setSelectedSubmission(submission);
    form.setFieldsValue({
      status: submission.status === "pending" ? "approved" : submission.status,
      verificationNotes: submission.verificationNotes || "",
    });
    setVerifyModalVisible(true);
  };

  const handleViewDetails = (submission) => {
    setSelectedSubmission(submission);
    setDetailModalVisible(true);
  };

  const handleVerifySubmit = async (values) => {
    try {
      const updatedSubmission = {
        ...selectedSubmission,
        status: values.status,
        verifiedBy: "Y tá Nguyễn Thị An", // Get from current user
        verifiedDate: new Date().toISOString(),
        verificationNotes: values.verificationNotes,
      };

      const updatedSubmissions = submissions.map((sub) =>
        sub.id === selectedSubmission.id ? updatedSubmission : sub
      );
      setSubmissions(updatedSubmissions);

      message.success(
        values.status === "approved"
          ? "Đã phê duyệt yêu cầu thuốc!"
          : "Đã từ chối yêu cầu thuốc!"
      );
      setVerifyModalVisible(false);
    } catch (error) {
      message.error("Xử lý yêu cầu thất bại!");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "approved":
        return "Đã phê duyệt";
      case "rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case "high":
        return "red";
      case "normal":
        return "blue";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getUrgencyText = (level) => {
    switch (level) {
      case "high":
        return "Khẩn cấp";
      case "normal":
        return "Bình thường";
      case "low":
        return "Không khẩn";
      default:
        return level;
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;
    const matchesClass =
      classFilter === "all" || submission.studentClass === classFilter;
    return matchesStatus && matchesClass;
  });

  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "submissionCode",
      key: "submissionCode",
      width: 100,
    },
    {
      title: "Học sinh",
      key: "student",
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong>{record.studentName}</Text>
          <br />
          <Text type="secondary">
            {record.studentId} - {record.studentClass}
          </Text>
        </div>
      ),
    },
    {
      title: "Thuốc",
      dataIndex: "medicationName",
      key: "medicationName",
      ellipsis: true,
    },
    {
      title: "Liều dùng",
      key: "dosage",
      width: 150,
      render: (_, record) => (
        <div>
          <Text>{record.dosage}</Text>
          <br />
          <Text type="secondary">{record.frequency}</Text>
        </div>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "urgencyLevel",
      key: "urgencyLevel",
      width: 100,
      render: (level) => (
        <Tag color={getUrgencyColor(level)}>{getUrgencyText(level)}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "submissionDate",
      key: "submissionDate",
      width: 130,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          {record.status === "pending" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleVerify(record)}
            >
              Xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const classes = ["6A1", "6A2", "6B1", "6B2", "7A1", "7A2", "7B1", "7B2"];
  const statuses = ["pending", "approved", "rejected"];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="text-blue-600 mb-2">
          <MedicineBoxOutlined className="mr-2" />
          Tiếp Nhận Thuốc
        </Title>
        <Text type="secondary">
          Xử lý các yêu cầu gửi thuốc từ phụ huynh cho học sinh
        </Text>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">Tất cả trạng thái</Option>
              {statuses.map((status) => (
                <Option key={status} value={status}>
                  {getStatusText(status)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Lớp"
              style={{ width: "100%" }}
              value={classFilter}
              onChange={setClassFilter}
            >
              <Option value="all">Tất cả lớp</Option>
              {classes.map((cls) => (
                <Option key={cls} value={cls}>
                  {cls}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <div className="text-right">
              <Space>
                <Text strong>
                  Chờ xử lý:{" "}
                  {submissions.filter((s) => s.status === "pending").length}
                </Text>
                <Text type="success">
                  Đã duyệt:{" "}
                  {submissions.filter((s) => s.status === "approved").length}
                </Text>
                <Text type="danger">
                  Đã từ chối:{" "}
                  {submissions.filter((s) => s.status === "rejected").length}
                </Text>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Submissions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSubmissions}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} yêu cầu`,
          }}
        />
      </Card>

      {/* Verification Modal */}
      <Modal
        title="Xử Lý Yêu Cầu Thuốc"
        open={verifyModalVisible}
        onCancel={() => setVerifyModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleVerifySubmit}>
          <Form.Item
            name="status"
            label="Quyết định"
            rules={[{ required: true, message: "Vui lòng chọn quyết định!" }]}
          >
            <Select placeholder="Chọn quyết định">
              <Option value="approved">Phê duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="verificationNotes"
            label="Ghi chú xác minh"
            rules={[{ required: true, message: "Vui lòng nhập ghi chú!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc kiểm tra thuốc, lý do phê duyệt/từ chối..."
            />
          </Form.Item>

          <div className="text-right">
            <Space>
              <Button onClick={() => setVerifyModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Xác nhận
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi Tiết Yêu Cầu Thuốc"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedSubmission && (
          <div>
            {/* Status Steps */}
            <Steps
              current={
                selectedSubmission.status === "pending"
                  ? 0
                  : selectedSubmission.status === "approved"
                  ? 2
                  : 1
              }
              status={
                selectedSubmission.status === "rejected" ? "error" : "process"
              }
              className="mb-6"
            >
              <Step title="Gửi yêu cầu" description="Phụ huynh gửi" />
              <Step
                title="Xác minh"
                description={
                  selectedSubmission.status === "rejected"
                    ? "Từ chối"
                    : "Y tá kiểm tra"
                }
              />
              <Step title="Hoàn thành" description="Được phê duyệt" />
            </Steps>

            {/* Basic Information */}
            <Card className="mb-4">
              <Descriptions title="Thông Tin Yêu Cầu" bordered column={2}>
                <Descriptions.Item label="Mã yêu cầu">
                  {selectedSubmission.submissionCode}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedSubmission.status)}>
                    {getStatusText(selectedSubmission.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Học sinh">
                  {selectedSubmission.studentName}
                </Descriptions.Item>
                <Descriptions.Item label="Lớp">
                  {selectedSubmission.studentClass}
                </Descriptions.Item>
                <Descriptions.Item label="Phụ huynh">
                  {selectedSubmission.parentName}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {selectedSubmission.parentPhone}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày gửi">
                  {dayjs(selectedSubmission.submissionDate).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Mức độ khẩn cấp">
                  <Tag color={getUrgencyColor(selectedSubmission.urgencyLevel)}>
                    {getUrgencyText(selectedSubmission.urgencyLevel)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Medication Information */}
            <Card className="mb-4">
              <Title level={5} className="mb-3">
                <MedicineBoxOutlined className="mr-2" />
                Thông Tin Thuốc
              </Title>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Tên thuốc">
                  {selectedSubmission.medicationName}
                </Descriptions.Item>
                <Descriptions.Item label="Liều dùng">
                  {selectedSubmission.dosage}
                </Descriptions.Item>
                <Descriptions.Item label="Tần suất">
                  {selectedSubmission.frequency}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian sử dụng">
                  {selectedSubmission.duration}
                </Descriptions.Item>
                <Descriptions.Item label="Hướng dẫn sử dụng">
                  {selectedSubmission.instructions}
                </Descriptions.Item>
                <Descriptions.Item label="Lý do sử dụng">
                  {selectedSubmission.reason}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Images */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col span={8}>
                <Card size="small" title="Hình ảnh thuốc">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    {selectedSubmission.medicationImages.map((img, index) => (
                      <Image
                        key={index}
                        width="100%"
                        height={100}
                        src={img}
                        placeholder="Đang tải..."
                        fallback="/api/placeholder-image.jpg"
                      />
                    ))}
                  </Space>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Đơn thuốc">
                  {selectedSubmission.prescriptionImage ? (
                    <Image
                      width="100%"
                      height={100}
                      src={selectedSubmission.prescriptionImage}
                      placeholder="Đang tải..."
                      fallback="/api/placeholder-image.jpg"
                    />
                  ) : (
                    <Text type="secondary">Không có đơn thuốc</Text>
                  )}
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" title="Chữ ký phụ huynh">
                  <Image
                    width="100%"
                    height={100}
                    src={selectedSubmission.parentSignature}
                    placeholder="Đang tải..."
                    fallback="/api/placeholder-image.jpg"
                  />
                </Card>
              </Col>
            </Row>

            {/* Verification Information */}
            {selectedSubmission.status !== "pending" && (
              <Card>
                <Title level={5} className="mb-3">
                  <CheckOutlined className="mr-2" />
                  Thông Tin Xác Minh
                </Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Người xác minh">
                    {selectedSubmission.verifiedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian xác minh">
                    {dayjs(selectedSubmission.verifiedDate).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú xác minh">
                    {selectedSubmission.verificationNotes}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MedicationSubmission;
