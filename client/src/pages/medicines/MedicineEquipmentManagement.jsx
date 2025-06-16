import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Tag,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Descriptions,
  Alert,
  Statistic,
  Progress,
  Popconfirm,
  message,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MedicineBoxOutlined,
  ToolOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

function MedicineEquipmentManagement() {
  const [medicines, setMedicines] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState("medicines");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form] = Form.useForm();

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockMedicines = [
      {
        id: 1,
        code: "MED001",
        name: "Paracetamol 500mg",
        type: "Thuốc giảm đau, hạ sốt",
        manufacturer: "Công ty Dược ABC",
        batchNumber: "PAR2024A",
        expiryDate: "2025-12-31",
        quantity: 150,
        minQuantity: 20,
        maxQuantity: 200,
        unit: "viên",
        storageLocation: "Tủ thuốc A - Ngăn 1",
        storageCondition: "Nhiệt độ phòng, tránh ẩm",
        status: "available",
        lastUpdated: "2024-12-06",
        notes: "Thuốc phổ biến, sử dụng nhiều",
        usageCount: 45,
      },
      {
        id: 2,
        code: "MED002",
        name: "Ventolin Inhaler",
        type: "Thuốc xịt hen suyễn",
        manufacturer: "GSK Việt Nam",
        batchNumber: "VEN2024B",
        expiryDate: "2025-08-15",
        quantity: 8,
        minQuantity: 10,
        maxQuantity: 25,
        unit: "ống",
        storageLocation: "Tủ thuốc B - Ngăn 2",
        storageCondition: "Nhiệt độ phòng, không để trong tủ lạnh",
        status: "low_stock",
        lastUpdated: "2024-12-05",
        notes: "Cần bổ sung thêm",
        usageCount: 17,
      },
      {
        id: 3,
        code: "MED003",
        name: "Iodine 10%",
        type: "Dung dịch sát trùng",
        manufacturer: "Dược phẩm XYZ",
        batchNumber: "IOD2024C",
        expiryDate: "2025-03-20",
        quantity: 2,
        minQuantity: 5,
        maxQuantity: 15,
        unit: "chai",
        storageLocation: "Tủ thuốc A - Ngăn 3",
        storageCondition: "Tránh ánh sáng, nhiệt độ phòng",
        status: "expired_soon",
        lastUpdated: "2024-12-04",
        notes: "Sắp hết hạn, cần thay thế",
        usageCount: 13,
      },
    ];

    const mockEquipment = [
      {
        id: 1,
        code: "EQP001",
        name: "Nhiệt kế điện tử",
        type: "Thiết bị đo thân nhiệt",
        manufacturer: "Omron",
        model: "MC-245",
        serialNumber: "OMR2024001",
        purchaseDate: "2024-01-15",
        warrantyExpiry: "2026-01-15",
        quantity: 5,
        availableQuantity: 4,
        location: "Phòng y tế - Tủ thiết bị A",
        condition: "good",
        status: "available",
        lastMaintenance: "2024-11-01",
        nextMaintenance: "2025-02-01",
        notes: "Hoạt động tốt, 1 chiếc đang sử dụng",
        usageCount: 156,
      },
      {
        id: 2,
        code: "EQP002",
        name: "Máy đo huyết áp",
        type: "Thiết bị đo huyết áp",
        manufacturer: "Beurer",
        model: "BM-40",
        serialNumber: "BEU2024002",
        purchaseDate: "2024-03-10",
        warrantyExpiry: "2026-03-10",
        quantity: 2,
        availableQuantity: 1,
        location: "Phòng y tế - Tủ thiết bị B",
        condition: "needs_maintenance",
        status: "maintenance",
        lastMaintenance: "2024-09-15",
        nextMaintenance: "2024-12-15",
        notes: "1 chiếc cần bảo trì, màn hình mờ",
        usageCount: 89,
      },
      {
        id: 3,
        code: "EQP003",
        name: "Túi đá y tế",
        type: "Dụng cụ sơ cứu",
        manufacturer: "Local Supplier",
        model: "Standard",
        serialNumber: "ICE2024003",
        purchaseDate: "2024-06-20",
        warrantyExpiry: "2025-06-20",
        quantity: 10,
        availableQuantity: 6,
        location: "Phòng y tế - Tủ sơ cứu",
        condition: "good",
        status: "available",
        lastMaintenance: "2024-11-20",
        nextMaintenance: "2025-05-20",
        notes: "Sử dụng cho các trường hợp chấn thương",
        usageCount: 34,
      },
    ];

    setTimeout(() => {
      setMedicines(mockMedicines);
      setEquipment(mockEquipment);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    const formData = { ...item };
    if (activeTab === "medicines" && item.expiryDate) {
      formData.expiryDate = dayjs(item.expiryDate);
    }
    if (activeTab === "equipment") {
      if (item.purchaseDate) formData.purchaseDate = dayjs(item.purchaseDate);
      if (item.warrantyExpiry)
        formData.warrantyExpiry = dayjs(item.warrantyExpiry);
      if (item.lastMaintenance)
        formData.lastMaintenance = dayjs(item.lastMaintenance);
      if (item.nextMaintenance)
        formData.nextMaintenance = dayjs(item.nextMaintenance);
    }
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDelete = async (itemId) => {
    try {
      if (activeTab === "medicines") {
        setMedicines(medicines.filter((med) => med.id !== itemId));
      } else {
        setEquipment(equipment.filter((eq) => eq.id !== itemId));
      }
      message.success("Xóa thành công!");
    } catch (error) {
      message.error("Xóa thất bại!");
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const itemData = {
        ...values,
        lastUpdated: new Date().toISOString().split("T")[0],
        ...(activeTab === "medicines"
          ? { expiryDate: values.expiryDate?.format("YYYY-MM-DD") }
          : {
              purchaseDate: values.purchaseDate?.format("YYYY-MM-DD"),
              warrantyExpiry: values.warrantyExpiry?.format("YYYY-MM-DD"),
              lastMaintenance: values.lastMaintenance?.format("YYYY-MM-DD"),
              nextMaintenance: values.nextMaintenance?.format("YYYY-MM-DD"),
            }),
      };

      if (editingItem) {
        // Update existing item
        if (activeTab === "medicines") {
          const updatedMedicines = medicines.map((med) =>
            med.id === editingItem.id ? { ...med, ...itemData } : med
          );
          setMedicines(updatedMedicines);
        } else {
          const updatedEquipment = equipment.map((eq) =>
            eq.id === editingItem.id ? { ...eq, ...itemData } : eq
          );
          setEquipment(updatedEquipment);
        }
        message.success("Cập nhật thành công!");
      } else {
        // Create new item
        const newItem = {
          id: Date.now(),
          code: `${activeTab === "medicines" ? "MED" : "EQP"}${String(
            Date.now()
          ).slice(-3)}`,
          usageCount: 0,
          ...(activeTab === "equipment" && {
            availableQuantity: itemData.quantity,
          }),
          ...itemData,
        };

        if (activeTab === "medicines") {
          setMedicines([newItem, ...medicines]);
        } else {
          setEquipment([newItem, ...equipment]);
        }
        message.success("Tạo mới thành công!");
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Lưu thất bại!");
    }
  };

  const getStatusColor = (status, type = "medicine") => {
    if (type === "medicine") {
      switch (status) {
        case "available":
          return "green";
        case "low_stock":
          return "orange";
        case "out_of_stock":
          return "red";
        case "expired":
          return "red";
        case "expired_soon":
          return "orange";
        default:
          return "default";
      }
    } else {
      switch (status) {
        case "available":
          return "green";
        case "in_use":
          return "blue";
        case "maintenance":
          return "orange";
        case "broken":
          return "red";
        default:
          return "default";
      }
    }
  };

  const getStatusText = (status, type = "medicine") => {
    if (type === "medicine") {
      switch (status) {
        case "available":
          return "Có sẵn";
        case "low_stock":
          return "Sắp hết";
        case "out_of_stock":
          return "Hết hàng";
        case "expired":
          return "Hết hạn";
        case "expired_soon":
          return "Sắp hết hạn";
        default:
          return status;
      }
    } else {
      switch (status) {
        case "available":
          return "Có sẵn";
        case "in_use":
          return "Đang sử dụng";
        case "maintenance":
          return "Bảo trì";
        case "broken":
          return "Hỏng";
        default:
          return status;
      }
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "excellent":
        return "green";
      case "good":
        return "blue";
      case "fair":
        return "orange";
      case "poor":
        return "red";
      case "needs_maintenance":
        return "orange";
      default:
        return "default";
    }
  };

  const getConditionText = (condition) => {
    switch (condition) {
      case "excellent":
        return "Xuất sắc";
      case "good":
        return "Tốt";
      case "fair":
        return "Khá";
      case "poor":
        return "Kém";
      case "needs_maintenance":
        return "Cần bảo trì";
      default:
        return condition;
    }
  };

  const filteredData = (
    activeTab === "medicines" ? medicines : equipment
  ).filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const medicineColumns = [
    {
      title: "Mã thuốc",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Tên thuốc",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      ellipsis: true,
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 120,
      render: (_, record) => (
        <div>
          <Text strong>
            {record.quantity} {record.unit}
          </Text>
          <br />
          <Progress
            percent={Math.round((record.quantity / record.maxQuantity) * 100)}
            size="small"
            status={
              record.quantity <= record.minQuantity ? "exception" : "success"
            }
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
      width: 120,
      render: (date) => {
        const isExpiringSoon = dayjs(date).diff(dayjs(), "months") < 3;
        return (
          <Text type={isExpiringSoon ? "warning" : undefined}>
            {dayjs(date).format("DD/MM/YYYY")}
          </Text>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status, "medicine")}>
          {getStatusText(status, "medicine")}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const equipmentColumns = [
    {
      title: "Mã thiết bị",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
      width: 100,
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 100,
      render: (_, record) => (
        <div>
          <Text strong>
            {record.availableQuantity}/{record.quantity}
          </Text>
          <br />
          <Text type="secondary">có sẵn</Text>
        </div>
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      key: "condition",
      width: 120,
      render: (condition) => (
        <Tag color={getConditionColor(condition)}>
          {getConditionText(condition)}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status, "equipment")}>
          {getStatusText(status, "equipment")}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Statistics
  const medicineStats = {
    total: medicines.length,
    available: medicines.filter((m) => m.status === "available").length,
    lowStock: medicines.filter((m) => m.status === "low_stock").length,
    expiringSoon: medicines.filter((m) => m.status === "expired_soon").length,
  };

  const equipmentStats = {
    total: equipment.length,
    available: equipment.filter((e) => e.status === "available").length,
    inUse: equipment.filter((e) => e.status === "in_use").length,
    needsMaintenance: equipment.filter(
      (e) => e.condition === "needs_maintenance"
    ).length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2} className="text-blue-600 mb-2">
          <ToolOutlined className="mr-2" />
          Quản Lý Thuốc & Thiết Bị
        </Title>
        <Text type="secondary">
          Quản lý kho thuốc và thiết bị y tế của trường
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        {activeTab === "medicines" ? (
          <>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Tổng số thuốc"
                  value={medicineStats.total}
                  prefix={<MedicineBoxOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Có sẵn"
                  value={medicineStats.available}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Sắp hết"
                  value={medicineStats.lowStock}
                  valueStyle={{ color: "#cf1322" }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Sắp hết hạn"
                  value={medicineStats.expiringSoon}
                  valueStyle={{ color: "#d46b08" }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
          </>
        ) : (
          <>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Tổng thiết bị"
                  value={equipmentStats.total}
                  prefix={<ToolOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Có sẵn"
                  value={equipmentStats.available}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Đang sử dụng"
                  value={equipmentStats.inUse}
                  valueStyle={{ color: "#1890ff" }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card>
                <Statistic
                  title="Cần bảo trì"
                  value={equipmentStats.needsMaintenance}
                  valueStyle={{ color: "#d46b08" }}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Alerts */}
      {activeTab === "medicines" && medicineStats.lowStock > 0 && (
        <Alert
          message="Cảnh báo kho thuốc"
          description={`Có ${medicineStats.lowStock} loại thuốc sắp hết. Vui lòng bổ sung kịp thời.`}
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {activeTab === "equipment" && equipmentStats.needsMaintenance > 0 && (
        <Alert
          message="Cảnh báo thiết bị"
          description={`Có ${equipmentStats.needsMaintenance} thiết bị cần bảo trì. Vui lòng kiểm tra và xử lý.`}
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <MedicineBoxOutlined />
                Thuốc
              </span>
            }
            key="medicines"
          >
            {/* Filter and Actions for Medicines */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Tìm kiếm thuốc..."
                  prefix={<SearchOutlined />}
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={6} md={4}>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="available">Có sẵn</Option>
                  <Option value="low_stock">Sắp hết</Option>
                  <Option value="expired_soon">Sắp hết hạn</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={12} className="text-right">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Thêm thuốc mới
                </Button>
              </Col>
            </Row>

            <Table
              columns={medicineColumns}
              dataSource={filteredData}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} loại thuốc`,
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <span>
                <ToolOutlined />
                Thiết bị
              </span>
            }
            key="equipment"
          >
            {/* Filter and Actions for Equipment */}
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Tìm kiếm thiết bị..."
                  prefix={<SearchOutlined />}
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={6} md={4}>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={setStatusFilter}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="available">Có sẵn</Option>
                  <Option value="in_use">Đang sử dụng</Option>
                  <Option value="maintenance">Bảo trì</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={12} className="text-right">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                >
                  Thêm thiết bị mới
                </Button>
              </Col>
            </Row>

            <Table
              columns={equipmentColumns}
              dataSource={filteredData}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} thiết bị`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          editingItem
            ? `Chỉnh Sửa ${activeTab === "medicines" ? "Thuốc" : "Thiết Bị"}`
            : `Thêm ${activeTab === "medicines" ? "Thuốc" : "Thiết Bị"} Mới`
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {activeTab === "medicines" ? (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên thuốc"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên thuốc!" },
                  ]}
                >
                  <Input placeholder="Nhập tên thuốc..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Loại thuốc"
                  rules={[
                    { required: true, message: "Vui lòng nhập loại thuốc!" },
                  ]}
                >
                  <Input placeholder="Nhập loại thuốc..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="manufacturer" label="Nhà sản xuất">
                  <Input placeholder="Nhập nhà sản xuất..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="batchNumber" label="Số lô">
                  <Input placeholder="Nhập số lô..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="expiryDate"
                  label="Hạn sử dụng"
                  rules={[
                    { required: true, message: "Vui lòng chọn hạn sử dụng!" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="quantity"
                  label="Số lượng"
                  rules={[
                    { required: true, message: "Vui lòng nhập số lượng!" },
                  ]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="unit" label="Đơn vị">
                  <Input placeholder="viên, chai, ống..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="minQuantity" label="Số lượng tối thiểu">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="maxQuantity" label="Số lượng tối đa">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="storageLocation" label="Vị trí lưu trữ">
                  <Input placeholder="Nhập vị trí lưu trữ..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="storageCondition" label="Điều kiện bảo quản">
                  <TextArea rows={2} placeholder="Nhập điều kiện bảo quản..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="notes" label="Ghi chú">
                  <TextArea rows={3} placeholder="Nhập ghi chú..." />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên thiết bị"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên thiết bị!" },
                  ]}
                >
                  <Input placeholder="Nhập tên thiết bị..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="type" label="Loại thiết bị">
                  <Input placeholder="Nhập loại thiết bị..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="manufacturer" label="Nhà sản xuất">
                  <Input placeholder="Nhập nhà sản xuất..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="model" label="Model">
                  <Input placeholder="Nhập model..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="serialNumber" label="Số serial">
                  <Input placeholder="Nhập số serial..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="quantity" label="Số lượng">
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="purchaseDate" label="Ngày mua">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="warrantyExpiry" label="Hết hạn bảo hành">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="location" label="Vị trí">
                  <Input placeholder="Nhập vị trí thiết bị..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="condition" label="Tình trạng">
                  <Select placeholder="Chọn tình trạng">
                    <Option value="excellent">Xuất sắc</Option>
                    <Option value="good">Tốt</Option>
                    <Option value="fair">Khá</Option>
                    <Option value="poor">Kém</Option>
                    <Option value="needs_maintenance">Cần bảo trì</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select placeholder="Chọn trạng thái">
                    <Option value="available">Có sẵn</Option>
                    <Option value="in_use">Đang sử dụng</Option>
                    <Option value="maintenance">Bảo trì</Option>
                    <Option value="broken">Hỏng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="lastMaintenance" label="Bảo trì cuối">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="nextMaintenance" label="Bảo trì tiếp theo">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="notes" label="Ghi chú">
                  <TextArea rows={3} placeholder="Nhập ghi chú..." />
                </Form.Item>
              </Col>
            </Row>
          )}

          <div className="text-right mt-4">
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingItem ? "Cập nhật" : "Tạo mới"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi Tiết ${activeTab === "medicines" ? "Thuốc" : "Thiết Bị"}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedItem && (
          <div>
            {activeTab === "medicines" ? (
              <Descriptions title="Thông Tin Thuốc" bordered column={2}>
                <Descriptions.Item label="Mã thuốc">
                  {selectedItem.code}
                </Descriptions.Item>
                <Descriptions.Item label="Tên thuốc">
                  {selectedItem.name}
                </Descriptions.Item>
                <Descriptions.Item label="Loại thuốc">
                  {selectedItem.type}
                </Descriptions.Item>
                <Descriptions.Item label="Nhà sản xuất">
                  {selectedItem.manufacturer}
                </Descriptions.Item>
                <Descriptions.Item label="Số lô">
                  {selectedItem.batchNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Hạn sử dụng">
                  {dayjs(selectedItem.expiryDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {selectedItem.quantity} {selectedItem.unit}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng tối thiểu">
                  {selectedItem.minQuantity} {selectedItem.unit}
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí lưu trữ" span={2}>
                  {selectedItem.storageLocation}
                </Descriptions.Item>
                <Descriptions.Item label="Điều kiện bảo quản" span={2}>
                  {selectedItem.storageCondition}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedItem.status, "medicine")}>
                    {getStatusText(selectedItem.status, "medicine")}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Số lần sử dụng">
                  {selectedItem.usageCount}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật cuối">
                  {dayjs(selectedItem.lastUpdated).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedItem.notes}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Descriptions title="Thông Tin Thiết Bị" bordered column={2}>
                <Descriptions.Item label="Mã thiết bị">
                  {selectedItem.code}
                </Descriptions.Item>
                <Descriptions.Item label="Tên thiết bị">
                  {selectedItem.name}
                </Descriptions.Item>
                <Descriptions.Item label="Loại thiết bị">
                  {selectedItem.type}
                </Descriptions.Item>
                <Descriptions.Item label="Nhà sản xuất">
                  {selectedItem.manufacturer}
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  {selectedItem.model}
                </Descriptions.Item>
                <Descriptions.Item label="Số serial">
                  {selectedItem.serialNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Số lượng">
                  {selectedItem.availableQuantity}/{selectedItem.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày mua">
                  {dayjs(selectedItem.purchaseDate).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Hết hạn bảo hành">
                  {dayjs(selectedItem.warrantyExpiry).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Vị trí" span={2}>
                  {selectedItem.location}
                </Descriptions.Item>
                <Descriptions.Item label="Tình trạng">
                  <Tag color={getConditionColor(selectedItem.condition)}>
                    {getConditionText(selectedItem.condition)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedItem.status, "equipment")}>
                    {getStatusText(selectedItem.status, "equipment")}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Bảo trì cuối">
                  {dayjs(selectedItem.lastMaintenance).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Bảo trì tiếp theo">
                  {dayjs(selectedItem.nextMaintenance).format("DD/MM/YYYY")}
                </Descriptions.Item>
                <Descriptions.Item label="Số lần sử dụng">
                  {selectedItem.usageCount}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedItem.notes}
                </Descriptions.Item>
              </Descriptions>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default MedicineEquipmentManagement;
