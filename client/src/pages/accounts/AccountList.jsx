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
  Statistic,
  Popconfirm,
  message,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  createAccounts,
  updateUserInfo,
  deleteUser,
  getAllAccounts,
  getUsersFromFile,
  activeAccount,
} from "../../api/userApi";
import axiosClient from "../../api/axiosClient";

const { Title, Text } = Typography;
const { Option } = Select;

function AccountList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Lấy danh sách tài khoản từ API (full dữ liệu)
  const fetchAccounts = async () => {
    try {
      // Gọi đúng endpoint GET /admin/get-all-account
      const res = await getAllAccounts();
      console.log('API /admin/get-all-account response:', res); // Debug dữ liệu trả về
      // Thêm log object mẫu để xác định trường dữ liệu thực tế
      if (Array.isArray(res.data) && res.data.length > 0) {
        console.log('Sample account object:', res.data[0]);
      }
      // Lấy đúng mảng tài khoản từ res.data
      const data = Array.isArray(res.data) ? res.data : [];
      setAccounts(data);
    } catch (err) {
      setAccounts([]);
      message.error("Không thể tải danh sách tài khoản từ server!");
    }
  };

  // Thống kê
  const stats = {
    total: accounts.length,
    // Không có trường trạng thái/role text, nên chỉ đếm tổng
  };

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    console.log('Edit record:', record); // Log để kiểm tra dữ liệu khi bấm sửa
    form.setFieldsValue(record);
    setEditingId(record.userID);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Giá trị form gửi lên update:', values);
      if (editingId) {
        // Gọi API update user - chỉ gửi các trường có giá trị, đúng tên trường backend yêu cầu (chữ thường)
        const payload = {};
        if (values.userName) payload.userName = values.userName;
        if (values.password) payload.password = values.password;
        if (values.name) payload.name = values.name;
        if (values.email) payload.email = values.email;
        if (values.phone) payload.phone = values.phone;
        console.log('Payload gửi lên API updateUserInfo:', payload);
        await updateUserInfo(payload);
        message.success("Cập nhật tài khoản thành công!");
      } else {
        // Gửi lên API tạo tài khoản đúng định dạng backend yêu cầu
        const payload = [{
          userName: values.userName,
          password: values.password,
          roleName: values.roleName
        }];
        await createAccounts(payload);
        message.success("Thêm tài khoản thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
      await fetchAccounts(); // Đồng bộ lại danh sách
    } catch (err) {
      // Hiển thị lỗi chi tiết nếu có
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Lưu tài khoản thất bại!");
      }
    }
  };

  const handleDelete = async (record) => {
    try {
      if (record.roleName === "Admin") {
        message.error("Không thể xóa tài khoản Admin!");
        return;
      }
      // Gọi API xóa user - chỉ gửi UserName đúng với backend
      await deleteUser(record.userName);
      message.success("Xóa tài khoản thành công!");
      await fetchAccounts(); // Đồng bộ lại danh sách
    } catch (err) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Xóa tài khoản thất bại!");
      }
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleViewDetails = (record) => {
    setSelectedAccount(record);
    setDetailModalVisible(true);
  };

  // Thêm hàm import tài khoản từ file
  const handleImportAccounts = async (file) => {
    try {
      await getUsersFromFile(file);
      message.success("Import tài khoản thành công!");
      await fetchAccounts();
    } catch (err) {
      message.error("Import tài khoản thất bại!");
    }
  };

  const columns = [
    {
      title: "Mã người dùng",
      dataIndex: "userID",
      key: "userID",
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Mật khẩu",
      dataIndex: "password",
      key: "password",
      render: (text) => text ? text : <span style={{color: '#aaa'}}>(trống)</span>
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active, record) => (
        <>
          <Tag color={active ? "green" : "red"}>{active ? "Kích hoạt" : "Khoá"}</Tag>
          {!active && (
            <Button
              size="small"
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={async () => {
                try {
                  // Gọi API mở khoá tài khoản qua userApi.js
                  await activeAccount(record.userName);
                  message.success("Đã mở khoá tài khoản!");
                  await fetchAccounts();
                } catch (err) {
                  message.error("Mở khoá thất bại!");
                }
              }}
            >
              Mở khoá
            </Button>
          )}
        </>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài khoản này?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  useEffect(() => {
    fetchAccounts();
  }, []);
  return (
    <div className="p-0 sm:p-8 bg-gradient-to-br from-blue-200 via-white to-blue-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl">
        {/* Header tinh tế hơn */}
        <div className="mb-14 flex items-center gap-8">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-blue-700 rounded-full p-7 shadow-2xl flex items-center justify-center border-4 border-white animate-fade-in">
              <UserOutlined className="text-white text-5xl drop-shadow-xl" />
            </div>
            <span className="absolute -bottom-3 -right-3 bg-white rounded-full px-3 py-1 text-xs text-blue-700 font-bold shadow border border-blue-100 select-none tracking-wide" style={{letterSpacing: 1}}>ACCOUNT</span>
          </div>
          <div className="flex flex-col gap-1">
            <Title level={2} className="text-blue-900 mb-0 font-black tracking-widest drop-shadow-xl leading-tight" style={{letterSpacing: 2}}>Quản Lý Tài Khoản</Title>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse shadow"></span>
              <Text type="secondary" className="text-lg font-medium text-gray-600 italic tracking-wide">Quản lý tài khoản người dùng hệ thống</Text>
            </div>
          </div>
        </div>
        <Row gutter={[24, 24]} className="mb-10">
          <Col xs={24} sm={12} md={6}>
            <Card className="rounded-3xl shadow-2xl border-blue-200 bg-white/90 hover:shadow-blue-200 transition-all duration-200">
              <Statistic title={<span className="text-gray-500 font-semibold">Tổng tài khoản</span>} value={stats.total} prefix={<UserOutlined />} valueStyle={{ color: '#2563eb', fontWeight: 800 }} />
            </Card>
          </Col>
        </Row>
        <Card className="rounded-3xl shadow-2xl border-blue-200 bg-white/95">
          <Row gutter={[16, 16]} className="mb-8 flex flex-wrap items-center">
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Tìm kiếm tài khoản..."
                prefix={<SearchOutlined />}
                allowClear
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                className="rounded-2xl shadow border-blue-300 focus:border-blue-500 focus:shadow-lg transition-all duration-200 text-lg px-4 py-2"
                size="large"
              />
            </Col>
            <Col xs={24} sm={12} md={16} className="flex justify-end items-center gap-6">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="rounded-2xl shadow-xl bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 font-bold px-8 py-2 text-lg" size="large">
                Thêm tài khoản
              </Button>
              <label className="inline-flex items-center cursor-pointer bg-blue-50 border border-blue-200 rounded-2xl px-5 py-2 ml-2 hover:bg-blue-100 transition gap-2 shadow-md">
                <span className="text-blue-600 font-semibold flex items-center gap-1"><UploadIcon />Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: "none" }}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      handleImportAccounts(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={accounts.filter(
              (account) =>
                (account.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
                account.userID?.toString().includes(searchText))
            )}
            rowKey="userID"
            className="rounded-3xl overflow-hidden shadow-lg border border-blue-100 bg-white/80 hover:bg-blue-50 transition-all duration-150 text-base"
            pagination={{ pageSize: 8, showSizeChanger: false }}
            rowClassName={() => 'hover:bg-blue-100 transition-all duration-150'}
          />
        </Card>
        {/* Modal Thêm/Sửa */}
        <Modal
          title={<span className="font-extrabold text-blue-700 text-xl">{editingId ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}</span>}
          open={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingId(null);
          }}
          width={600}
          okText={editingId ? "Cập nhật" : "Tạo mới"}
          cancelText="Hủy"
          className="rounded-3xl"
          bodyStyle={{ borderRadius: 32, padding: 40, background: 'linear-gradient(135deg,#e0eaff 60%,#f0f6ff 100%)' }}
        >
          <Form form={form} layout="vertical" className="space-y-3">
            {editingId && (
              <Form.Item
                name="userID"
                label={<span className="font-bold">Mã người dùng</span>}
                rules={[{ required: true, message: "Vui lòng nhập mã người dùng" }]}
              >
                <Input disabled className="rounded-2xl text-base" />
              </Form.Item>
            )}
            <Form.Item
              name="userName"
              label={<span className="font-bold">Tên đăng nhập</span>}
              rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
            >
              <Input className="rounded-2xl text-base" />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span className="font-bold">Mật khẩu</span>}
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password className="rounded-2xl text-base" />
            </Form.Item>
            <Form.Item
              name="roleName"
              label={<span className="font-bold">Vai trò</span>}
              rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
            >
              <Select placeholder="Chọn vai trò" className="rounded-2xl text-base">
                <Option value="Nurse">Nurse</Option>
                <Option value="Parent">Parent</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
        {/* Modal Chi tiết tài khoản */}
        <Modal
          title={<span className="font-extrabold text-blue-700 text-xl">Chi tiết tài khoản</span>}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)} className="rounded-2xl font-bold text-base">Đóng</Button>,
          ]}
          width={500}
          className="rounded-3xl"
          bodyStyle={{ borderRadius: 32, background: 'linear-gradient(135deg,#e0eaff 60%,#f0f6ff 100%)' }}
        >
          {selectedAccount && (
            <div>
              <Descriptions bordered column={1} size="middle" className="rounded-3xl bg-white/95 text-base">
                <Descriptions.Item label={<span className="font-bold">Mã người dùng</span>}>{selectedAccount.userID}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Tên đăng nhập</span>}>{selectedAccount.userName}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Mật khẩu</span>}>{selectedAccount.password}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Vai trò</span>}>{selectedAccount.roleName}</Descriptions.Item>
                <Descriptions.Item label={<span className="font-bold">Trạng thái</span>}>{selectedAccount.isActive ? <Tag color="green">Kích hoạt</Tag> : <Tag color="red">Khoá</Tag>}</Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default AccountList;

// Custom icon cho import
function UploadIcon() {
  return <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="16" width="16" height="4" rx="2" fill="#2563eb" fillOpacity=".1"/></svg>;
}
