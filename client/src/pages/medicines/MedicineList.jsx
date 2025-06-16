import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Card,
  Tag,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";

const { Option } = Select;

function MedicineList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Mock data - replace with actual API calls
  const medicines = [
    {
      key: "1",
      id: "T001",
      name: "Paracetamol",
      type: "Thuốc hạ sốt",
      quantity: 100,
      unit: "Viên",
      expiryDate: "2025-12-31",
      status: "Còn hàng",
    },
    {
      key: "2",
      id: "T002",
      name: "Vitamin C",
      type: "Vitamin",
      quantity: 50,
      unit: "Hộp",
      expiryDate: "2025-06-30",
      status: "Còn hàng",
    },
  ];

  const columns = [
    {
      title: "Mã thuốc",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên thuốc",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Loại thuốc",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Hạn sử dụng",
      dataIndex: "expiryDate",
      key: "expiryDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Còn hàng" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: () => (
        <Space size="middle">
          <Button type="link">Chi tiết</Button>
          <Button type="link">Sửa</Button>
          <Button type="link" danger>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];
  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Form values:", values);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  return (
    <div>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Input
            placeholder="Tìm kiếm thuốc..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm thuốc
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={medicines.filter(
            (medicine) =>
              medicine.name.toLowerCase().includes(searchText.toLowerCase()) ||
              medicine.id.toLowerCase().includes(searchText.toLowerCase())
          )}
        />
      </Card>

      <Modal
        title="Thêm/Chỉnh sửa thông tin thuốc"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Mã thuốc"
            rules={[{ required: true, message: "Vui lòng nhập mã thuốc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên thuốc"
            rules={[{ required: true, message: "Vui lòng nhập tên thuốc" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại thuốc"
            rules={[{ required: true, message: "Vui lòng chọn loại thuốc" }]}
          >
            <Select>
              <Option value="Thuốc hạ sốt">Thuốc hạ sốt</Option>
              <Option value="Vitamin">Vitamin</Option>
              <Option value="Thuốc kháng sinh">Thuốc kháng sinh</Option>
              <Option value="Thuốc bổ">Thuốc bổ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="unit"
            label="Đơn vị"
            rules={[{ required: true, message: "Vui lòng chọn đơn vị" }]}
          >
            <Select>
              <Option value="Viên">Viên</Option>
              <Option value="Hộp">Hộp</Option>
              <Option value="Chai">Chai</Option>
              <Option value="Gói">Gói</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="expiryDate"
            label="Hạn sử dụng"
            rules={[{ required: true, message: "Vui lòng nhập hạn sử dụng" }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select>
              <Option value="Còn hàng">Còn hàng</Option>
              <Option value="Sắp hết">Sắp hết</Option>
              <Option value="Hết hàng">Hết hàng</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MedicineList;
