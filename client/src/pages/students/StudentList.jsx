import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Space, Card } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

function StudentList() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Mock data - replace with actual API calls
  const students = [
    {
      key: '1',
      id: 'HS001',
      name: 'Nguyễn Văn A',
      class: '1A',
      dateOfBirth: '2018-05-15',
      gender: 'Nam',
      parentName: 'Nguyễn Văn B',
      parentPhone: '0123456789',
      healthStatus: 'Tốt'
    },
    {
      key: '2',
      id: 'HS002',
      name: 'Trần Thị B',
      class: '1A',
      dateOfBirth: '2018-06-20',
      gender: 'Nữ',
      parentName: 'Trần Thị C',
      parentPhone: '0987654321',
      healthStatus: 'Tốt'
    }
  ];

  const columns = [
    {
      title: 'Mã học sinh',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Lớp',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Tên phụ huynh',
      dataIndex: 'parentName',
      key: 'parentName',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'parentPhone',
      key: 'parentPhone',
    },
    {
      title: 'Tình trạng sức khỏe',
      dataIndex: 'healthStatus',
      key: 'healthStatus',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>
            Chỉnh sửa
          </Button>
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

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log('Form values:', values);
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
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="Tìm kiếm học sinh..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm học sinh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={students.filter(student =>
            student.name.toLowerCase().includes(searchText.toLowerCase()) ||
            student.id.toLowerCase().includes(searchText.toLowerCase())
          )}
        />
      </Card>

      <Modal
        title="Thêm/Chỉnh sửa thông tin học sinh"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="id"
            label="Mã học sinh"
            rules={[{ required: true, message: 'Vui lòng nhập mã học sinh' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="class"
            label="Lớp"
            rules={[{ required: true, message: 'Vui lòng chọn lớp' }]}
          >
            <Select>
              <Option value="1A">1A</Option>
              <Option value="1B">1B</Option>
              <Option value="2A">2A</Option>
              <Option value="2B">2B</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="parentName"
            label="Tên phụ huynh"
            rules={[{ required: true, message: 'Vui lòng nhập tên phụ huynh' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="parentPhone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="healthStatus"
            label="Tình trạng sức khỏe"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng sức khỏe' }]}
          >
            <Select>
              <Option value="Tốt">Tốt</Option>
              <Option value="Bình thường">Bình thường</Option>
              <Option value="Cần theo dõi">Cần theo dõi</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default StudentList; 